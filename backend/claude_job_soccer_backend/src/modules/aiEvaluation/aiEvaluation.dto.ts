import { z } from "zod";

const correctionDto = z.object({
  body: z
    .object({
      questionId: z.number().int().positive().optional(),
      newScore: z.number().int().min(0).max(4).nullable().optional(),
      reviewStatus: z.enum(["reviewed", "needs_follow_up"]).optional(),
      reason: z.string().trim().min(3, "Please give a reason"),
    })
    .refine((b) => b.newScore === undefined || b.questionId !== undefined, {
      message: "newScore needs a questionId",
    }),
});

const questionsDto = z.object({
  query: z.object({
    position: z.string().trim().min(1, "position is required"),
    level: z.string().trim().optional(),
  }),
});

export const AiEvaluationDto = {
  correctionDto,
  questionsDto,
};
