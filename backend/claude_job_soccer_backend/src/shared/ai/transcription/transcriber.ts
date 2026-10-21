import fs from "fs";
import path from "path";
import { aiConfig } from "../ai.config";
import { aiClient, recordUsage, UsageRecord } from "../client/openaiClient";
import { extractAudio, getMediaDurationSeconds, removeTempFile } from "../media/audioExtractor";

export interface TranscriptionResult {
  text: string;
  durationSeconds: number | null;
  model: string;
  usage: UsageRecord;
}

/**
 * Speech to text for one video. Audio is extracted first (much smaller upload);
 * errors are thrown, never turned into an empty transcript.
 */
export const transcribeVideoFile = async (videoPath: string): Promise<TranscriptionResult> => {
  const model = aiConfig.models.transcribe;
  const durationSeconds = await getMediaDurationSeconds(videoPath);
  const audioPath = await extractAudio(videoPath);
  const fileToSend = audioPath ?? videoPath;

  try {
    const size = fs.statSync(fileToSend).size;
    if (size > aiConfig.media.maxTranscribeBytes) {
      throw new Error(
        `${path.basename(videoPath)}: ${(size / 1024 / 1024).toFixed(1)} MB is over the transcription limit (ffmpeg ${audioPath ? "ok" : "unavailable"})`
      );
    }
    const started = Date.now();
    const result = await aiClient.audio.transcriptions.create({
      file: fs.createReadStream(fileToSend),
      model,
      language: aiConfig.transcriptionLanguage,
    });
    // Audio models bill by duration; tokens are not reported here.
    const usage = recordUsage(
      "transcription",
      model,
      { inputTokens: 0, cachedInputTokens: 0, outputTokens: 0, reasoningTokens: 0 },
      Date.now() - started
    );
    return { text: result.text ?? "", durationSeconds, model, usage };
  } finally {
    if (audioPath) removeTempFile(audioPath);
  }
};
