/**
 * One-time migration to the new data model (video kinds, Profile Quality, premium jobs).
 *
 *   node dist/scripts/migrateToNewDataModel.js                                  dry run: only lists what would change
 *   node dist/scripts/migrateToNewDataModel.js --apply --confirm-db <database>   apply (writes a backup first)
 *   node dist/scripts/migrateToNewDataModel.js --restore <backup file>           undo a previous --apply
 *
 * What it changes (every step is skipped when the document is already migrated, so it is safe to run twice):
 *
 *  Candidate profiles (6 collections)
 *   - videos: videoType / duration  ->  kind / durationSeconds. Old names -> Interview | Methodology | Highlights.
 *     On-field and office staff keep the interview and the FIRST methodology-type video; the other videos are
 *     dropped from the profile (the files on disk are never touched).
 *   - videos get lockedUntil = uploadedAt + 3 months when that date is still in the future (the client's lock).
 *   - AiVideoVideoScore is removed (the interview score lives in the AI evaluations).
 *  Users
 *   - AiVideoVideoScore -> interviewScore (0 or empty -> null).
 *   - aiProfileScore is removed (the old generic AI number); profileQuality is calculated by the app afterwards.
 *  Jobs
 *   - requiredAiScore is removed; isPremium = false where missing.
 *  Job applications
 *   - aiMatchPercentage / aiMatchStatus / aiMatchDetails / aiMatchError -> matchScore / matchStatus / matchDetails / matchError.
 *  AI evaluations
 *   - videos[].videoType -> kind.
 *  Experience / education / licences
 *   - verificationStatus = "none" where missing.
 *
 * Safety: --apply first writes every changed document (as it was) to ./logs/data-model-migration-*.json;
 * --confirm-db must equal the connected database name, so a wrong .env cannot be applied by accident.
 */
import fs from "fs";
import path from "path";
import mongoose, { Types } from "mongoose";
// EJSON keeps ObjectId/Date types in the backup file (comes with the MongoDB driver that mongoose ships)
const { EJSON } = mongoose.mongo.BSON;
import config from "../config";
import { assertSafeEnvironment } from "../shared/safety/envGuard";

import { AmateurPlayerProfile } from "../modules/candidate/amateurPlayerProfile/amateurPlayerProfile.model";
import { CollegeUniversityPlayerProfile } from "../modules/candidate/collegeUniversityPlayerProfile/collegeUniversityPlayerProfile.model";
import { HighSchoolPlayerProfile } from "../modules/candidate/highSchoolPlayerProfile/highSchoolPlayerProfile.model";
import { OfficeStaffProfile } from "../modules/candidate/officeStaffProfile/officeStaffProfile.model";
import { OnFieldStaffProfile } from "../modules/candidate/onFieldStaffProfile/onFieldStaffProfile.model";
import { ProfessionalPlayerProfile } from "../modules/candidate/professionalPlayerProfile/professionalPlayerProfile.model";
import { CandidateEducation } from "../modules/candidateEducation/candidateEducation.model";
import { CandidateExperience } from "../modules/candidateExperience/candidateExperience.model";
import { CandidateLicenseAndCertification } from "../modules/candidateLicensesAndCertification/candidateLicensesAndCertification.model";
import { AiEvaluation } from "../modules/aiEvaluation/aiEvaluation.model";
import { Job } from "../modules/job/job.model";
import { JobApply } from "../modules/jobApply/jobApply.model";
import { User } from "../modules/user/user.model";
import { VIDEO_LIMITS, VideoKind } from "../modules/video/video.constant";

type Plan = {
  collection: string;
  _id: Types.ObjectId;
  set?: Record<string, unknown>;
  unset?: string[];
  rename?: Record<string, string>;
  note: string;
  /** The document as it was, for the backup. */
  before: Record<string, unknown>;
};

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const has = (name: string) => process.argv.includes(name);

const isInterviewType = (type?: string): boolean => /interview/i.test(type ?? "");

const addMonths = (date: Date, months: number): Date => {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
};

/** New video list for a staff profile, plus the old videos that were dropped. */
export const migrateStaffVideos = (videos: any[], now = new Date()) => {
  const kept: any[] = [];
  const dropped: any[] = [];
  let interviewKept = false;
  let methodologyKept = false;
  for (const video of videos) {
    const interview = isInterviewType(video.videoType);
    const keep = interview ? !interviewKept : !methodologyKept;
    if (!keep) {
      dropped.push(video);
      continue;
    }
    if (interview) interviewKept = true;
    else methodologyKept = true;
    kept.push(toNewVideo(video, interview ? VideoKind.INTERVIEW : VideoKind.METHODOLOGY, now, true));
  }
  return { kept, dropped };
};

