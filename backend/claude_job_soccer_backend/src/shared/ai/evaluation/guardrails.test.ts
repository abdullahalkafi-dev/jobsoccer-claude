import { describe, expect, it } from "vitest";
import { getRubric } from "../rubric/rubric.registry";
import { buildCalibrationTranscript } from "./calibration";
import { ModelOutput, ModelQuestion, modelOutputSchema } from "./evaluation.types";
import { buildReport, verifyEvidence } from "./guardrails";
import { buildEvaluationPrompt, selectAnchorExamples } from "./promptBuilder";

const rubric = getRubric("on_field_staff.attacking_coach.v1")!; // 18 questions, Q14/Q17 need a real situation
const transcript = buildCalibrationTranscript(rubric);
const allQuestions = rubric.sections.flatMap((s) => s.questions);

const answer = (id: number, overrides: Partial<ModelQuestion> = {}): ModelQuestion => {
  const q = allQuestions.find((x) => x.id === id)!;
  return {
    questionId: id,
    answerFound: true,
    score: q.calibration!.suggestedScore,
    confidence: "high",
    evidence: [q.calibration!.response.split(" ").slice(0, 6).join(" ")],
    missingEvidence: [],
    situation: false,
    action: false,
    outcome: false,
    redFlags: [],
    rationale: "ok",
    ...overrides,
  };
};

const output = (questions: ModelQuestion[], overrides: Partial<ModelOutput> = {}): ModelOutput => ({
  questions,
  strongestAreas: ["a"],
  mainWeaknesses: ["b"],
  summary: "s",
  overallConfidence: "high",
  audioOrTranscriptProblem: false,
  instructionAttempt: false,
  ...overrides,
});

describe("buildReport", () => {
  it("reproduces the client's sample total when the model agrees (46/72 = 63.9%)", () => {
    const report = buildReport(rubric, output(allQuestions.map((q) => answer(q.id))), transcript);
    expect(report.totals.earned).toBe(46);
    expect(report.totals.percentage).toBe(63.9);
    expect(report.totals.band).toBe("Basic/acceptable evidence");
    expect(report.legacyScore100).toBe(64);
    expect(report.needsHumanReview).toBe(false);
  });

  it("never turns a missing answer into 0 and gives no band when answers are missing", () => {
    const qs = allQuestions.filter((q) => q.id !== 5).map((q) => answer(q.id));
    qs.push(answer(6, { questionId: 6 })); // duplicate is ignored by id map
    const report = buildReport(rubric, output(qs.filter((q, i, a) => a.findIndex((x) => x.questionId === q.questionId) === i)), transcript);
    const q5 = report.questions.find((q) => q.questionId === 5)!;
    expect(q5.status).toBe("not_answered");
    expect(q5.score).toBeNull();
    expect(report.totals.notAnsweredCount).toBe(1);
    expect(report.totals.available).toBe(68);
    expect(report.totals.band).toBeNull();
  });

  it("caps 4/4 on a real-situation question without situation, action and outcome", () => {
    const report = buildReport(rubric, output([answer(14, { score: 4 })]), transcript);
    const q14 = report.questions.find((q) => q.questionId === 14)!;
    expect(q14.score).toBe(3);
    expect(q14.adjustments.join()).toMatch(/real-situation/);

    const full = buildReport(rubric, output([answer(14, { score: 4, situation: true, action: true, outcome: true })]), transcript);
    expect(full.questions.find((q) => q.questionId === 14)!.score).toBe(4);
  });

  it("drops invented quotes and caps unsupported high scores", () => {
    const report = buildReport(rubric, output([answer(1, { score: 4, evidence: ["I won the champions league twice"] })]), transcript);
    const q1 = report.questions.find((q) => q.questionId === 1)!;
    expect(q1.evidence).toEqual([]);
    expect(q1.score).toBe(2);
    expect(q1.confidence).toBe("low");
  });

  it("routes red flags, instruction attempts and audio problems to human review", () => {
    const report = buildReport(
      rubric,
      output([answer(2, { redFlags: ["discriminatory remark"] })], { instructionAttempt: true }),
      transcript
    );
    expect(report.needsHumanReview).toBe(true);
    expect(report.reviewReasons.join(" ")).toMatch(/red flags on question\(s\) 2/);
    expect(report.reviewReasons.join(" ")).toMatch(/instruct/);
  });
});

describe("verifyEvidence", () => {
  it("matches quotes regardless of case and punctuation", () => {
    expect(verifyEvidence(["I Coached Academy teams"], "i coached academy teams, for four years")).toHaveLength(1);
    expect(verifyEvidence(["made up"], "nothing like it")).toHaveLength(0);
  });
});

describe("prompt", () => {
  it("puts the rubric before the transcript and marks the transcript as data", () => {
    const prompt = buildEvaluationPrompt(rubric, "hello");
    expect(prompt.user.indexOf("Q18.")).toBeLessThan(prompt.user.indexOf("<<<TRANSCRIPT"));
    expect(prompt.system).toMatch(/untrusted data/);
  });

  it("calibration examples never come from the position being scored", () => {
    for (const id of ["on_field_staff.attacking_coach.v1", "on_field_staff.mental_coach.v1"]) {
      const r = getRubric(id)!;
      const anchors = selectAnchorExamples(r);
      expect(anchors.length).toBe(10);
      expect(anchors.every((a) => a.position !== r.displayName)).toBe(true);
    }
  });

  it("JSON schema and zod schema agree on a valid object", () => {
    expect(modelOutputSchema.safeParse(output([answer(1)])).success).toBe(true);
  });
});
