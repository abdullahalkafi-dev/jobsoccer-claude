import { JobApply } from "./jobApply.model";
import { TJobApply } from "./jobApply.interface";
import AppError from "../../errors/AppError";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import { aiConfig } from "../../shared/ai/ai.config";
import { Job } from "../job/job.model";
import { User } from "../user/user.model";
import { CandidateEducationService } from "../candidateEducation/candidateEducation.service";
import { CandidateLicensesAndCertificationService } from "../candidateLicensesAndCertification/candidateLicensesAndCertification.service";
import { getCandidateModel } from "../../shared/util/getCandidateModel";
import { FriendList } from "../friendlist/friendlist.model";
import { CandidateRole, UserType } from "../user/user.interface";
import { CandidateExperience } from "../candidateExperience/candidateExperience.model";
import { PREMIUM_MIN_SCORE } from "../profileQuality/profileQuality.interface";
import { VideoService } from "../video/video.service";
import { JobMatchService } from "./jobMatch.service";
import type { Lang } from "../../shared/i18n";

/**
 * Who may apply to which job:
 *  - normal jobs: every candidate with a complete profile;
 *  - premium jobs (marked by an admin): only candidates whose Profile Quality
 *    Score is at least {@link PREMIUM_MIN_SCORE}. Everyone can still SEE them.
 * "Complete" means the required videos are uploaded (client: both videos are
 * required to complete your profile and apply).
 */
