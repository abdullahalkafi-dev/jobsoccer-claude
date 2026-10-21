import { Types } from "mongoose";

export type TCandidateResume = {
  _id?: Types.ObjectId;
  userId: string; // User._id from User collection
  profileId: string; // The actual candidate profile ID
  candidateRole: string;
  resumeFileName: string;
  resumeUrl: string;
  isActive: boolean; // Mark which resume is currently active/primary
  extractedText?: string; // text read from the PDF for AI job matching
  textStatus?: "ok" | "no_text_layer";
  textExtractedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};
