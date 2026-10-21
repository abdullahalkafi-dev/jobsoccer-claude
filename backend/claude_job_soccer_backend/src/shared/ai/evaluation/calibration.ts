import { Rubric } from "../rubric/rubric.schema";
import { EvaluationReport } from "./evaluation.types";

/**
 * The client's sample answers turned into an interview transcript, used to
 * check that the AI scores like the client does.
 */
export const buildCalibrationTranscript = (rubric: Rubric): string =>
  rubric.sections
    .flatMap((s) => s.questions)
    .map((q) => `Interviewer: ${q.text}\nCandidate: ${q.calibration?.response ?? ""}`)
    .join("\n\n");

export interface CalibrationComparison {
  rubricId: string;
  questions: number;
  exact: number;
  withinOne: number;
  expectedTotal: number;
  actualTotal: number;
  differences: { questionId: number; expected: number; actual: number | null }[];
}

export const compareWithCalibration = (rubric: Rubric, report: EvaluationReport): CalibrationComparison => {
  const expected = new Map(
    rubric.sections.flatMap((s) => s.questions).map((q) => [q.id, q.calibration?.suggestedScore ?? 0])
  );
  const differences: CalibrationComparison["differences"] = [];
  let exact = 0;
  let withinOne = 0;
  for (const q of report.questions) {
    const want = expected.get(q.questionId)!;
    if (q.score === want) exact++;
    if (q.score !== null && Math.abs(q.score - want) <= 1) withinOne++;
    if (q.score !== want) differences.push({ questionId: q.questionId, expected: want, actual: q.score });
  }
  return {
    rubricId: rubric.rubricId,
    questions: report.questions.length,
    exact,
    withinOne,
    expectedTotal: [...expected.values()].reduce((a, b) => a + b, 0),
    actualTotal: report.totals.earned,
    differences,
  };
};
