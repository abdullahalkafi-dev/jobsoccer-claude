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
  /** Language Whisper detected in the speech, e.g. "english", "spanish" ("unknown" when it could not be told). */
  language: string;
  /** English caption cues (from the transcript, or the translation for other languages). */
  segments: TCaptionSegment[];
  /**
   * True when `text` is an English translation of speech in another language.
   * Translated text always reads like clean written prose, so text-style signals
   * (e.g. "sounds read from a script") must not be used on it.
   */
  isTranslated: boolean;
  /** What was actually said, in the spoken language. Only set when `isTranslated`. */
  original?: { language: string; text: string; segments: TCaptionSegment[] };
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
 *     Whisper saying "english" is double-checked on the text itself: it sometimes labels
 *     other languages (or mixed speech) as English.
 *  3. Non-English speech is translated to English, so scoring, summaries and
 *     captions are always English. The original-language text is kept next to it.
 * Errors are thrown, never turned into an empty transcript.
 */
const transcribe = async (videoPath: string): Promise<TranscriptionResult> => {
  const model = aiConfig.models.transcribe;
  const translateModel = aiConfig.models.translate;
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

    const detected = String(transcription.language ?? "unknown");
    const originalText: string = transcription.text ?? "";
    const originalSegments = toSegments(transcription);

    // "english" is only trusted when the text agrees; otherwise it goes through the translation path.
    const claimsEnglish = isEnglish(detected);
    if (claimsEnglish && looksEnglish(originalText)) {
      return { text: originalText, language: detected, segments: originalSegments, isTranslated: false, durationSeconds, model, usage };
    }
    const language = claimsEnglish ? "unknown" : detected;

    started = Date.now();
    const translation: any = await aiClient.audio.translations.create({
      file: fs.createReadStream(fileToSend),
      model: translateModel,
      response_format: "verbose_json",
    });
    usage.push(recordUsage("translation", translateModel, noTokens, Date.now() - started));

    const original = { language, text: originalText, segments: originalSegments };
    const translatedText: string = translation.text ?? "";
    if (looksEnglish(translatedText)) {
      return { text: translatedText, language, segments: toSegments(translation), isTranslated: true, original, durationSeconds, model, usage };
    }

    // Whisper sometimes returns the original language unchanged: translate the original lines instead.
    // Without caption lines the whole text is translated as one line (never an empty result).
    const lines: TCaptionSegment[] = originalSegments.length
      ? originalSegments
      : originalText.trim()
      ? [{ start: 0, end: durationSeconds ?? 0, text: originalText.trim() }]
      : [];
    const english = await translateLinesToEnglish(lines, usage);
    return {
      text: english.map((line) => line.text).join(" "),
      language,
      segments: originalSegments.length ? english : [],
      isTranslated: true,
      original,
      durationSeconds,
      model,
      usage,
    };
  } finally {
    if (audioPath) removeTempFile(audioPath);
  }
};

/** An interview answer is never shorter than this; fewer words means the audio had no real speech. */
export const MIN_SPOKEN_WORDS = 15;

const countWords = (text: string): number => (text.match(/[\p{L}\p{N}']+/gu) ?? []).length;

/** True when the transcript holds real speech (also used on transcripts saved before this rule existed). */
export const hasUsableSpeech = (text: string): boolean => countWords(text) >= MIN_SPOKEN_WORDS;

/**
 * Whisper often invents a word or two ("You", "Thank you.") for music, noise or silence.
 * Treat that as no speech at all, so the no-speech handling applies: no captions, no scoring,
 * and the candidate can upload again at once.
 */
export const transcribeVideoFile = async (videoPath: string): Promise<TranscriptionResult> => {
  const result = await transcribe(videoPath);
  return hasUsableSpeech(result.text) ? result : { ...result, text: "", segments: [], isTranslated: false, original: undefined };
};
