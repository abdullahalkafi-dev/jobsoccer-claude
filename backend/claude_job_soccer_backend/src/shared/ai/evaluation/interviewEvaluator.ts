import { aiConfig } from "../ai.config";
import { UsageRecord } from "../client/openaiClient";
import { Rubric } from "../rubric/rubric.schema";
import { alignInterview, blockSeconds, blockText, countWords, findOutOfOrder, TBlock, TUnit, unmatchedWords } from "./alignment";
import { Confidence, EvaluationAlignmentInfo, EvaluationReport, ModelOutput, ModelQuestion } from "./evaluation.types";
import { buildReport } from "./guardrails";
import { TTranscriptContext } from "./promptBuilder";
import { OverallQuestionLine, scoreQuestion, writeOverall } from "./questionScorer";

/**
 * The interview assessment, in three steps (quality first, speed second):
 *  1. ALIGN   which lines of the recording are the answer to which question (two readings, in question order)
 *  2. SCORE   every answered question on its own lines only (several at the same time)
 *  3. SUMMARISE the overall section from the finished question results
 * Then plain code applies the client's rules (0-4, real-situation cap, verified quotes, review flags).
 */

export interface InterviewEvaluation {
  report: EvaluationReport;
  /** Everything the model returned, as JSON text (kept on the evaluation for audits). */
  rawOutput: string;
  model: string;
  promptVersion: string;
  usage: UsageRecord[];
}

const mapPool = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(Math.max(1, limit), items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
};

const notAnswered = (questionId: number, confidence: Confidence, rationale = ""): ModelQuestion => ({
  questionId,
  answerFound: false,
  score: null,
  confidence,
  evidence: [],
  missingEvidence: [],
  situation: false,
  action: false,
  outcome: false,
  redFlags: [],
  rationale,
});

const lineText = (block: TBlock): string => block.ranges.map((r) => (r.from === r.to ? `${r.from}` : `${r.from}-${r.to}`)).join(", ");

const list = (ids: number[]): string => ids.map((id) => `Q${id}`).join(", ");

export const evaluateInterview = async (
  rubric: Rubric,
  units: TUnit[],
  transcriptText: string,
  context: TTranscriptContext = {}
): Promise<InterviewEvaluation> => {
  const usage: UsageRecord[] = [];
  const questions = rubric.sections.flatMap((s) => s.questions);

  // 1. Align
  const aligned = await alignInterview(rubric, units, context);
  usage.push(...aligned.usage);
  const blockByQuestion = new Map(aligned.alignment.blocks.map((b) => [b.questionId, b]));
  const disputed = new Set(aligned.disputed);

  // 2. Score each answered question on its own lines
  const answers = questions.filter((q) => blockByQuestion.has(q.id));
  const scored = await mapPool(answers, aiConfig.alignment.scoreConcurrency, async (question) => {
    const block = blockByQuestion.get(question.id)!;
    const text = blockText(units, block);
    const result = await scoreQuestion(rubric, question, text, context);
    return { question, block, text, result };
  });
  for (const item of scored) usage.push(...item.result.usage);
  const scoredById = new Map(scored.map((item) => [item.question.id, item]));

  const sources = new Map<number, string>();
  const modelQuestions: ModelQuestion[] = questions.map((question): ModelQuestion => {
    const item = scoredById.get(question.id);
    if (!item) return notAnswered(question.id, disputed.has(question.id) ? "low" : "high");
    const out = item.result.output;
    if (out.addressesQuestion === "no" || out.score === null) return notAnswered(question.id, "medium", out.rationale);
    sources.set(question.id, item.text);
    return {
      questionId: question.id,
      answerFound: true,
      score: out.score,
      confidence: disputed.has(question.id) ? "low" : out.confidence,
      evidence: out.evidence,
      missingEvidence: out.missingEvidence,
      situation: out.situation,
      action: out.action,
      outcome: out.outcome,
      redFlags: out.redFlags,
      rationale: out.rationale,
    };
  });

  // How the recording was matched, and what looks odd about it
  const totalWords = units.reduce((n, u) => n + countWords(u.text), 0);
  const outOfOrder = findOutOfOrder(aligned.alignment.blocks);
  const unmatched = unmatchedWords(units, aligned.alignment);
  const answeredWords = scored.filter((s) => sources.has(s.question.id)).map((s) => countWords(s.text));
  const averageWords = answeredWords.length ? answeredWords.reduce((a, b) => a + b, 0) / answeredWords.length : 0;

  const reasons: string[] = [];
  if (outOfOrder.length) reasons.push(`answers are not in the usual question order (${list(outOfOrder)})`);
  if (aligned.disputed.length) reasons.push(`the two readings of the recording disagreed about ${list(aligned.disputed)}`);
  if (unmatched >= Math.max(40, totalWords * 0.12)) reasons.push(`${unmatched} words of speech did not match any question`);
  if (answeredWords.length >= 3 && averageWords < 12) reasons.push(`the answers are very short (about ${Math.round(averageWords)} words each)`);

  const alignment: EvaluationAlignmentInfo = {
    reviewed: aligned.reviewed,
    disputedQuestionIds: aligned.disputed,
    outOfOrderQuestionIds: outOfOrder,
    unmatchedWords: unmatched,
    totalWords,
    blocks: aligned.alignment.blocks.map((block) => ({
      questionId: block.questionId,
      lines: lineText(block),
      ...blockSeconds(units, block),
      words: countWords(blockText(units, block)),
      coverage: block.coverage,
    })),
  };

  const instructionAttempt = scored.some((s) => s.result.output.instructionAttempt);
  const draft: ModelOutput = {
    questions: modelQuestions,
    strongestAreas: [],
    mainWeaknesses: [],
    summary: "",
    overallConfidence: "high",
    audioOrTranscriptProblem: aligned.alignment.transcriptProblem,
    instructionAttempt,
  };
  const options = {
    sources,
    strictEvidence: true,
    extraReviewReasons: reasons,
    confidenceCap: reasons.length ? ("medium" as Confidence) : undefined,
    alignment,
  };

  // The rules are applied first so the summary is written from the FINAL question results.
  const preliminary = buildReport(rubric, draft, transcriptText, options);

  // 3. Overall section
  const lines: OverallQuestionLine[] = preliminary.questions.map((q) => ({
    id: q.questionId,
    text: questions.find((x) => x.id === q.questionId)!.text,
    answered: q.status === "scored",
    score: q.score,
    rationale: q.rationale,
    missing: q.missingEvidence,
  }));
  const overall = await writeOverall(rubric, lines);
  usage.push(...overall.usage);

  const built = buildReport(
    rubric,
    {
      ...draft,
      strongestAreas: overall.output.strongestAreas,
      mainWeaknesses: overall.output.mainWeaknesses,
      summary: overall.output.summary,
      overallConfidence: overall.output.overallConfidence,
    },
    transcriptText,
    options
  );
  const report: EvaluationReport = { ...built, improvementTips: (overall.output.improvementTips ?? []).slice(0, 3) };

  return {
    report,
    rawOutput: JSON.stringify({
      alignment: JSON.parse(aligned.rawOutput),
      questions: Object.fromEntries(scored.map((s) => [s.question.id, s.result.output])),
      overall: overall.output,
    }),
    model: aligned.model,
    promptVersion: aiConfig.promptVersion,
    usage,
  };
};