const assertCanApply = async (candidate: any, job: any): Promise<void> => {
  if (candidate.userType !== UserType.CANDIDATE) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Only candidates can apply to jobs");
  }
  if (!candidate.profileId) {
    throw new AppError(StatusCodes.NOT_FOUND, "Candidate profile not found. Please complete your profile before applying.");
  }

  if (job.isPremium) {
    const score = candidate.profileQuality?.score ?? 0;
    if (score < PREMIUM_MIN_SCORE) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        `This is a premium opportunity. You need a Profile Quality Score of ${PREMIUM_MIN_SCORE} or more to apply (yours is ${score}).`
      );
    }
  }

  const videos = await VideoService.getStatus(candidate._id.toString()).catch(() => null);
  if (videos && !videos.isComplete) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Please upload your required ${videos.missing.join(" and ").toLowerCase()} video before applying.`
    );
  }
};

/**
 * Apply to a job. The AI match against the job runs in the background, so the
 * candidate gets the answer immediately.
 */
const applyToJob = async (candidateId: string, jobId: string, resumeUrl?: string): Promise<TJobApply> => {
  if (!Types.ObjectId.isValid(candidateId)) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid candidate ID");
  if (!Types.ObjectId.isValid(jobId)) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job ID");

  const job = await Job.findById(jobId).lean();
  if (!job) throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  if (job.status !== "active") {
    throw new AppError(StatusCodes.BAD_REQUEST, "This job is no longer accepting applications");
  }

  // Includes soft-deleted (withdrawn) applications, which are reactivated below.
  const existingApplication = await JobApply.findOne({ jobId, candidateId });
  if (existingApplication && !existingApplication.isDeleted) {
    throw new AppError(StatusCodes.CONFLICT, "You have already applied to this job");
  }

  const candidate = await User.findById(candidateId).lean();
  if (!candidate) throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  await assertCanApply(candidate, job);

  const matchInBackground = aiConfig.evalEnabled;
  let application;
  if (existingApplication) {
    application = await JobApply.findByIdAndUpdate(
      existingApplication._id,
      {
        $set: { appliedAt: new Date(), resumeUrl, isDeleted: false },
        $unset: { matchScore: 1, matchDetails: 1, matchStatus: 1, matchError: 1 },
      },
      { new: true }
    );
  } else {
    application = await JobApply.create({ jobId, candidateId, appliedAt: new Date(), resumeUrl, isDeleted: false });
  }

  await Job.updateOne({ _id: jobId }, { $inc: { applicationCount: 1 } });

  if (matchInBackground) {
    await JobMatchService.queueMatch(application!._id.toString()).catch(() => undefined);
    application = await JobApply.findById(application!._id);
  }
  return application!.toObject();
};

/**
 * Get all applications for a specific job
 * OPTIMIZED: Uses compound index { jobId: 1, isDeleted: 1, matchScore: -1 }
 * Returns applicant name, AI score, and resume download link
 */
const getApplicationsByJob = async (
  jobId: string,
  query: Record<string, any>,
  viewer?: { id: string; userType: string },
  lang: Lang = "en"
) => {
  // Validate job ID
  if (!Types.ObjectId.isValid(jobId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid job ID");
  }

  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
  }
  // Only the employer who posted the job (or an admin) sees its applicants
  if (viewer && viewer.userType !== UserType.ADMIN && job.creator.creatorId.toString() !== viewer.id) {
    throw new AppError(StatusCodes.FORBIDDEN, "You can only view applicants of your own jobs");
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sorting (default: highest AI match first)
  let sortBy: any = { matchScore: -1 };
  if (query.sortBy) {
    if (query.sortBy.startsWith("-")) {
      sortBy = { [query.sortBy.substring(1)]: -1 };
    } else {
      sortBy = { [query.sortBy]: 1 };
    }
  }

  // Query applications
  const applications = await JobApply.find({
    jobId,
    isDeleted: false,
  })
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate("candidateId", "firstName lastName email profileImage role")
    .lean();

  // Get total count for pagination
  const total = await JobApply.countDocuments({
    jobId,
    isDeleted: false,
  });

  // Format response
  const formattedApplications = await Promise.all(applications.map(async (app: any) => ({
    _id: app._id,
    applicantName: `${app.candidateId.firstName} ${app.candidateId.lastName}`,
    applicantEmail: app.candidateId.email,
    applicantProfileImage: app.candidateId.profileImage,
    candidateId: app.candidateId._id,
    candidateRole: app.candidateId.role,
    matchScore: app.matchScore ?? null,
    matchStatus: app.matchStatus ?? (app.matchScore !== undefined ? "completed" : null),
    matchReasons: app.matchDetails ? await JobMatchService.reasonsFor(app._id, app.matchDetails, lang) : null,
    resumeUrl: app.resumeUrl || null,
    appliedAt: app.appliedAt,
    createdAt: app.createdAt,
  })));

  return {
    data: formattedApplications,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

/**
 * Get applicant profile details with necessary info
 * Returns full candidate profile based on their role
 */
/**
 * Who may open an applicant's full profile: the candidate, an admin, an employer
 * the candidate applied to, or a connection the candidate accepted.
 */
const canViewApplicant = async (viewer: { id: string; userType: string }, candidateId: string): Promise<boolean> => {
  if (viewer.userType === UserType.ADMIN || viewer.id === candidateId) return true;
  const ownJobIds = await Job.find({ "creator.creatorId": viewer.id }).distinct("_id");
  if (ownJobIds.length && (await JobApply.exists({ candidateId, jobId: { $in: ownJobIds }, isDeleted: false }))) {
    return true;
  }
  return !!(await FriendList.exists({
    status: "accepted",
    $or: [
      { senderId: viewer.id, receiverId: candidateId },
      { senderId: candidateId, receiverId: viewer.id },
    ],
  }));
};

const getApplicantProfile = async (
  candidateId: string,
  viewer?: { id: string; userType: string }
) => {
  // Validate candidate ID
  if (!Types.ObjectId.isValid(candidateId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid candidate ID");
  }
  if (viewer && !(await canViewApplicant(viewer, candidateId))) {
    throw new AppError(StatusCodes.FORBIDDEN, "This candidate has not applied to your jobs or shared their profile with you");
  }

  // Get user/candidate basic info
  const user = await User.findById(candidateId).lean();
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "Candidate not found");
  }

  if (user.userType !== "candidate") {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not a candidate");
  }

  // Get profile details based on role
  const candidateModel = getCandidateModel(user.role as CandidateRole);
  const profile = await candidateModel.findById(user.profileId).lean();

  if (!profile) {
    throw new AppError(StatusCodes.NOT_FOUND, "Candidate profile not found");
  }
  const educations = await CandidateEducationService.getAllEducationsByUser(
    candidateId
  );
  const experiences = await CandidateExperience.find({ userId: candidateId }).lean();
  const certifications =
    await CandidateLicensesAndCertificationService.getAllLicensesAndCertificationsByUser(
      candidateId
    );

  // Return combined user and profile data
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    profile,
    educations,
    experiences,
    certifications,
  };
};

/**
 * Get candidate's own applications (for candidate to see their applied jobs)
 */
const getCandidateApplications = async (
  candidateId: string,
  query: Record<string, any>
) => {
  // Validate candidate ID
  if (!Types.ObjectId.isValid(candidateId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid candidate ID");
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Query applications
  const applications = await JobApply.find({
    candidateId,
    isDeleted: false,
  })
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("jobId")
    .lean();

  // Get total count
  const total = await JobApply.countDocuments({
    candidateId,
    isDeleted: false,
  });

  return {
    data: applications,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete/withdraw an application
 */
const deleteApplication = async (applicationId: string, userId: string) => {
  // Validate application ID
  if (!Types.ObjectId.isValid(applicationId)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid application ID");
  }

  // Get application
  const application = await JobApply.findById(applicationId);
  if (!application) {
    throw new AppError(StatusCodes.NOT_FOUND, "Application not found");
  }

  // Check authorization (only the candidate who applied can withdraw)
  if (application.candidateId.toString() !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this application"
    );
  }

  // Soft delete
  await JobApply.updateOne({ _id: applicationId }, { isDeleted: true });

  // Decrement job application count
  await Job.updateOne(
    { _id: application.jobId },
    { $inc: { applicationCount: -1 } }
  );

  return { message: "Application withdrawn successfully" };
};

export const JobApplyService = {
  applyToJob,
  getApplicationsByJob,
  getApplicantProfile,
  getCandidateApplications,
  deleteApplication,
};
