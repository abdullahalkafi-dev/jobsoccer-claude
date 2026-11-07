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
import { User } from "../modules/user/user.model";
import { ProfileQualityService } from "../modules/profileQuality/profileQuality.service";

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

  // Recount the score of everyone whose active CV is not counted yet (stored CV points = 0).
  const active: string[] = await CandidateResume.distinct("userId", { isActive: true });
  for (const userId of active) {
    const user: any = await User.findById(userId).select("profileQuality").lean();
    const cv = user?.profileQuality?.categories?.flatMap((c: any) => c.items).find((i: any) => i.key === "cv");
    if (!cv || cv.earned > 0) continue;
    console.log(" recount score for user", String(userId));
    if (apply) await ProfileQualityService.recalculate(String(userId));
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
