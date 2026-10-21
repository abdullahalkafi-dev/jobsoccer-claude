import { aiConfig, capabilitiesFor } from "../ai.config";
import { aiClient, readChatUsage, recordUsage, UsageRecord } from "../client/openaiClient";
import { Rubric } from "../rubric/rubric.schema";
import { ModelOutput, modelOutputJsonSchema, modelOutputSchema } from "./evaluation.types";
import { buildEvaluationPrompt } from "./promptBuilder";

export interface EvaluatorResult {
  output: ModelOutput;
  rawOutput: string;
  model: string;
  promptVersion: string;
  usage: UsageRecord[];
}

export class EvaluationError extends Error {
  constructor(message: string, readonly usage: UsageRecord[], readonly rawOutput?: string) {
    super(message);
  }
}

/**
 * One structured-output call per candidate on the eval model (Sol).
 * If the reply does not match the schema, the model is asked once to repair it.
 */
export const evaluateTranscript = async (rubric: Rubric, transcript: string): Promise<EvaluatorResult> => {
  const model = aiConfig.models.eval;
  const caps = capabilitiesFor(model);
  const prompt = buildEvaluationPrompt(rubric, transcript);
  const usage: UsageRecord[] = [];

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user },
  ];

  let lastRaw: string | undefined;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const started = Date.now();
    const completion = await aiClient.chat.completions.create({
      model,
      messages,
      max_completion_tokens: 32_000,
      response_format: {
        type: "json_schema",
        json_schema: { name: "interview_evaluation", strict: true, schema: modelOutputJsonSchema as any },
      },
      ...(caps.supportsReasoningEffort ? { reasoning_effort: aiConfig.reasoningEffort } : {}),
      ...(caps.supportsTemperature ? { temperature: 0.2 } : {}),
    });
    usage.push(recordUsage("rubric-evaluation", completion.model ?? model, readChatUsage(completion.usage), Date.now() - started));

    const choice = completion.choices[0];
    lastRaw = choice?.message?.content ?? "";
    if (choice?.message?.refusal) {
      throw new EvaluationError(`Model refused: ${choice.message.refusal}`, usage, lastRaw);
    }

    let problem: string;
    try {
      const parsed = modelOutputSchema.safeParse(JSON.parse(lastRaw));
      if (parsed.success) {
        return { output: parsed.data, rawOutput: lastRaw, model: completion.model ?? model, promptVersion: aiConfig.promptVersion, usage };
      }
      problem = parsed.error.message;
    } catch (error: any) {
      problem = `invalid JSON: ${error.message}`;
    }
    if (choice?.finish_reason === "length") problem = "the reply was cut off (token limit)";

    messages.push({ role: "assistant", content: lastRaw });
    messages.push({ role: "user", content: `Your reply did not match the required format (${problem}). Return the complete JSON again.` });
  }
  throw new EvaluationError("Model output did not match the schema after a repair attempt", usage, lastRaw);
};
