import fs from "fs";
import path from "path";
import { aiConfig } from "../ai.config";
import { aiClient, recordUsage, UsageRecord } from "../client/openaiClient";
import { extractAudio, getMediaDurationSeconds, removeTempFile } from "../media/audioExtractor";
import { looksEnglish, translateLinesToEnglish } from "./englishTranslation";

/** One caption cue: start/end in seconds, English text. */
export type TCaptionSegment = { start: number; end: number; text: string };

export interface TranscriptionResult {
  /** English text. Used for scoring, whatever language the candidate spoke. */
  text: string;
  /** Language Whisper detected in the speech, e.g. "english", "spanish". */
  language: string;
  /** English caption cues (from the transcript, or the translation for other languages). */
  segments: TCaptionSegment[];
  durationSeconds: number | null;
  model: string;
  usage: UsageRecord[];
}

const isEnglish = (language: string): boolean => /^(en|english)$/i.test(language.trim());

const toSegments = (raw: any): TCaptionSegment[] =>
  (raw?.segments ?? [])
    .map((s: any) => ({ start: Number(s.start), end: Number(s.end), text: String(s.text ?? "").trim() }))
    .filter((s: TCaptionSegment) => s.text && Number.isFinite(s.start) && Number.isFinite(s.end));

/**
 * Speech to text for one video.
 *  1. Audio is extracted first (much smaller upload).
 *  2. The language is detected automatically (the client allows any language).
 *  3. Non-English speech is translated to English, so scoring, summaries and
 *     captions are always English.
 * Errors are thrown, never turned into an empty transcript.
 */
export const transcribeVideoFile = async (videoPath: string): Promise<TranscriptionResult> => {
  const model = aiConfig.models.transcribe;
  const durationSeconds = await getMediaDurationSeconds(videoPath);
  const audioPath = await extractAudio(videoPath);
  const fileToSend = audioPath ?? videoPath;
  const usage: UsageRecord[] = [];

  // Audio models bill by duration; tokens are not reported, so the record only keeps timing.
  const noTokens = { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, reasoningTokens: 0 };

  try {
    const size = fs.statSync(fileToSend).size;
    if (size > aiConfig.media.maxTranscribeBytes) {
      throw new Error(
        `${path.basename(videoPath)}: ${(size / 1024 / 1024).toFixed(1)} MB is over the transcription limit (ffmpeg ${audioPath ? "ok" : "unavailable"})`
      );
    }

    let started = Date.now();
    const transcription: any = await aiClient.audio.transcriptions.create({
      file: fs.createReadStream(fileToSend),
      model,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });
    usage.push(recordUsage("transcription", model, noTokens, Date.now() - started));

    const language = String(transcription.language ?? "unknown");
    if (isEnglish(language)) {
      return {
        text: transcription.text ?? "",
        language,
        segments: toSegments(transcription),
        durationSeconds,
        model,
        usage,
      };
    }

    started = Date.now();
    const translation: any = await aiClient.audio.translations.create({
      file: fs.createReadStream(fileToSend),
      model,
      response_format: "verbose_json",
    });
    usage.push(recordUsage("translation", model, noTokens, Date.now() - started));

    const translatedText: string = translation.text ?? "";
    if (looksEnglish(translatedText)) {
      return { text: translatedText, language, segments: toSegments(translation), durationSeconds, model, usage };
    }

    // Whisper sometimes returns the original language unchanged: translate the original lines instead.
    const english = await translateLinesToEnglish(toSegments(transcription), usage);
    return {
      text: english.map((line) => line.text).join(" "),
      language,
      segments: english,
      durationSeconds,
      model,
      usage,
    };
  } finally {
    if (audioPath) removeTempFile(audioPath);
  }
};
