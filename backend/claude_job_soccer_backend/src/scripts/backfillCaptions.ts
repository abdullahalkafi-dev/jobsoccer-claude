/**
 * Spanish + French caption tracks for videos that already have English captions (2026-11).
 *
 *   pnpm captions:backfill --dry-run            lists what would be done; reads the database, writes nothing, no OpenAI calls
 *   pnpm captions:backfill                      does it
 *   options: --limit <n> (videos per run, default all)   --delay-ms <n> (pause between videos, default 1500)
 *
 * Safe to run again: a video whose es/fr tracks exist is skipped, a caption file that already exists is never
 * overwritten, nothing is deleted. Only the new `captions.es` / `captions.fr` fields of a video are written.
 * Run it against staging first; for the live database only when the developer says so.
 */
import { TCaptionPaths, captionPath } from "../shared/ai/captions/captionTracks";
import { parseWebVtt } from "../shared/ai/captions/captionTranslation";
import { TTranslatedCaptionLang } from "../shared/ai/captions/captionTranslation";
import { TCaptionSegment } from "../shared/ai/transcription/transcriber";

export type TBackfillVideo = { userId: string; videoId: string; captionsUrl: string; captions?: TCaptionPaths | null };

export type TBackfillDeps = {
  /** Videos that already have English captions. */
  listVideos: () => AsyncIterable<TBackfillVideo>;
  /** Text of the stored English WebVTT file, or null when it is gone. */
  readEnglishVtt: (captionsUrl: string) => Promise<string | null>;
  /** Spoken language + original-language cues of the cached transcript (if any). */
  readTranscript: (sha256: string) => Promise<{ detectedLanguage?: string; originalSegments?: TCaptionSegment[] } | null>;
  /** Writes the missing files (never overwrites) and returns the paths of the requested languages. */
  writeTracks: (sha256: string, source: { englishCues: TCaptionSegment[]; detectedLanguage?: string | null; originalSegments?: TCaptionSegment[] | null }, langs: TTranslatedCaptionLang[]) => Promise<TCaptionPaths>;
  saveTracks: (video: TBackfillVideo, tracks: TCaptionPaths) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  log: (line: string) => void;
};

export type TBackfillOptions = { dryRun: boolean; limit?: number; delayMs: number };

export type TBackfillResult = { scanned: number; skipped: number; planned: number; done: number; failed: number };

/** Which of es / fr this video still lacks. */
export const missingLangs = (video: Pick<TBackfillVideo, "captions">): TTranslatedCaptionLang[] =>
  (["es", "fr"] as const).filter((lang) => !video.captions?.[lang]);

/** "captions/<sha256>.vtt" -> sha256, or null for any other name. */
export const shaFromCaptionsUrl = (captionsUrl: string): string | null => /(?:^|\/)([a-f0-9]{64})\.vtt$/i.exec(captionsUrl.trim())?.[1]?.toLowerCase() ?? null;

export const runBackfill = async (deps: TBackfillDeps, options: TBackfillOptions): Promise<TBackfillResult> => {
  const result: TBackfillResult = { scanned: 0, skipped: 0, planned: 0, done: 0, failed: 0 };
  let handled = 0;
  for await (const video of deps.listVideos()) {
    result.scanned++;
    const langs = missingLangs(video);
    const sha = shaFromCaptionsUrl(video.captionsUrl);
    if (!langs.length || !sha) {
      result.skipped++;
      continue;
    }
    if (options.limit !== undefined && handled >= options.limit) break;
    handled++;
    if (options.dryRun) {
      result.planned++;
      deps.log(`[dry-run] video ${video.videoId} (user ${video.userId}): would create ${langs.join(", ")} from ${captionPath(sha, "en")}`);
      continue;
    }
    try {
      const vtt = await deps.readEnglishVtt(video.captionsUrl);
      const englishCues = vtt ? parseWebVtt(vtt) : [];
      if (!englishCues.length) {
        result.skipped++;
        deps.log(`video ${video.videoId}: English captions file missing or empty, skipped`);
        continue;
      }
      const transcript = await deps.readTranscript(sha);
      const tracks = await deps.writeTracks(sha, { englishCues, detectedLanguage: transcript?.detectedLanguage, originalSegments: transcript?.originalSegments }, langs);
      await deps.saveTracks(video, tracks);
      result.done++;
      deps.log(`video ${video.videoId}: ${Object.keys(tracks).join(", ") || "nothing"} saved`);
    } catch (error: any) {
      result.failed++;
      deps.log(`video ${video.videoId}: failed (${error.message}); run again to retry`);
    }
    await deps.sleep(options.delayMs);
  }
  return result;
};