const toNewVideo = (video: any, kind: VideoKind, now: Date, locked: boolean) => {
  const uploadedAt = video.uploadedAt ? new Date(video.uploadedAt) : undefined;
  const until = locked && uploadedAt ? addMonths(uploadedAt, VIDEO_LIMITS.lockMonths) : null;
  return {
    _id: video._id,
    kind,
    url: video.url,
    durationSeconds: Math.round(video.duration ?? video.durationSeconds ?? 0),
    ...(video.title ? { title: video.title } : {}),
    ...(uploadedAt ? { uploadedAt } : {}),
    lockedUntil: until && until > now ? until : null,
  };
};

const PROFILE_MODELS = [
  { model: OnFieldStaffProfile, staff: true },
  { model: OfficeStaffProfile, staff: true },
  { model: ProfessionalPlayerProfile, staff: false },
  { model: AmateurPlayerProfile, staff: false },
  { model: HighSchoolPlayerProfile, staff: false },
  { model: CollegeUniversityPlayerProfile, staff: false },
];

const planAll = async (): Promise<{ plans: Plan[]; dropped: { collection: string; profile: string; video: any }[] }> => {
  const plans: Plan[] = [];
  const dropped: { collection: string; profile: string; video: any }[] = [];
  const now = new Date();

  // Candidate profiles
  for (const { model, staff } of PROFILE_MODELS) {
    const collection = model.collection.name;
    const docs: any[] = await model.collection.find({}).toArray();
    for (const doc of docs) {
      const set: Record<string, unknown> = {};
      const unset: string[] = [];
      const notes: string[] = [];
      const videos: any[] = doc.videos ?? [];
      const needsVideos = videos.some((v) => !v.kind);
      if (needsVideos) {
        if (staff) {
          const result = migrateStaffVideos(videos, now);
          set.videos = result.kept;
          result.dropped.forEach((video) => dropped.push({ collection, profile: String(doc._id), video }));
          notes.push(`videos ${videos.length} -> ${result.kept.length}${result.dropped.length ? ` (dropped ${result.dropped.length})` : ""}`);
        } else {
          set.videos = videos.map((v) => toNewVideo(v, VideoKind.HIGHLIGHTS, now, false));
          notes.push(`${videos.length} highlight video(s)`);
        }
      }
      if ("AiVideoVideoScore" in doc) {
        unset.push("AiVideoVideoScore");
        notes.push("remove AiVideoVideoScore");
      }
      if (notes.length) plans.push({ collection, _id: doc._id, set, unset, note: notes.join(", "), before: doc });
    }
  }

  // Users
  const users: any[] = await User.collection.find({ $or: [{ AiVideoVideoScore: { $exists: true } }, { aiProfileScore: { $exists: true } }] }).toArray();
  for (const doc of users) {
    const set: Record<string, unknown> = {};
    const unset: string[] = [];
    if ("AiVideoVideoScore" in doc) {
      if (doc.interviewScore === undefined) set.interviewScore = doc.AiVideoVideoScore ? doc.AiVideoVideoScore : null;
      unset.push("AiVideoVideoScore");
    }
    if ("aiProfileScore" in doc) unset.push("aiProfileScore");
    plans.push({ collection: User.collection.name, _id: doc._id, set, unset, note: "scores: AiVideoVideoScore -> interviewScore, remove aiProfileScore", before: doc });
  }

  // Jobs
  const jobs: any[] = await Job.collection.find({ $or: [{ requiredAiScore: { $exists: true } }, { isPremium: { $exists: false } }] }).toArray();
  for (const doc of jobs) {
    plans.push({
      collection: Job.collection.name,
      _id: doc._id,
      set: doc.isPremium === undefined ? { isPremium: false } : {},
      unset: "requiredAiScore" in doc ? ["requiredAiScore"] : [],
      note: "remove requiredAiScore, isPremium = false",
      before: doc,
    });
  }

  // Job applications: clearer names for the job match
  const applications: any[] = await JobApply.collection
    .find({ $or: [{ aiMatchPercentage: { $exists: true } }, { aiMatchStatus: { $exists: true } }, { aiMatchDetails: { $exists: true } }, { aiMatchError: { $exists: true } }] })
    .toArray();
  for (const doc of applications) {
    const rename: Record<string, string> = {};
    for (const [from, to] of [["aiMatchPercentage", "matchScore"], ["aiMatchStatus", "matchStatus"], ["aiMatchDetails", "matchDetails"], ["aiMatchError", "matchError"]]) {
      if (from in doc) rename[from] = to;
    }
    plans.push({ collection: JobApply.collection.name, _id: doc._id, rename, note: `rename ${Object.keys(rename).join(", ")}`, before: doc });
  }

  // AI evaluations: videoType -> kind
  const evaluations: any[] = await AiEvaluation.collection.find({ "videos.videoType": { $exists: true } }).toArray();
  for (const doc of evaluations) {
    const videos = (doc.videos ?? []).map(({ videoType, ...rest }: any) => ({
      ...rest,
      kind: rest.kind ?? (isInterviewType(videoType) ? VideoKind.INTERVIEW : VideoKind.METHODOLOGY),
    }));
    plans.push({ collection: AiEvaluation.collection.name, _id: doc._id, set: { videos }, note: "videos[].videoType -> kind", before: doc });
  }

  // Verification status on records
  for (const model of [CandidateExperience, CandidateEducation, CandidateLicenseAndCertification]) {
    const docs: any[] = await model.collection.find({ verificationStatus: { $exists: false } }).toArray();
    for (const doc of docs) {
      plans.push({ collection: model.collection.name, _id: doc._id, set: { verificationStatus: "none" }, note: 'verificationStatus = "none"', before: doc });
    }
  }
  return { plans, dropped };
};

