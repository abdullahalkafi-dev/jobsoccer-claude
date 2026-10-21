import fs from "fs";
import { extractText, getDocumentProxy } from "unpdf";
import { getLocalCopy } from "../../storage";

/** Below this many characters a PDF is treated as scanned (image only, no text layer). */
const MIN_TEXT_CHARS = 200;
/** Enough for a CV; keeps the matching prompt small. */
const MAX_TEXT_CHARS = 20_000;

export interface ResumeTextResult {
  text: string;
  pages: number;
  /** "ok", or "no_text_layer" for scanned PDFs (needs OCR, not done yet). */
  status: "ok" | "no_text_layer";
}

export const cleanResumeText = (raw: string): string =>
  raw
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT_CHARS);

export const extractPdfText = async (filePath: string): Promise<ResumeTextResult> => {
  const pdf = await getDocumentProxy(new Uint8Array(await fs.promises.readFile(filePath)));
  const { totalPages, text: raw } = await extractText(pdf, { mergePages: true });
  const text = cleanResumeText(raw ?? "");
  return { text, pages: totalPages, status: text.length >= MIN_TEXT_CHARS ? "ok" : "no_text_layer" };
};

/** Extract text from a stored resume link such as "/docs/cv.pdf" (local disk or bucket). */
export const extractStoredResumeText = async (resumeUrl: string): Promise<ResumeTextResult> => {
  const copy = await getLocalCopy(resumeUrl);
  try {
    return await extractPdfText(copy.path);
  } finally {
    copy.release();
  }
};
