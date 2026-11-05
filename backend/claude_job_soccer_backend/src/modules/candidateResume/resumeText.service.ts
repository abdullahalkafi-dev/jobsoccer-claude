import { extractStoredResumeText } from "../../shared/ai/resume/resumeText";
import { logger } from "../../shared/logger/logger";
import { CandidateResume } from "./candidateResume.model";

/**
 * Text of a candidate's stored CV (PDF), read once and cached on the resume record.
 * Returns null when the file has no text layer or cannot be read.
 */
export const getResumeText = async (userId: string, resumeUrl?: string | null): Promise<string | null> => {
  if (!resumeUrl) return null;
  const resume = await CandidateResume.findOne({ userId, resumeUrl });
  if (resume?.extractedText !== undefined && resume.textStatus) return resume.extractedText || null;
  try {
    const result = await extractStoredResumeText(resumeUrl);
    if (resume) {
      resume.extractedText = result.text;
      resume.textStatus = result.status;
      resume.textExtractedAt = new Date();
      await resume.save();
    }
    return result.status === "ok" ? result.text : null;
  } catch (error: any) {
    logger.warn(`Could not read resume ${resumeUrl}`, { error: error.message });
    return null;
  }
};
