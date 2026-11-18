import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./structuredCall", () => ({
  callStructured: vi.fn(),
  StructuredCallError: class StructuredCallError extends Error {},
}));

import { getRubric } from "../rubric/rubric.registry";
import { buildUnits } from "./alignment";
import { evaluateInterview } from "./interviewEvaluator";
import { callStructured } from "./structuredCall";

const rubric = getRubric("office_staff.digital_marketing.v1")!;

const units = buildUnits([
  { start: 0, end: 4, text: "Hello, my name is Sam and I work in digital marketing." },
  { start: 4, end: 10, text: "I have four years of experience with a sports club and a charity." },
  { start: 10, end: 16, text: "I love football and want to build a community around the game." },
  { start: 16, end: 22, text: "My job is to run campaigns and report the results." },
  { start: 22, end: 24, text: "Thank you for your time today." },
]);
const transcript = units.map((u) => u.text).join(" ");

type Handler = (options: any) => unknown;
let handlers: Record<string, Handler>;

const aligned = (answers: [number, number][], transcriptProblem = false) => ({
  answers: answers.map(([questionId, line]) => ({ questionId, ranges: [{ from: line, to: line }], coverage: "direct", note: "" })),
  otherLines: [
    { from: 1, to: 1, kind: "intro" },
    { from: 5, to: 5, kind: "closing" },
  ],
  transcriptProblem,
  changes: [],
});

const scored = (overrides: Record<string, unknown> = {}) => ({
  addressesQuestion: "fully",
  score: 2,
  confidence: "high",
  evidence: [] as string[],
  missingEvidence: [],
  situation: false,
  action: false,
  outcome: false,
  redFlags: [],
  instructionAttempt: false,
  rationale: "ok",
  ...overrides,
});

const overall = (summary = "14 of 18 were answered.") => ({
  strongestAreas: ["a"],
  mainWeaknesses: ["b"],
  summary,
  overallConfidence: "high",
  improvementTips: ["Q4: give a measurable goal.", "Q5: say how you choose the audience.", "Answer Q6."],
});

beforeEach(() => {
  handlers = {
    "interview-alignment": () => aligned([[1, 2], [2, 3], [3, 4]]),
    "interview-alignment-review": () => aligned([[1, 2], [2, 3], [3, 4]]),
    "question-score": (options) => {
      const id = Number(/QUESTION TO SCORE:\nQ(\d+)\./.exec(options.user)![1]);
      if (id === 1) return scored({ evidence: ["four years of experience"] });
      if (id === 2) return scored({ evidence: ["build a community around the game"] });
      return scored({ evidence: ["run campaigns and report the results"] });
    },
    "interview-overall": () => overall("3 of 18 questions were answered."),
  };
  vi.mocked(callStructured).mockImplementation((async (options: any) => {
    const out = handlers[options.task](options);
    return { output: out, rawOutput: JSON.stringify(out), model: "test-model", usage: [] };
  }) as any);
});

describe("evaluateInterview", () => {
  it("counts only the questions that have their own answer and leaves the rest as not answered", async () => {
    const { report } = await evaluateInterview(rubric, units, transcript);
    expect(report.totals.answeredCount).toBe(3);
    expect(report.totals.notAnsweredCount).toBe(15);
    expect(report.questions.find((q) => q.questionId === 4)!.status).toBe("not_answered");
    expect(report.totals.band).toBeNull();
    expect(report.alignment?.blocks.map((b) => b.questionId)).toEqual([1, 2, 3]);
    expect(report.alignment?.reviewed).toBe(true);
  });

  it("scores each question from its own lines only (the scorer never sees the other lines)", async () => {
    const seen: Record<number, string> = {};
    handlers["question-score"] = (options) => {
      const id = Number(/QUESTION TO SCORE:\nQ(\d+)\./.exec(options.user)![1]);
      seen[id] = /<<<ANSWER\n([\s\S]*)\nANSWER>>>/.exec(options.user)![1];
      return scored({ evidence: [seen[id].split(" ").slice(0, 3).join(" ")] });
    };
    await evaluateInterview(rubric, units, transcript);
    expect(seen[1]).toBe("I have four years of experience with a sports club and a charity.");
    expect(seen[2]).not.toContain("four years");
    expect(seen[3]).not.toContain("football");
  });

  it("does not count an answer when the scorer says the lines are about something else", async () => {
    handlers["question-score"] = (options) => {
      const id = Number(/QUESTION TO SCORE:\nQ(\d+)\./.exec(options.user)![1]);
      return id === 2
        ? scored({ addressesQuestion: "no", score: null, rationale: "talks about something else" })
        : scored({ evidence: id === 1 ? ["four years of experience"] : ["run campaigns and report the results"] });
    };
    const { report } = await evaluateInterview(rubric, units, transcript);
    const q2 = report.questions.find((q) => q.questionId === 2)!;
    expect(q2.status).toBe("not_answered");
    expect(q2.score).toBeNull();
    expect(report.totals.answeredCount).toBe(2);
  });

  it("does not count an answer that has no quote from its own lines (a quote taken from another answer is dropped)", async () => {
    handlers["question-score"] = (options) => {
      const id = Number(/QUESTION TO SCORE:\nQ(\d+)\./.exec(options.user)![1]);
      // Q3 quotes Q1's sentence: it is not part of Q3's own lines
      return id === 3 ? scored({ evidence: ["four years of experience"] }) : scored({ evidence: id === 1 ? ["four years of experience"] : ["build a community around the game"] });
    };
    const { report } = await evaluateInterview(rubric, units, transcript);
    const q3 = report.questions.find((q) => q.questionId === 3)!;
    expect(q3.status).toBe("not_answered");
    expect(q3.adjustments.join()).toMatch(/no quote/);
    expect(report.totals.answeredCount).toBe(2);
  });

  it("sends the interview to review and lowers confidence when the two readings disagree", async () => {
    handlers["interview-alignment-review"] = () => aligned([[1, 2], [2, 3]]);
    const { report } = await evaluateInterview(rubric, units, transcript);
    expect(report.alignment?.disputedQuestionIds).toEqual([3]);
    expect(report.needsHumanReview).toBe(true);
    expect(report.reviewReasons.join(" ")).toMatch(/disagreed about Q3/);
    expect(report.overallConfidence).not.toBe("high");
  });

  it("flags answers that are not in the usual question order", async () => {
    const reorder = () => aligned([[2, 2], [1, 3], [3, 4]]);
    handlers["interview-alignment"] = reorder;
    handlers["interview-alignment-review"] = reorder;
    const { report } = await evaluateInterview(rubric, units, transcript);
    expect(report.alignment?.outOfOrderQuestionIds).toHaveLength(1);
    expect(report.reviewReasons.join(" ")).toMatch(/usual question order/);
  });

  it("always states the real answered count in the summary", async () => {
    handlers["interview-overall"] = () => overall("The candidate described a clear community focus.");
    const { report } = await evaluateInterview(rubric, units, transcript);
    expect(report.summary.startsWith("3 of 18 questions were answered.")).toBe(true);
  });
});
