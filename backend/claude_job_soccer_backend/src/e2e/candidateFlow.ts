import { Types } from "mongoose";
import { AiEvaluation, AiTranscript } from "../modules/aiEvaluation/aiEvaluation.model";
import { User } from "../modules/user/user.model";
import { transcriptCacheKey } from "../modules/aiEvaluation/transcriptCache";
import { getProfileEntry } from "../modules/profile/profile.registry";
import { Check, E2E, call, check, emailFor, sha256, sleep, testVideo, tinyPng } from "./support";
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

    // 4. Profile first (photo + details), then consent, then ONE video per request (interview first).
    //    Re-runs reuse the account: its videos are locked for 3 months, so the lock is lifted in the dev database.
    user = await User.findById(run.userId);
    const hasProfile = !!user?.profileId;
    const knownEvaluations = new Set(
      (await AiEvaluation.find({ candidateUserId: new Types.ObjectId(run.userId) }).select("_id").lean()).map((d) => d._id.toString())
    );
    if (!hasProfile) {
      const form = new FormData();
      form.append("data", JSON.stringify({ ...scenario.profileBase, ...persona.profileExtras }));
      form.append("image", new Blob([new Uint8Array(tinyPng())], { type: "image/png" }), "photo.png");
      const created = await call("POST", "/profile", { token, form });
      step("create-profile", created.ms, created.status);
      check(run.checks, "C4", "Profile created (HTTP 201)", created.status === 201, `HTTP ${created.status} ${created.ok ? "" : JSON.stringify(created.body).slice(0, 300)}`);
      if (!created.ok) throw new Error(`Profile creation failed: ${JSON.stringify(created.body)}`);
    } else {
      const entry = getProfileEntry(user!.userType, user!.role)!;
      await entry.model.updateOne({ _id: user!.profileId }, { $set: { "videos.$[].lockedUntil": null } });
      check(run.checks, "C4", "Profile already exists (re-run)", true, "video locks lifted in the dev database");
    }

    const consent = await call("POST", "/videos/consent", { token, json: { ai: true, players: true } });
    step("save-consent", consent.ms, consent.status);
    check(run.checks, "C4b", "Consent saved", consent.ok, `HTTP ${consent.status}`);

    let profileDoneAt = Date.now();
    const uploadTimes: number[] = [];
    for (const [index, kind] of scenario.videoKinds.entries()) {
      const bytes = testVideo(`${email}|${kind}`);
      const text = index === 0 ? transcript : " ";
      // The speech-to-text step is replaced by a pre-loaded transcript for this file's fingerprint.
      await AiTranscript.updateOne(
        transcriptCacheKey(sha256(bytes)),
        { $set: { text, detectedLanguage: "english", segments: [], durationSeconds: Math.round(wordCount(text) / SPEAKING_WORDS_PER_SECOND) } },
        { upsert: true }
      );
      const form = new FormData();
      form.append("kind", kind);
      form.append("video", new Blob([new Uint8Array(bytes)], { type: "video/mp4" }), `e2e-${index + 1}.mp4`);
      const uploaded = await call("POST", "/videos", { token, form });
      uploadTimes.push(uploaded.ms);
      step(`upload-${kind.toLowerCase()}`, uploaded.ms, uploaded.status, index === 0 ? `interview ${words} words` : undefined);
      check(run.checks, `C4-${kind}`, `${kind} video accepted (HTTP 201)`, uploaded.status === 201, `HTTP ${uploaded.status} ${uploaded.ok ? "" : JSON.stringify(uploaded.body).slice(0, 300)}`);
      if (!uploaded.ok) throw new Error(`${kind} upload failed: ${JSON.stringify(uploaded.body)}`);
      profileDoneAt = Date.now();
    }
    check(run.checks, "C4c", "Each video request ends quickly (under 10 s: no AI work inside the request)", uploadTimes.every((ms) => ms < 10_000), uploadTimes.map((ms) => `${ms} ms`).join(", "));

    // A second interview upload inside the 3-month lock must be refused
    const againForm = new FormData();
    againForm.append("kind", scenario.videoKinds[0]);
    againForm.append("video", new Blob([new Uint8Array(testVideo(`${email}|again`))], { type: "video/mp4" }), "again.mp4");
    const locked = await call("POST", "/videos", { token, form: againForm });
    check(run.checks, "C4d", "A second interview upload is blocked by the 3-month lock (HTTP 423)", locked.status === 423, `HTTP ${locked.status}`);

    // 5. Profile Quality Score (rules + AI judgement, calculated in the background after the uploads)
    {
      const waitQuality = Date.now();
      let quality: any = null;
      while (Date.now() - waitQuality < 60_000) {
        quality = (await User.findById(run.userId).select("profileQuality").lean())?.profileQuality;
        if (quality?.calculatedAt) break;
        await sleep(1000);
      }
      run.profileScore = quality?.score ?? null;
      step("wait-for-profile-quality", Date.now() - waitQuality, null, quality ? `score ${quality.score}, ${quality.stars} stars (${quality.level})` : "not calculated");
      check(run.checks, "C5", "Profile Quality Score is calculated (0-100, four categories)", !!quality && quality.score >= 0 && quality.score <= 100 && quality.categories?.length === 4, `score = ${quality?.score}`);
      const media = quality?.categories?.find((c: any) => c.key === "media")?.earned;
      check(run.checks, "C5b", "Both videos are counted in the Media Portfolio", (media ?? 0) >= 25, `media = ${media}/35`);
      const own = await call("GET", "/profile-quality/me", { token });
      check(run.checks, "C5c", "Candidate can read their own score and breakdown", own.ok && own.body?.data?.quality?.score === quality?.score, `HTTP ${own.status}`);
    }

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
    check(run.checks, "C15", "Interview score on the card is in sync with the report", refreshed?.interviewScore === report.legacyScore100, `card ${refreshed?.interviewScore} vs report ${report.legacyScore100}`);
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
