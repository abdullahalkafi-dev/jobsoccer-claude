import { SchemaDefinition } from "mongoose";

/**
 * Verification of a record (experience, education, licence) by an admin:
 * the candidate uploads a supporting document, an admin approves or rejects it.
 * Added to the three record schemas, so the fields exist in one place only.
 */
export type TVerificationStatus = "none" | "pending" | "approved" | "rejected";

export type TVerificationFields = {
  /** Public path of the supporting PDF (e.g. "docs/contract-x.pdf"). */
  documentUrl?: string;
  verificationStatus?: TVerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
  /** Short reason shown to the candidate when a document is rejected. */
  verificationNote?: string;
};

export const verificationFields: SchemaDefinition = {
  documentUrl: { type: String, trim: true },
  verificationStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none", index: true },
  verifiedAt: { type: Date },
  verifiedBy: { type: String },
  verificationNote: { type: String, trim: true },
};

/** Fields only the server or an admin may set on a record: verification and ownership. */
const SERVER_OWNED_KEYS = [
  "documentUrl",
  "verificationStatus",
  "verifiedAt",
  "verifiedBy",
  "verificationNote",
  "_id",
  "userId",
  "profileId",
  "candidateRole",
  "createdAt",
  "updatedAt",
] as const;

/** What a candidate sends for a record: anything the server owns (verification, owner) is ignored. */
export const withoutServerOwnedFields = <T extends object>(data: T): T => {
  const clean = { ...data } as Record<string, unknown>;
  for (const key of SERVER_OWNED_KEYS) delete clean[key];
  return clean as T;
};

/** True when an edit changes what the record says (so an earlier approval no longer applies). */
export const hasContentChanged = (current: object, changes: object): boolean => {
  const before = current as Record<string, unknown>;
  return Object.entries(changes).some(([key, value]) => value !== undefined && String(value) !== String(before[key] ?? ""));
};

/** Mongo update that takes a record back to "not verified" and drops the old document. */
export const verificationResetUpdate = {
  $set: { verificationStatus: "none" as TVerificationStatus },
  $unset: { documentUrl: "", verifiedAt: "", verifiedBy: "", verificationNote: "" },
};

/** An approved or pending record must be reviewed again after its content was changed. */
export const needsVerificationReset = (current: object, changes: object): boolean =>
  ["approved", "pending"].includes((current as { verificationStatus?: string }).verificationStatus ?? "") && hasContentChanged(current, changes);

/** Mongo update for a candidate's edit: the new values, plus a verification reset when the content changed. */
export const editUpdate = (current: object, changes: object) =>
  needsVerificationReset(current, changes)
    ? { $set: { ...changes, ...verificationResetUpdate.$set }, $unset: verificationResetUpdate.$unset }
    : { $set: changes };

/**
 * Other people only see whether a record is verified. The document itself, the
 * reviewer and the rejection note are private to the owner (and admins).
 */
export const hideVerificationDetails = <T extends object>(records: T[], ownerId: string, viewer?: { id?: string; userType?: string }): T[] =>
  viewer?.id === ownerId || viewer?.userType === "admin"
    ? records
    : records.map((record) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { documentUrl, verificationNote, verifiedBy, ...visible } = record as Record<string, unknown>;
        return visible as T;
      });
