import crypto from "crypto";
import fs from "fs";
import { aiConfig } from "../../shared/ai/ai.config";
import { UsageRecord } from "../../shared/ai/client/openaiClient";
import { isEnglishLanguage } from "../../shared/ai/i18n/aiTexts";
import { TCaptionSegment, transcribeVideoFile } from "../../shared/ai/transcription/transcriber";
import { AiTranscript } from "./aiEvaluation.model";

/**
 * Language slot of the cache key. The speech language is detected automatically,
 * so one video file has exactly one cached transcript (English text + caption cues).
 * The key is NOT changed when new fields are added: older cached rows keep working
 * (the original-language fields are simply missing on them).
 */
export const TRANSCRIPT_LANGUAGE_KEY = "auto";

export type TCachedTranscript = {
  sha256: string;
  /** English text. */
  text: string;
  detectedLanguage?: string;
  segments: TCaptionSegment[];
  /** True when `text` is an English translation of speech in another language. */
  isTranslated: boolean;
  /** What was said, in the spoken language (only when translated and stored; rows cached earlier have none). */
  originalText?: string;
  originalSegments?: TCaptionSegment[];
  durationSeconds: number | null;
  /** True when no paid transcription was needed. */
  fromCache: boolean;
  usage: UsageRecord[];
};

export const sha256File = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    fs.createReadStream(filePath)
      .on("data", (chunk) => hash.update(chunk))
      .on("end", () => resolve(hash.digest("hex")))
      .on("error", reject);
  });

/** The cache key for a video file hash (also used by the e2e harness to pre-load transcripts). */
export const transcriptCacheKey = (sha256: string) => ({
  sha256,
  model: aiConfig.models.transcribe,
  language: TRANSCRIPT_LANGUAGE_KEY,
});

/**
 * English transcript for one local video file. The same file (same bytes) is
 * transcribed once, ever: later requests (re-score, captions, another job) read the cache.
 */
export const transcribeCached = async (localPath: string): Promise<TCachedTranscript> => {
  const sha256 = await sha256File(localPath);
  const key = transcriptCacheKey(sha256);

  const cached = await AiTranscript.findOne(key).lean();
  if (cached) {
    return {
      sha256,
      text: cached.text.trim() ? cached.text : "",
      detectedLanguage: cached.detectedLanguage,
      segments: (cached.segments as TCaptionSegment[] | undefined) ?? [],
      // rows cached before isTranslated existed: any non-English language was translated
      isTranslated: cached.isTranslated ?? (!!cached.detectedLanguage && !isEnglishLanguage(cached.detectedLanguage)),
      originalText: cached.originalText || undefined,
      originalSegments: (cached.originalSegments as TCaptionSegment[] | undefined) ?? undefined,
      durationSeconds: cached.durationSeconds ?? null,
      fromCache: true,
      usage: [],
    };
  }

  const result = await transcribeVideoFile(localPath);
  // " " keeps the row valid (text is required) when the video has no speech.
  await AiTranscript.updateOne(
    key,
    {
      $set: {
        text: result.text || " ",
        detectedLanguage: result.language,
        segments: result.segments,
        isTranslated: result.isTranslated,
        originalText: result.original?.text ?? null,
        originalSegments: result.original?.segments ?? [],
        durationSeconds: result.durationSeconds,
      },
    },
    { upsert: true }
  );
  return {
    sha256,
    text: result.text,
    detectedLanguage: result.language,
    segments: result.segments,
    isTranslated: result.isTranslated,
    originalText: result.original?.text,
    originalSegments: result.original?.segments,
    durationSeconds: result.durationSeconds,
    fromCache: false,
    usage: result.usage,
  };
};
