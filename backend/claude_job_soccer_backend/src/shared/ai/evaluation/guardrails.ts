import { bandFor } from "../rubric/rubric.registry";
import { Rubric } from "../rubric/rubric.schema";
import {
  Confidence,
  EvaluationReport,
  EvaluationTotals,
  ModelOutput,
  ModelQuestion,
  QuestionResult,
} from "./evaluation.types";

/**
 * Deterministic rules applied to the model's proposal. The client's rules are
 * enforced here in code, not only requested in the prompt.
 */

export const DISCLAIMER =
  "AI-assisted assessment of the interview answers only. It is guidance for recruiters, not an objective fact or a hiring decision. Qualifications, references and practical work have not been verified.";

const normalise = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Keep only quotes that really appear in the transcript (case/punctuation-insensitive). */
export const verifyEvidence = (evidence: string[], transcript: string): string[] => {
  const haystack = normalise(transcript);
  return evidence.filter((quote) => {
    const needle = normalise(quote);
    return needle.length >= 3 && haystack.includes(needle);
  });
};

const lower = (a: Confidence, b: Confidence): Confidence => {
  const order: Confidence[] = ["low", "medium", "high"];
  return order[Math.min(order.indexOf(a), order.indexOf(b))];
};

export const applyQuestionRules = (
  rubric: Rubric,
  sectionId: string,
  questionId: number,
  proposal: ModelQuestion | undefined,
  transcript: string
): QuestionResult => {
  const question = rubric.sections.flatMap((s) => s.questions).find((q) => q.id === questionId)!;

  // Missing from the model output or not answered -> "not answered", never 0.
  if (!proposal || !proposal.answerFound || proposal.score === null) {
    return {
      questionId,
      sectionId,
      status: "not_answered",
      score: null,
      modelScore: proposal?.score ?? null,
      confidence: proposal ? proposal.confidence : "low",
      evidence: [],
      missingEvidence: proposal?.missingEvidence ?? [],
      redFlags: proposal?.redFlags ?? [],
      rationale: proposal?.rationale || "No answer to this question was found in the interview.",
      adjustments: proposal ? [] : ["question missing from model output"],
    };
  }

  const adjustments: string[] = [];
  let score = Math.min(4, Math.max(0, Math.round(proposal.score)));
  let confidence = proposal.confidence;

  const evidence = verifyEvidence(proposal.evidence, transcript);
  if (evidence.length < proposal.evidence.length) {
    adjustments.push(`${proposal.evidence.length - evidence.length} quote(s) not found in transcript removed`);
  }

  // Client rule: 4/4 on a real-situation question needs situation + action + outcome.
  if (question.requiresRealSituation && score === 4 && !(proposal.situation && proposal.action && proposal.outcome)) {
    score = 3;
    adjustments.push("real-situation cap: 4 needs situation, action and outcome");
  }

  // A high score must be backed by something the candidate actually said.
  if (score >= 3 && evidence.length === 0) {
    score = 2;
    confidence = "low";
    adjustments.push("no verified evidence for a score of 3+");
  }

  return {
    questionId,
    sectionId,
    status: "scored",
    score,
    modelScore: proposal.score,
    confidence,
    evidence,
    missingEvidence: proposal.missingEvidence,
    redFlags: proposal.redFlags,
    rationale: proposal.rationale,
    adjustments,
  };
};

export const computeTotals = (rubric: Rubric, questions: QuestionResult[]): EvaluationTotals => {
  const scored = questions.filter((q) => q.status === "scored");
  const earned = scored.reduce((n, q) => n + (q.score ?? 0), 0);
  const bySection: EvaluationTotals["bySection"] = {};
  for (const section of rubric.sections) {
    const inSection = questions.filter((q) => q.sectionId === section.id);
    bySection[section.id] = {
      earned: inSection.reduce((n, q) => n + (q.score ?? 0), 0),
      max: section.questions.length * rubric.maxScorePerQuestion,
    };
  }
  const notAnsweredCount = questions.length - scored.length;
  return {
    earned,
    available: scored.length * rubric.maxScorePerQuestion,
    max: rubric.maxTotalScore,
    answeredCount: scored.length,
    notAnsweredCount,
    percentage: Math.round((earned / rubric.maxTotalScore) * 1000) / 10,
    band: notAnsweredCount === 0 ? bandFor(rubric, earned) : null,
    bySection,
  };
};

/** Turn a validated model output into the final report. */
export const buildReport = (rubric: Rubric, output: ModelOutput, transcript: string): EvaluationReport => {
  const byId = new Map(output.questions.map((q) => [q.questionId, q]));
  const questions = rubric.sections.flatMap((section) =>
    section.questions.map((q) => applyQuestionRules(rubric, section.id, q.id, byId.get(q.id), transcript))
  );
  const totals = computeTotals(rubric, questions);

  const reviewReasons: string[] = [];
  const flagged = questions.filter((q) => q.redFlags.length > 0);
  if (flagged.length) reviewReasons.push(`red flags on question(s) ${flagged.map((q) => q.questionId).join(", ")}`);
  if (output.instructionAttempt) reviewReasons.push("the transcript tried to instruct the scoring");
  if (output.audioOrTranscriptProblem) reviewReasons.push("audio or transcript could not be fully assessed");
  if (totals.answeredCount === 0) reviewReasons.push("no answers were found");
  let overallConfidence = output.overallConfidence;
  if (output.audioOrTranscriptProblem || totals.notAnsweredCount > rubric.questionCount / 2) {
    overallConfidence = lower(overallConfidence, "low");
  }
  if (overallConfidence === "low") reviewReasons.push("low confidence");

  return {
    rubricId: rubric.rubricId,
    rubricVersion: rubric.version,
    position: rubric.position,
    displayName: rubric.displayName,
    questions,
    totals,
    strongestAreas: output.strongestAreas,
    mainWeaknesses: output.mainWeaknesses,
    summary: output.summary,
    overallConfidence,
    needsHumanReview: reviewReasons.length > 0,
    reviewReasons,
    legacyScore100: Math.round(totals.percentage),
    disclaimer: DISCLAIMER,
  };
};
