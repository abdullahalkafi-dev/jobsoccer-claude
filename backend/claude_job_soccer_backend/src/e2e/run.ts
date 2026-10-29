/**
 * End-to-end flow with fake candidates, through the real API of the staging server.
 *
 *   pnpm e2e:flow --role head_coach                  all fake candidates of the role
 *   pnpm e2e:flow --role head_coach --only best,bad  only some of them
 *   pnpm e2e:flow --role head_coach --no-employer    skip the employer access check
 *
 * Real: sign-up, e-mail code, login, profile + 4 video uploads, AI profile score,
 * queue, background assessment (OpenAI scoring, rules, report), access rules.
 * Replaced: only the speech-to-text result of each fake video (loaded into the
 * transcript cache under the file's fingerprint). Staging / development database only.
 * Test accounts: e2e.<role>.<level>@e2e.jobsoccer.test, password and code are public (see support.ts).
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { aiConfig } from "../shared/ai/ai.config";
import { PersonaRun, runCandidate } from "./candidateFlow";
import { runEmployerAccess } from "./employerFlow";
import { headCoachScenario } from "./personas/headCoach";
import { RoleScenario } from "./personas/types";
import { E2E, Check, assertStagingTarget, check, connectDevDatabase } from "./support";

const SCENARIOS: Record<string, RoleScenario> = {
  [headCoachScenario.roleKey]: headCoachScenario,
};

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const has = (name: string) => process.argv.includes(name);

const VIDEO_LIMIT_SECONDS = 360; // client-side cap of the Head Coach forms

const main = async () => {
  const roleKey = arg("--role") ?? "head_coach";
  const scenario = SCENARIOS[roleKey];
  if (!scenario) throw new Error(`Unknown role "${roleKey}". Available: ${Object.keys(SCENARIOS).join(", ")}`);

  assertStagingTarget();
  const dbName = await connectDevDatabase();
  console.log(`API:       ${E2E.apiBase}`);
  console.log(`Database:  ${dbName}`);
  console.log(`Models:    transcribe=${aiConfig.models.transcribe} (cache key), language=${aiConfig.transcriptionLanguage}`);
  console.log(`Role:      ${scenario.position} (${scenario.rubricId})\n`);

  const only = arg("--only")?.split(",").map((s) => s.trim());
  const personas = scenario.personas.filter((p) => !only || only.includes(p.key));

  const startedAt = new Date();
  const runs: PersonaRun[] = [];
  for (const persona of personas) {
    console.log(`> ${persona.label}`);
    const run = await runCandidate(scenario, persona);
    runs.push(run);
    for (const s of run.steps) console.log(`    ${s.name.padEnd(28)} ${String(s.ms).padStart(7)} ms  ${s.httpStatus ?? ""}  ${s.note ?? ""}`);
    if (run.timeline.length) console.log(`    states: ${run.timeline.map((t) => `${t.state}@${(t.atMs / 1000).toFixed(1)}s`).join(" -> ")}`);
    const ev = run.evaluation;
    if (ev) {
      const t = ev.report.totals;
      console.log(`    RESULT ${t.earned}/${t.max} (${t.percentage}%) band=${t.band ?? "-"} notAnswered=${t.notAnsweredCount} review=${ev.report.needsHumanReview} profileScore=${run.profileScore} cost=$${ev.costUsd}`);
    }
    if (run.error) console.log(`    ERROR: ${run.error}`);
    for (const c of run.checks) console.log(`    [${c.pass ? "PASS" : "FAIL"}] ${c.id} ${c.what} - ${c.detail}`);
    console.log("");
  }

  // Cross-candidate checks
  const cross: Check[] = [];
  const total = (key: string) => runs.find((r) => r.persona === key)?.evaluation?.report.totals.earned as number | undefined;
  const order = ["bad", "weak", "good", "best"].filter((k) => total(k) !== undefined);
  if (order.length >= 2) {
    const values = order.map((k) => total(k)!);
    const increasing = values.every((v, i) => i === 0 || v > values[i - 1]);
    check(cross, "X1", "Better candidates score higher (bad < weak < good < best)", increasing, order.map((k, i) => `${k} ${values[i]}`).join(" < "));
  }
  const bad = runs.find((r) => r.persona === "bad")?.profileScore;
  const best = runs.find((r) => r.persona === "best")?.profileScore;
  if (bad != null && best != null) {
    check(cross, "X2", "AI profile score separates a thin profile from a full one (gap >= 10 points)", best - bad >= 10, `bad ${bad}, best ${best} (all: ${runs.map((r) => `${r.persona} ${r.profileScore}`).join(", ")})`);
  }
  for (const r of runs) {
    check(cross, `T-${r.persona}`, `Interview answers fit the ${VIDEO_LIMIT_SECONDS}s video limit (estimated speaking time)`, r.estimatedSpokenSeconds <= VIDEO_LIMIT_SECONDS, `${r.transcriptWords} words = about ${r.estimatedSpokenSeconds}s`);
  }

  // Employer access check, once, with the best candidate (or the last one that finished)
  let employer;
  if (!has("--no-employer")) {
    const subject = runs.find((r) => r.persona === "best" && r.evaluation && r.token) ?? [...runs].reverse().find((r) => r.evaluation && r.token);
    if (subject) {
      console.log(`> Employer access check with ${subject.email}`);
      employer = await runEmployerAccess(subject.email, subject.token!);
      for (const s of employer.steps) console.log(`    ${s.name.padEnd(28)} ${String(s.ms).padStart(7)} ms  ${s.httpStatus ?? ""}  ${s.note ?? ""}`);
      if (employer.error) console.log(`    ERROR: ${employer.error}`);
      for (const c of employer.checks) console.log(`    [${c.pass ? "PASS" : "FAIL"}] ${c.id} ${c.what} - ${c.detail}`);
      console.log("");
    }
  }

  for (const c of cross) console.log(`[${c.pass ? "PASS" : "FAIL"}] ${c.id} ${c.what} - ${c.detail}`);

  const all = [...runs.flatMap((r) => r.checks), ...(employer?.checks ?? []), ...cross];
  console.log(`\nChecks: ${all.filter((c) => c.pass).length} passed, ${all.filter((c) => !c.pass).length} failed, ${runs.filter((r) => r.error).length} candidate error(s)`);

  const outDir = path.join(process.cwd(), "logs", "e2e");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${scenario.roleKey}-${startedAt.toISOString().replace(/[:.]/g, "-")}.json`);
  const saved = {
    startedAt,
    finishedAt: new Date(),
    api: E2E.apiBase,
    database: dbName,
    scenario: { role: scenario.roleKey, position: scenario.position, rubricId: scenario.rubricId },
    runs: runs.map(({ token, ...rest }) => rest),
    employer,
    cross,
  };
  fs.writeFileSync(outFile, JSON.stringify(saved, null, 2));
  console.log(`Saved: ${outFile}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
