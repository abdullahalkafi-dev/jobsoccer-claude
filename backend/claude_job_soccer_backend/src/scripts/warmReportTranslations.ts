/**
 * Spanish + French copies of the interview reports that already exist (2026-11-18).
 * New reports get them automatically right after scoring; this is for the reports made before that.
 *
 *   pnpm reports:translate --dry-run     lists the reports; reads the database only, no OpenAI calls
 *   pnpm reports:translate               translates them (one small call per report and language)
 *   options: --limit <n>
 *
 * Safe to run again: a report whose translation is current is skipped by the cache (no call is made).
 * Only the `translations` / `detailTranslations` fields of an evaluation are written. Nothing is deleted.
 * Refuses to run against the client's database (PROTECTED_DB_MARKERS).
 */
import mongoose from "mongoose";
import config from "../config";
import { AiEvaluation } from "../modules/aiEvaluation/aiEvaluation.model";
import { warmReportTranslations } from "../modules/aiEvaluation/aiEvaluation.service";
import { assertSafeEnvironment } from "../shared/safety/envGuard";

const argValue = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const main = async () => {
  assertSafeEnvironment();
  const dryRun = process.argv.includes("--dry-run");
  const limit = argValue("--limit") ? Number(argValue("--limit")) : 0;
  await mongoose.connect(config.database_url as string);
  console.log("database:", mongoose.connection.name, dryRun ? "(dry run)" : "(writing es/fr report translations)");

  const reports = await AiEvaluation.find({ status: "completed", isLatest: true })
    .select("_id candidateUserId rubricId finishedAt")
    .sort({ finishedAt: -1 })
    .limit(limit)
    .lean();
  console.log(`${reports.length} latest completed report(s)`);

  let done = 0;
  for (const report of reports) {
    if (dryRun) {
      console.log(`[dry-run] ${report._id} ${report.rubricId}`);
      continue;
    }
    const started = Date.now();
    const ready = await warmReportTranslations(report._id.toString());
    done += ready.length === 2 ? 1 : 0;
    console.log(`${report._id} ${report.rubricId}: ${ready.join(", ") || "none"} (${Math.round((Date.now() - started) / 1000)} s)`);
  }
  if (!dryRun) console.log(`ready in es + fr: ${done} of ${reports.length}`);
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
