import { z } from "zod";

/**
 * A "rubric" is the client's scoring guide for one position: the questions,
 * what earns 0-4 on each, the mandatory rules, the score bands and the
 * client's sample answers (used as test cases).
 *
 * Position files (rubrics/on_field_staff.*.json) extend a shared base
 * (rubrics/interview.base.v1.json). Client wording is kept as written.
 */

const bandSchema = z.object({
  min: z.number().int().min(0),
  max: z.number().int().min(0),
  label: z.string().min(1),
});

const calibrationSchema = z.object({
  response: z.string().min(1),
  suggestedScore: z.number().int().min(0).max(4),
  label: z.string().nullable(),
  assessment: z.string().nullable(),
});

const questionSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1),
  evaluates: z.string().min(1),
  strong: z.array(z.string().min(1)).min(1),
  acceptable: z.string().min(1),
  weakOrConcerning: z.string().min(1),
  /** Our reading of the question: a 4/4 needs situation + action + outcome. */
  requiresRealSituation: z.boolean(),
  calibration: calibrationSchema.optional(),
});

const sectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  questions: z.array(questionSchema).min(1),
});

export const rubricFileSchema = z
  .object({
    rubricId: z.string().regex(/^[a-z_]+(\.[a-z_]+)+\.v\d+$/),
    version: z.number().int().positive(),
    status: z.enum(["draft-from-client-doc", "approved"]),
    extends: z.string().optional(),
    sourceFile: z.string().min(1),
    role: z.string().min(1),
    /** Value stored on the profile (TPosition). */
    position: z.string().min(1),
    /** Name used in the client's document; shown to users. */
    displayName: z.string().min(1),
    level: z.string().optional(),
    clientRoleId: z.string().optional(),
    evaluationApproach: z.object({
      summary: z.string().nullable(),
      corePrinciple: z.string().nullable(),
    }),
    maxScorePerQuestion: z.literal(4),
    maxTotalScore: z.number().int().positive(),
    mandatoryRules: z.array(z.object({ id: z.string(), rule: z.string().min(1) })).min(1),
    humanReviewFlags: z.array(z.string()).optional(),
    bands: z.array(bandSchema).optional(),
    calibrationOverall: z
      .object({
        totalScore: z.string().nullable().optional(),
        percentage: z.string().nullable().optional(),
        classification: z.string().nullable().optional(),
        strongestAreas: z.string().nullable().optional(),
        mainWeaknesses: z.string().nullable().optional(),
        summary: z.string().nullable().optional(),
      })
      .optional(),
    sections: z.array(sectionSchema).min(1),
  })
  .superRefine((rubric, ctx) => {
    const questions = rubric.sections.flatMap((s) => s.questions);
    if (rubric.maxTotalScore !== questions.length * rubric.maxScorePerQuestion) {
      ctx.addIssue({
        code: "custom",
        message: `maxTotalScore ${rubric.maxTotalScore} != ${questions.length} questions x ${rubric.maxScorePerQuestion}`,
      });
    }
    questions.forEach((q, index) => {
      if (q.id !== index + 1) {
        ctx.addIssue({ code: "custom", message: `question ids must be 1..n in order (found ${q.id} at position ${index + 1})` });
      }
    });
  });

export const rubricBaseSchema = z.object({
  baseId: z.string().min(1),
  description: z.string(),
  scale: z.array(z.object({ score: z.number().int(), label: z.string(), meaning: z.string() })).min(2),
  consistencyClassifications: z.array(z.object({ id: z.string(), label: z.string(), meaning: z.string() })),
  outputRequirements: z.object({
    perQuestion: z.array(z.string()),
    overall: z.array(z.string()),
    scoreCalculation: z.string(),
    consistencyNote: z.string(),
  }),
  humanOversight: z.string(),
  fairness: z.string(),
  auditability: z.string(),
  defaultBands: z.record(z.string(), z.array(bandSchema)),
});

export type RubricFile = z.infer<typeof rubricFileSchema>;
export type RubricBase = z.infer<typeof rubricBaseSchema>;
export type RubricQuestion = z.infer<typeof questionSchema>;
export type RubricBand = z.infer<typeof bandSchema>;

/** A position rubric merged with its base: everything the evaluator needs. */
export type Rubric = Omit<RubricFile, "bands"> & {
  bands: RubricBand[];
  scale: RubricBase["scale"];
  consistencyClassifications: RubricBase["consistencyClassifications"];
  outputRequirements: RubricBase["outputRequirements"];
  humanOversight: string;
  fairness: string;
  questionCount: number;
};
