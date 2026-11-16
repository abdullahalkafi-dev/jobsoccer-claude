import { z } from "zod";
import { capabilitiesFor, ReasoningEffort } from "../ai.config";
import { aiClient, readChatUsage, recordUsage, UsageRecord } from "../client/openaiClient";

/**
 * One structured-output call on a chat model, validated with zod.
 * If the reply does not match the schema (or `check` finds a problem in it),
 * the model is asked once to correct it. Never returns an unchecked result.
 */

export class StructuredCallError extends Error {
  constructor(message: string, readonly usage: UsageRecord[], readonly rawOutput?: string) {
    super(message);
  }
}

export interface StructuredCallOptions<T> {
  /** Name used in the usage log, e.g. "interview-alignment". */
  task: string;
  model: string;
  system: string;
  user: string;
  schemaName: string;
  jsonSchema: Record<string, unknown>;
  schema: z.ZodType<T>;
  effort?: ReasoningEffort;
  maxTokens?: number;
  /** Extra check on the parsed reply; return a short problem description to trigger the correction round. */
  check?: (parsed: T) => string | null;
}

export interface StructuredCallResult<T> {
  output: T;
  rawOutput: string;
  model: string;
  usage: UsageRecord[];
}

export const callStructured = async <T>(options: StructuredCallOptions<T>): Promise<StructuredCallResult<T>> => {
  const caps = capabilitiesFor(options.model);
  const usage: UsageRecord[] = [];
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: options.system },
    { role: "user", content: options.user },
  ];

  let lastRaw: string | undefined;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const started = Date.now();
    const completion = await aiClient.chat.completions.create({
      model: options.model,
      messages,
      max_completion_tokens: options.maxTokens ?? 16_000,
      response_format: {
        type: "json_schema",
        json_schema: { name: options.schemaName, strict: true, schema: options.jsonSchema as any },
      },
      ...(caps.supportsReasoningEffort && options.effort ? { reasoning_effort: options.effort } : {}),
      ...(caps.supportsTemperature ? { temperature: 0.2 } : {}),
    });
    usage.push(recordUsage(options.task, completion.model ?? options.model, readChatUsage(completion.usage), Date.now() - started));

    const choice = completion.choices[0];
    lastRaw = choice?.message?.content ?? "";
    if (choice?.message?.refusal) {
      throw new StructuredCallError(`Model refused: ${choice.message.refusal}`, usage, lastRaw);
    }

    let problem: string | null;
    try {
      const parsed = options.schema.safeParse(JSON.parse(lastRaw));
      if (parsed.success) {
        problem = options.check ? options.check(parsed.data) : null;
        if (!problem) return { output: parsed.data, rawOutput: lastRaw, model: completion.model ?? options.model, usage };
      } else {
        problem = parsed.error.message;
      }
    } catch (error: any) {
      problem = `invalid JSON: ${error.message}`;
    }
    if (choice?.finish_reason === "length") problem = "the reply was cut off (token limit)";

    messages.push({ role: "assistant", content: lastRaw });
    messages.push({ role: "user", content: `Your reply cannot be used (${problem}). Return the complete corrected JSON again.` });
  }
  throw new StructuredCallError(`${options.task}: the model reply was not usable after a correction round`, usage, lastRaw);
};
