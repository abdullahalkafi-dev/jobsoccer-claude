/**
 * Check that the AI counts the answered questions correctly (calls OpenAI, costs money, writes nothing).
 *
 *   pnpm ai:align --all                       every fixture
 *   pnpm ai:align --fixture emma_gap14        one fixture
 *   pnpm ai:align --all --legacy              also run the OLD single-call scorer for comparison
 *   pnpm ai:align --all --dir <folder>        fixtures from another folder
 *
 * A fixture is a real (or edited) timestamped transcript plus the questions that were REALLY answered
 * (src/shared/ai/evaluation/fixtures/*.json). The pass mark is an exact match of the answered questions.
 * Fixtures with "expectedAnswered": null are only reported (nobody knows the true answer yet).
 */
import fs from "fs";
import path from "path";
import { buildUnits } from "../shared/ai/evaluation/alignment";
import { evaluateTranscript } from "../shared/ai/evaluation/evaluator";
import { buildReport } from "../shared/ai/evaluation/guardrails";
import { evaluateInterview } from "../shared/ai/evaluation/interviewEvaluator";
import { getRubric } from "../shared/ai/rubric/rubric.registry";

type Fixture = {
  id: string;
  rubricId: string;
  description: string;
  expectedAnswered: number[] | null;
  /** Questions that may count either way (the answer is genuinely borderline). */
  ambiguousAnswered?: number[];
  segments: { start: number; end: number; text: string }[];
};

const argValue = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const cost = (usage: { estimatedCostUsd: number | null }[]) => usage.reduce((n, u) => n + (u.estimatedCostUsd ?? 0), 0);
const list = (ids: number[]) => (ids.length ? ids.map((id) => `Q${id}`).join(" ") : "-");

const fixtureDir = argValue("--dir") ?? path.resolve(__dirname, "../../src/shared/ai/evaluation/fixtures");

const loadFixtures = (): Fixture[] => {
  const only = argValue("--fixture");
  return fs
    .readdirSync(fixtureDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(fixtureDir, f), "utf8")) as Fixture)
    .filter((f) => !only || f.id === only)
    .sort((a, b) => a.id.localeCompare(b.id));
};

const compare = (expected: number[] | null, answered: number[], ambiguous: number[] = []) => {
  if (!expected) return { ok: null as boolean | null, wrongly: [] as number[], missed: [] as number[] };
  const wrongly = answered.filter((id) => !expected.includes(id) && !ambiguous.includes(id));
  const missed = expected.filter((id) => !answered.includes(id) && !ambiguous.includes(id));
  return { ok: wrongly.length === 0 && missed.length === 0, wrongly, missed };
};

const run = async () => {
  if (!process.argv.includes("--all") && !argValue("--fixture")) {
    console.log("Usage: pnpm ai:align --all | --fixture <id> [--legacy] [--dir <folder>]");
    process.exitCode = 1;
    return;
  }
  const fixtures = loadFixtures();
  let failed = 0;

  for (const fixture of fixtures) {
    const rubric = getRubric(fixture.rubricId);
    if (!rubric) {
      console.log(`${fixture.id}: unknown rubric ${fixture.rubricId}`);
      failed++;
      continue;
    }
    const transcript = fixture.segments.map((s) => s.text).join(" ");
    const units = buildUnits(fixture.segments, transcript);
    console.log(`\n=== ${fixture.id}: ${fixture.description}`);
    console.log(`    ${units.length} lines, ${transcript.split(/\s+/).length} words, expected ${fixture.expectedAnswered ? fixture.expectedAnswered.length : "unknown"} answered`);

    const started = Date.now();
    const result = await evaluateInterview(rubric, units, transcript);
    const seconds = Math.round((Date.now() - started) / 1000);
    const report = result.report;
    const answered = report.questions.filter((q) => q.status === "scored").map((q) => q.questionId);
    const verdict = compare(fixture.expectedAnswered, answered, fixture.ambiguousAnswered);

    console.log(`    NEW   answered ${answered.length}/${rubric.questionCount}  score ${report.totals.earned}/${report.totals.max}  ${seconds}s  $${cost(result.usage).toFixed(3)}  confidence ${report.overallConfidence}`);
    console.log(`          wrongly counted: ${list(verdict.wrongly)}   missed: ${list(verdict.missed)}   ->  ${verdict.ok === null ? "REPORT ONLY" : verdict.ok ? "PASS" : "FAIL"}`);
    if (report.reviewReasons.length) console.log(`          review: ${report.reviewReasons.join(" | ")}`);
    if (verdict.ok === false) failed++;
    if (verdict.ok !== true) {
      for (const block of report.alignment?.blocks ?? []) console.log(`          Q${block.questionId} <- lines ${block.lines} (${block.words} words, ${block.coverage})`);
      console.log(`          summary: ${report.summary}`);
    }

    if (process.argv.includes("--legacy")) {
      const old = await evaluateTranscript(rubric, transcript);
      const oldReport = buildReport(rubric, old.output, transcript);
      const oldAnswered = oldReport.questions.filter((q) => q.status === "scored").map((q) => q.questionId);
      const oldVerdict = compare(fixture.expectedAnswered, oldAnswered, fixture.ambiguousAnswered);
      console.log(`    OLD   answered ${oldAnswered.length}/${rubric.questionCount}  score ${oldReport.totals.earned}/${oldReport.totals.max}`);
      console.log(`          wrongly counted: ${list(oldVerdict.wrongly)}   missed: ${list(oldVerdict.missed)}   ->  ${oldVerdict.ok === null ? "REPORT ONLY" : oldVerdict.ok ? "PASS" : "FAIL"}`);
    }
  }

  console.log(`\n${failed === 0 ? "All checked fixtures match." : `${failed} fixture(s) did NOT match.`}`);
  if (failed) process.exitCode = 1;
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
