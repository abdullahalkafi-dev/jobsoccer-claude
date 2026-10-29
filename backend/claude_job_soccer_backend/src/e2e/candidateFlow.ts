import { Types } from "mongoose";
import { AiEvaluation, AiTranscript } from "../modules/aiEvaluation/aiEvaluation.model";
import { User } from "../modules/user/user.model";
import { Check, E2E, call, check, emailFor, fakeVideo, sha256, sleep, tinyPng, transcriptKey } from "./support";
import { Persona, RoleScenario, buildTranscript, wordCount } from "./personas/types";

/** One fake candidate, start to end, through the real API. Only the speech-to-text result is pre-loaded. */

export interface StepTiming {
  name: string;
  ms: number;
  httpStatus: number | null;
  note?: string;
}

export interface PersonaRun {
  persona: string;
  label: string;
  email: string;
  userId: string;
  existingAccount: boolean;
  steps: StepTiming[];
  /** Evaluation states as seen while polling, ms after the profile request finished. */
  timeline: { state: string; atMs: number }[];
  transcriptWords: number;
  estimatedSpokenSeconds: number;
  profileScore: number | null;
  /** Login token, used for the employer step; removed before the result is saved. */
  token?: string;
  evaluation?: any;
  ownView?: any;
  checks: Check[];
  error?: string;
}

const SPEAKING_WORDS_PER_SECOND = 2.5; // ~150 words a minute

