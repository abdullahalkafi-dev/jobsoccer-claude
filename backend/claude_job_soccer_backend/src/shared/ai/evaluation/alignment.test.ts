import { describe, expect, it } from "vitest";
import {
  buildUnits,
  checkAlignment,
  disputedQuestions,
  findOutOfOrder,
  formatUnits,
  normalizeAlignment,
  TAlignment,
  TAlignmentOutput,
  TBlock,
  unmatchedWords,
} from "./alignment";

const ids = [1, 2, 3, 4, 5];

const output = (answers: TAlignmentOutput["answers"], otherLines: TAlignmentOutput["otherLines"] = []): TAlignmentOutput => ({
  answers,
  otherLines,
  transcriptProblem: false,
  changes: [],
});
const answer = (questionId: number, from: number, to = from): TAlignmentOutput["answers"][number] => ({
  questionId,
  ranges: [{ from, to }],
  coverage: "direct",
  note: "",
});
const block = (questionId: number, from: number, to = from): TBlock => ({ questionId, ranges: [{ from, to }], coverage: "direct", note: "" });
const alignment = (blocks: TBlock[], other: TAlignment["other"] = []): TAlignment => ({ blocks, other, transcriptProblem: false, overlaps: [], changes: [] });

describe("buildUnits", () => {
  it("splits caption cues into numbered sentences and spreads the time over them", () => {
    const units = buildUnits([{ start: 0, end: 10, text: "I coach youth teams every week. I also run the academy sessions." }]);
    expect(units.map((u) => u.index)).toEqual([1, 2]);
    expect(units[0].text).toBe("I coach youth teams every week.");
    expect(units[0].start).toBe(0);
    expect(units[1].end).toBe(10);
    expect(units[1].start).toBeGreaterThan(0);
  });

  it("joins very short fragments to the previous sentence", () => {
    const units = buildUnits([{ start: 0, end: 6, text: "I enjoy the work very much. Thank you." }]);
    expect(units).toHaveLength(1);
    expect(units[0].text).toContain("Thank you.");
  });

  it("falls back to the plain text (no times) when there are no caption cues", () => {
    const units = buildUnits([], "I started as a youth coach. Then I moved to the academy.");
    expect(units).toHaveLength(2);
    expect(units[0].start).toBeUndefined();
    expect(formatUnits(units)).toMatch(/^\[1\] I started/);
  });

  it("cuts a very long unpunctuated stretch into smaller lines", () => {
    const text = Array.from({ length: 130 }, (_, i) => `word${i}`).join(" ");
    expect(buildUnits([{ start: 0, end: 60, text }]).length).toBeGreaterThanOrEqual(3);
  });
});

describe("checkAlignment", () => {
  it("accepts a clean alignment", () => {
    expect(checkAlignment(output([answer(1, 2), answer(2, 3, 4)]), 6, ids)).toBeNull();
  });

  it("reports a line used for two questions, unknown questions and ranges outside the transcript", () => {
    expect(checkAlignment(output([answer(1, 2, 4), answer(2, 4)]), 6, ids)).toMatch(/two different questions/);
    expect(checkAlignment(output([answer(9, 1)]), 6, ids)).toMatch(/does not exist/);
    expect(checkAlignment(output([answer(1, 5, 9)]), 6, ids)).toMatch(/outside lines/);
    expect(checkAlignment(output([answer(1, 1), answer(1, 2)]), 6, ids)).toMatch(/listed twice/);
  });
});

describe("normalizeAlignment", () => {
  it("gives a contested line to the earlier question and records it", () => {
    const result = normalizeAlignment(output([answer(2, 4, 6), answer(1, 3, 4)]), 8, ids);
    expect(result.blocks.map((b) => b.questionId)).toEqual([1, 2]);
    expect(result.blocks[0].ranges).toEqual([{ from: 3, to: 4 }]);
    expect(result.blocks[1].ranges).toEqual([{ from: 5, to: 6 }]);
    expect(result.overlaps).toEqual([4]);
  });

  it("drops unknown questions and invalid ranges instead of failing", () => {
    const result = normalizeAlignment(output([answer(9, 1), answer(1, 7, 99), answer(2, 2)]), 8, ids);
    expect(result.blocks.map((b) => b.questionId)).toEqual([2]);
  });
});

describe("findOutOfOrder", () => {
  it("finds nothing when answers follow the question order, with gaps", () => {
    expect(findOutOfOrder([block(1, 1), block(3, 2), block(4, 3), block(7, 4)])).toEqual([]);
  });

  it("flags the answer that breaks the order", () => {
    expect(findOutOfOrder([block(1, 1), block(3, 2), block(2, 3), block(4, 4)])).toEqual([2]);
  });
});

describe("unmatchedWords", () => {
  it("counts speech that no question and no intro/closing/filler claimed", () => {
    const units = buildUnits([
      { start: 0, end: 2, text: "Hello my name is Sam." },
      { start: 2, end: 6, text: "I coach the under twelve team on Saturdays." },
      { start: 6, end: 9, text: "I like cooking pasta for my family." },
      { start: 9, end: 11, text: "Thank you very much." },
    ]);
    const result = alignment([block(1, 2)], [
      { from: 1, to: 1, kind: "intro" },
      { from: 4, to: 4, kind: "closing" },
    ]);
    expect(unmatchedWords(units, result)).toBe(7); // line 3 only
    expect(unmatchedWords(units, alignment([block(1, 2)], [{ from: 3, to: 3, kind: "unmatched" }]))).toBeGreaterThan(7);
  });
});

describe("disputedQuestions", () => {
  it("lists questions that one reading answered and the other did not, or placed elsewhere", () => {
    const first = alignment([block(1, 1, 2), block(2, 3), block(3, 6, 7)]);
    const second = alignment([block(1, 1, 2), block(3, 4, 5)]);
    expect(disputedQuestions(first, second)).toEqual([2, 3]);
    expect(disputedQuestions(first, first)).toEqual([]);
  });
});