const argValue = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const main = async () => {
  // Loaded here so the tests of runBackfill need no database or OpenAI client.
  const [{ default: mongoose }, { default: config }, { getLocalCopy }, { saveTranslatedCaptions }, { getProfileEntry }, { AiTranscript }, { CandidateRole, UserType }, fs] =
    await Promise.all([
      import("mongoose"),
      import("../config"),
      import("../shared/storage"),
      import("../shared/ai/captions/captions"),
      import("../modules/profile/profile.registry"),
      import("../modules/aiEvaluation/aiEvaluation.model"),
      import("../modules/user/user.interface"),
      import("fs"),
    ]);

  const dryRun = process.argv.includes("--dry-run");
  const limit = argValue("--limit") ? Number(argValue("--limit")) : undefined;
  const delayMs = Number(argValue("--delay-ms") ?? 1500);
  await mongoose.connect(config.database_url as string);
  console.log("database:", mongoose.connection.name, dryRun ? "(dry run)" : "(WRITING es/fr caption tracks)");

  const models = Object.values(CandidateRole)
    .map((role) => getProfileEntry(UserType.CANDIDATE, role as string)?.model)
    .filter((model, index, all) => !!model && all.indexOf(model) === index) as any[];
  const modelOf = new Map<string, any>();

  const result = await runBackfill(
    {
      async *listVideos() {
        for (const model of models) {
          const profiles = model.find({ "videos.captionsUrl": { $exists: true, $ne: null } }).select("userId videos").lean().cursor();
          for await (const profile of profiles as AsyncIterable<any>) {
            for (const v of profile.videos ?? []) {
              if (!v.captionsUrl) continue;
              modelOf.set(String(v._id), { model, profileId: profile._id });
              yield { userId: String(profile.userId ?? ""), videoId: String(v._id), captionsUrl: v.captionsUrl, captions: v.captions };
            }
          }
        }
      },
      async readEnglishVtt(captionsUrl) {
        try {
          const copy = await getLocalCopy(captionsUrl);
          try {
            return await fs.promises.readFile(copy.path, "utf8");
          } finally {
            copy.release();
          }
        } catch {
          return null;
        }
      },
      async readTranscript(sha256) {
        const row: any = await AiTranscript.findOne({ sha256 }).select("detectedLanguage originalSegments").lean();
        return row ? { detectedLanguage: row.detectedLanguage, originalSegments: row.originalSegments ?? undefined } : null;
      },
      writeTracks: (sha256, source, langs) => saveTranslatedCaptions(sha256, source, { langs }),
      async saveTracks(video, tracks) {
        const target = modelOf.get(video.videoId);
        const set: Record<string, string> = {};
        for (const lang of ["es", "fr"] as const) if (tracks[lang]) set[`videos.$.captions.${lang}`] = tracks[lang]!;
        if (!target || !Object.keys(set).length) return;
        await target.model.updateOne({ _id: target.profileId, "videos._id": video.videoId }, { $set: set });
      },
      sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
      log: (line) => console.log(line),
    },
    { dryRun, limit, delayMs }
  );
  console.log(result);
  await mongoose.disconnect();
};

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
