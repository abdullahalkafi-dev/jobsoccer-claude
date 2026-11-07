/**
 * Repair (2026-11-07): resumes uploaded from the profile page were saved as "not active", so the
 * Profile Quality score never counted the CV. For every candidate who has resumes but none active,
 * the newest one becomes active. Nothing is deleted. Safe to run twice.
 *
 *   npx ts-node-dev --transpile-only src/scripts/activateLatestResume.ts            dry run
 *   npx ts-node-dev --transpile-only src/scripts/activateLatestResume.ts --apply
 */
import mongoose from "mongoose";
import config from "../config";
import { CandidateResume } from "../modules/candidateResume/candidateResume.model";

(async () => {
  const apply = process.argv.includes("--apply");
  await mongoose.connect(config.database_url as string);
  console.log("database:", mongoose.connection.name, apply ? "(APPLY)" : "(dry run)");
  const users: string[] = await CandidateResume.distinct("userId");
  let changed = 0;
  for (const userId of users) {
    if (await CandidateResume.exists({ userId, isActive: true })) continue;
    const newest = await CandidateResume.findOne({ userId }).sort({ createdAt: -1 });
    if (!newest) continue;
    console.log(" activate", String(newest._id), "for user", String(userId));
    if (apply) {
      newest.isActive = true;
      await newest.save(); // the save also tells Profile Quality to recount
    }
    changed++;
  }
  console.log(changed, "resume(s)", apply ? "activated" : "would be activated");
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
