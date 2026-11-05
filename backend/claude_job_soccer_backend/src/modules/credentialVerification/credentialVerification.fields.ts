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