const main = async () => {
  // A dev/staging process must never touch the client database (PROTECTED_DB_MARKERS)
  assertSafeEnvironment();
  if (!config.database_url) throw new Error("DATABASE_URL is not set");
  await mongoose.connect(config.database_url);
  const db = mongoose.connection.db!;
  const dbName = mongoose.connection.name;
  console.log(`Connected: host=${mongoose.connection.host} database=${dbName}`);

  const restoreFile = arg("--restore");
  if (restoreFile) {
    const backup = EJSON.parse(fs.readFileSync(restoreFile, "utf8")) as { database: string; docs: { collection: string; before: any }[] };
    if (backup.database !== dbName) throw new Error(`Backup is for "${backup.database}", connected to "${dbName}". Abort.`);
    for (const entry of backup.docs) await db.collection(entry.collection).replaceOne({ _id: entry.before._id }, entry.before, { upsert: true });
    console.log(`Restored ${backup.docs.length} documents from ${restoreFile}`);
    return;
  }

  const { plans, dropped } = await planAll();
  const byCollection = plans.reduce<Record<string, number>>((acc, p) => ((acc[p.collection] = (acc[p.collection] ?? 0) + 1), acc), {});
  console.log(plans.length === 0 ? "Nothing to change." : `${plans.length} document(s) to change:`);
  Object.entries(byCollection).forEach(([collection, count]) => console.log(`  ${collection.padEnd(34)} ${count}`));
  if (dropped.length) {
    console.log(`\n${dropped.length} extra staff video(s) will be removed from profiles (files stay on disk):`);
    dropped.forEach((d) => console.log(`  ${d.collection} ${d.profile}: "${d.video.videoType}" ${d.video.url}`));
  }
  if (!has("--apply")) {
    console.log("\nDry run only. Nothing was written.");
    return;
  }
  if (arg("--confirm-db") !== dbName) throw new Error(`--confirm-db must equal the connected database name ("${dbName}"). Abort, nothing written.`);
  if (plans.length === 0) return;

  const dir = path.join(process.cwd(), "logs");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `data-model-migration-${dbName}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, EJSON.stringify({ database: dbName, createdAt: new Date().toISOString(), docs: plans.map((p) => ({ collection: p.collection, before: p.before })) }, undefined, 2, { relaxed: false }));
  console.log(`\nBackup written: ${file}`);

  for (const plan of plans) {
    const update: Record<string, unknown> = {};
    if (plan.set && Object.keys(plan.set).length) update.$set = plan.set;
    if (plan.unset?.length) update.$unset = Object.fromEntries(plan.unset.map((field) => [field, ""]));
    if (plan.rename && Object.keys(plan.rename).length) update.$rename = plan.rename;
    if (Object.keys(update).length) await db.collection(plan.collection).updateOne({ _id: plan._id }, update);
  }
  console.log(`Updated ${plans.length} document(s). Undo with: node dist/scripts/migrateToNewDataModel.js --restore "${file}"`);
};

if (require.main === module) {
  main()
    .catch((error) => {
      console.error("Migration failed:", error.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}
