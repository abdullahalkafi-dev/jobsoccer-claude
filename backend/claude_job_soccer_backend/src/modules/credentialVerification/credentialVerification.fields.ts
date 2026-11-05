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