export const runCandidate = async (scenario: RoleScenario, persona: Persona): Promise<PersonaRun> => {
  const email = emailFor(`${scenario.roleKey}.${persona.key}`);
  const transcript = buildTranscript(persona.answers);
  const words = wordCount(transcript);
  const run: PersonaRun = {
    persona: persona.key,
    label: persona.label,
    email,
    userId: "",
    existingAccount: false,
    steps: [],
    timeline: [],
    transcriptWords: words,
    estimatedSpokenSeconds: Math.round(words / SPEAKING_WORDS_PER_SECOND),
    profileScore: null,
    checks: [],
  };
  const step = (name: string, ms: number, httpStatus: number | null, note?: string) =>
    run.steps.push({ name, ms, httpStatus, note });

  try {
    // 1. Sign up (or reuse the account from an earlier run)
    const signup = await call("POST", "/auth/signup", {
      json: {
        firstName: persona.firstName,
        lastName: persona.lastName,
        email,
        role: scenario.role,
        password: E2E.password,
        loginProvider: "email",
        userType: scenario.userType,
      },
    });
    const alreadyExists = !signup.ok && /already exists/i.test(JSON.stringify(signup.body));
    run.existingAccount = alreadyExists;
    step("signup", signup.ms, signup.status, alreadyExists ? "account already existed" : undefined);
    check(run.checks, "C1", "Sign up works", signup.ok || alreadyExists, `HTTP ${signup.status}`);
    if (!signup.ok && !alreadyExists) throw new Error(`Signup failed: ${JSON.stringify(signup.body)}`);

    // 2. Verify the email with the fixed test code
    let user = await User.findOne({ email });
    if (!user) throw new Error("User not found in the dev database after signup (is DATABASE_URL the staging database?)");
    run.userId = user._id.toString();
    if (!user.isVerified) {
      const verify = await call("POST", "/auth/verify-email", {
        json: { email, oneTimeCode: E2E.otp, reason: "account_verification" },
      });
      step("verify-email", verify.ms, verify.status);
      check(run.checks, "C2", `Email verification with code ${E2E.otp}`, verify.ok, `HTTP ${verify.status}`);
      if (!verify.ok) throw new Error(`Verify failed: ${JSON.stringify(verify.body)}`);
    }

    // 3. Log in
    const login = await call("POST", "/auth/login", { json: { email, password: E2E.password, loginProvider: "email" } });
    step("login", login.ms, login.status);
    const token: string | undefined = login.body?.data?.accessToken ?? login.body?.data?.data?.accessToken;
    check(run.checks, "C3", "Login returns a token", login.ok && !!token, `HTTP ${login.status}`);
    if (!token) throw new Error(`Login failed: ${JSON.stringify(login.body)}`);
    run.token = token;

    // 4. Create the profile with the four required videos. When the account already has a profile
    //    (earlier run) the candidate uploads new videos instead, which starts a new assessment.
    user = await User.findById(run.userId);
    const isUpdate = !!user?.profileId;
    const knownEvaluations = new Set(
      (await AiEvaluation.find({ candidateUserId: new Types.ObjectId(run.userId) }).select("_id").lean()).map((d) => d._id.toString())
    );
    let profileDoneAt = Date.now();
    {
      const videoMeta: { type: string; title: string; description: string }[] = [];
      const form = new FormData();
      if (isUpdate) {
        form.append("data", JSON.stringify({ position: scenario.position }));
      } else {
        form.append("data", JSON.stringify({ ...scenario.profileBase, ...persona.profileExtras }));
        form.append("image", new Blob([new Uint8Array(tinyPng())], { type: "image/png" }), "photo.png");
      }

      const seeds: { sha: string; text: string }[] = [];
      scenario.videoTypes.forEach((type, index) => {
        const bytes = fakeVideo(`${email}|${type}`);
        const text = index === 0 ? transcript : " ";
        seeds.push({ sha: sha256(bytes), text });
        form.append("videos", new Blob([new Uint8Array(bytes)], { type: "video/mp4" }), `e2e-${index + 1}.mp4`);
        videoMeta.push({ type, title: `${type} (e2e)`, description: `E2E test video for ${persona.key}` });
      });
      form.append("videoMeta", JSON.stringify(videoMeta));

      // The speech-to-text step is replaced by a pre-loaded transcript for each file's fingerprint.
      const seedStart = Date.now();
      for (const seed of seeds) {
        await AiTranscript.updateOne(
          { sha256: seed.sha, ...transcriptKey() },
          { $set: { text: seed.text, durationSeconds: Math.round(wordCount(seed.text) / SPEAKING_WORDS_PER_SECOND) } },
          { upsert: true }
        );
      }
      step("seed-transcripts", Date.now() - seedStart, null, `${seeds.length} files (interview ${words} words)`);

      const created = await call(isUpdate ? "PATCH" : "POST", "/user/profile", { token, form });
      profileDoneAt = Date.now();
      step(isUpdate ? "update-profile-videos" : "create-profile", created.ms, created.status, isUpdate ? "account existed: new videos uploaded" : "includes the AI profile score");
      check(run.checks, "C4", isUpdate ? "New videos accepted (HTTP 200)" : "Profile created (HTTP 201)", created.status === (isUpdate ? 200 : 201), `HTTP ${created.status} ${created.ok ? "" : JSON.stringify(created.body).slice(0, 300)}`);
      if (!created.ok) throw new Error(`Profile ${isUpdate ? "update" : "creation"} failed: ${JSON.stringify(created.body)}`);
    }

    // 5. Profile score (written at creation)
    user = await User.findById(run.userId);
    run.profileScore = user?.aiProfileScore ?? null;
    check(run.checks, "C5", "AI profile score is a real score (> 0)", (run.profileScore ?? 0) > 0, `aiProfileScore = ${run.profileScore}`);

    // 6. Wait for the background interview assessment, noting each state and when it was seen
    const waitStart = Date.now();
    let lastState = "";
    let doc: any = null;
    while (Date.now() - waitStart < E2E.timeoutMs) {
      // only the assessment started by this run (not one from an earlier run)
      doc = await AiEvaluation.findOne({ candidateUserId: new Types.ObjectId(run.userId), _id: { $nin: [...knownEvaluations].map((id) => new Types.ObjectId(id)) } })
        .sort({ createdAt: -1 })
        .lean();
      const state = doc?.status ?? "none";
      if (state !== lastState) {
        run.timeline.push({ state, atMs: Date.now() - profileDoneAt });
        lastState = state;
      }
      if (state === "completed" || state === "failed") break;
      await sleep(E2E.pollMs);
    }
    step("wait-for-assessment", Date.now() - waitStart, null, `final state: ${lastState || "none"}`);
    check(run.checks, "C6", "Interview assessment completes", lastState === "completed", `state = ${lastState}${doc?.error ? `, error: ${doc.error}` : ""}`);
    if (lastState !== "completed") throw new Error(`Assessment did not complete (${lastState}): ${doc?.error ?? "timeout"}`);

    // 7. What the candidate sees on their own profile
    const own = await call("GET", "/ai-evaluation/me", { token });
    step("candidate-view-assessment", own.ms, own.status);
    run.ownView = own.body?.data;
    const ownReport = run.ownView?.report ?? run.ownView;
    check(run.checks, "C7", "Candidate can read their own overall assessment", own.ok && typeof ownReport?.totalScore === "number", `HTTP ${own.status}`);
    check(run.checks, "C8", "Candidate view shows the overall section only (no question-by-question)", !!ownReport && !("questions" in ownReport), "keys: " + Object.keys(ownReport ?? {}).join(", "));

    // 8. Result checks against what we expect for this fake candidate
    const report = doc.report;
    const totals = report.totals;
    check(run.checks, "C9", `All ${scenario.questionCount} questions are in the report`, report.questions.length === scenario.questionCount, `${report.questions.length} questions`);
    const { expect } = persona;
    if (expect.minPct !== undefined) check(run.checks, "C10", `Score is at least ${expect.minPct}%`, totals.percentage >= expect.minPct, `${totals.earned}/${totals.max} = ${totals.percentage}%`);
    if (expect.maxPct !== undefined) check(run.checks, "C11", `Score is at most ${expect.maxPct}%`, totals.percentage <= expect.maxPct, `${totals.earned}/${totals.max} = ${totals.percentage}%`);
    if (expect.minNotAnswered !== undefined) check(run.checks, "C12", `At least ${expect.minNotAnswered} questions shown as Not Answered`, totals.notAnsweredCount >= expect.minNotAnswered, `${totals.notAnsweredCount} not answered`);
    if (expect.maxNotAnswered !== undefined) check(run.checks, "C13", `At most ${expect.maxNotAnswered} questions Not Answered`, totals.notAnsweredCount <= expect.maxNotAnswered, `${totals.notAnsweredCount} not answered`);
    check(
      run.checks,
      "C14",
      "Level (band) is shown only when every question was answered",
      expect.noBand ? totals.band === null : totals.notAnsweredCount === 0 ? totals.band !== null : totals.band === null,
      `band = ${totals.band}, not answered = ${totals.notAnsweredCount}`
    );
    const refreshed = await User.findById(run.userId).lean();
    check(run.checks, "C15", "Old 0-100 score on the card is in sync with the report", refreshed?.AiVideoVideoScore === report.legacyScore100, `card ${refreshed?.AiVideoVideoScore} vs report ${report.legacyScore100}`);
    check(run.checks, "C16", "Cost and usage are recorded", typeof doc.costUsd === "number" && (doc.usage?.length ?? 0) > 0, `cost $${doc.costUsd}`);

    run.evaluation = {
      id: doc._id.toString(),
      status: doc.status,
      rubricId: doc.rubricId,
      aiModel: doc.aiModel,
      promptVersion: doc.promptVersion,
      attempts: doc.attempts,
      queuedAt: doc.queuedAt,
      startedAt: doc.startedAt,
      finishedAt: doc.finishedAt,
      queueWaitMs: doc.startedAt && doc.queuedAt ? new Date(doc.startedAt).getTime() - new Date(doc.queuedAt).getTime() : null,
      processingMs: doc.startedAt && doc.finishedAt ? new Date(doc.finishedAt).getTime() - new Date(doc.startedAt).getTime() : null,
      costUsd: doc.costUsd,
      usage: doc.usage,
      videos: doc.videos,
      transcriptChars: doc.transcript?.length ?? 0,
      report,
    };
  } catch (error: any) {
    run.error = error.message;
  }
  return run;
};
