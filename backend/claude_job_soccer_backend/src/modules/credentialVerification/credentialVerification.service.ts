import { StatusCodes } from "http-status-codes";
import { Model, Types } from "mongoose";
import AppError from "../../errors/AppError";
import { logger } from "../../shared/logger/logger";
import { persistUploadedFiles } from "../../shared/storage";
import { CandidateEducation } from "../candidateEducation/candidateEducation.model";
import { CandidateExperience } from "../candidateExperience/candidateExperience.model";
import { CandidateLicenseAndCertification } from "../candidateLicensesAndCertification/candidateLicensesAndCertification.model";
import { NotificationService } from "../notification/notification.service";
import { candidateEducationCache } from "../candidateEducation/candidateEducation.cache";
import { candidateExperienceCache } from "../candidateExperience/candidateExpreience.cache";
import { candidateLicensesAndCertificationCache } from "../candidateLicensesAndCertification/candidateLicensesAndCertification.cache";

/** The three kinds of record a candidate can back up with a document. */
export const RECORD_TYPES = ["experience", "education", "license"] as const;
export type TRecordType = (typeof RECORD_TYPES)[number];

const MODELS: Record<TRecordType, Model<any>> = {
  experience: CandidateExperience,
  education: CandidateEducation,
  license: CandidateLicenseAndCertification,
};

const LABELS: Record<TRecordType, string> = {
  experience: "work history",
  education: "education",
  license: "licence or certification",
};

/**
 * The candidate's lists of experience / education / licences are cached for an hour. A document
 * status change (sent, verified, not approved) must show at once, so clear that list's cache.
 */
const clearListCache = async (type: TRecordType, userId: string, profileId?: string): Promise<void> => {
  if (type === "experience") await candidateExperienceCache.invalidateUserCache(userId, profileId);
  else if (type === "education") await candidateEducationCache.invalidateUserCache(userId);
  else await candidateLicensesAndCertificationCache.invalidateUserCache(userId);
};

const loadRecord = async (type: TRecordType, recordId: string) => {
  if (!Types.ObjectId.isValid(recordId)) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid record id");
  const record = await MODELS[type].findById(recordId);
  if (!record) throw new AppError(StatusCodes.NOT_FOUND, "Record not found");
  return record;
};

/**
 * Candidate: attach a supporting PDF to one of their own records.
 * It goes to the admins' queue; the record counts as verified only once approved.
 */
const submitDocument = async (input: { userId: string; type: TRecordType; recordId: string; file: Express.Multer.File }) => {
  const record = await loadRecord(input.type, input.recordId);
  if (String(record.userId) !== input.userId) {
    throw new AppError(StatusCodes.FORBIDDEN, "You can only add documents to your own records");
  }

  record.documentUrl = `docs/${input.file.filename}`;
  record.verificationStatus = "pending";
  record.verificationNote = undefined;
  record.verifiedAt = undefined;
  record.verifiedBy = undefined;
  await record.save();
  await persistUploadedFiles([input.file.path]);
  await clearListCache(input.type, input.userId, record.profileId ? String(record.profileId) : undefined);

  return record.toObject();
};

/** Admin: every document waiting for review, newest first. */
const listPending = async () => {
  const groups = await Promise.all(
    RECORD_TYPES.map(async (type) => {
      const rows = await MODELS[type].find({ verificationStatus: "pending" }).sort({ updatedAt: -1 }).limit(200).lean();
      return rows.map((row: any) => ({ type, ...row }));
    })
  );
  return groups.flat().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

/** Admin: approve or reject a document. The candidate is told, and their score is recalculated. */
const review = async (input: { adminId: string; type: TRecordType; recordId: string; status: "approved" | "rejected"; note?: string }) => {
  const record = await loadRecord(input.type, input.recordId);
  if (!record.documentUrl) throw new AppError(StatusCodes.BAD_REQUEST, "This record has no document to review");

  record.verificationStatus = input.status;
  record.verifiedAt = new Date();
  record.verifiedBy = input.adminId;
  record.verificationNote = input.status === "rejected" ? input.note?.trim() || "The document could not be verified." : undefined;
  await record.save();

  const userId = String(record.userId);
  await clearListCache(input.type, userId, record.profileId ? String(record.profileId) : undefined);
  await NotificationService.sendNotificationToUser(
    userId,
    input.status === "approved" ? "Document approved" : "Document not approved",
    input.status === "approved"
      ? `Your ${LABELS[input.type]} document was verified. It now counts towards your Profile Quality Score.`
      : `Your ${LABELS[input.type]} document was not approved: ${record.verificationNote}`
  ).catch((error: any) => logger.warn("Could not send verification notification", { error: error.message }));
  return record.toObject();
};

export const CredentialVerificationService = { submitDocument, listPending, review };
