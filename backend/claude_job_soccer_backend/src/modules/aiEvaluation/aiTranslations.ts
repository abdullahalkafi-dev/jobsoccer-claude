import crypto from "crypto";
import { AiLang } from "../../shared/ai/i18n/lang";
import { NO_SPEECH_SUMMARY } from "../../shared/ai/evaluation/guardrails";
import { translateAiTextGroups } from "../../shared/ai/translate/translateAiText";
import { TAiEvaluation, TStoredTranslation } from "./aiEvaluation.interface";
import { AiEvaluation } from "./aiEvaluation.model";

type TTexts = { summary: string; strongestAreas: string[]; mainWeaknesses: string[] };

const hashOf = (texts: TTexts): string => crypto.createHash("sha256").update(JSON.stringify(texts)).digest("hex").slice(0, 24);

/**
 * The AI texts of an evaluation in the viewer's language.
 * Generated once per language and evaluation (one cheap LLM call), then read from the cache stored on
 * the evaluation. English or any failure returns the English texts. The fixed no-speech summary is not sent
 * to the model (it has a static translation in the catalog, applied by the caller).
 */
export const getLocalizedTexts = async (
  doc: Pick<TAiEvaluation, "_id" | "translations">,
  texts: TTexts,
  lang: AiLang
): Promise<TTexts> => {
  if (lang === "en") return texts;
  const key = lang as "es" | "fr";
  const hash = hashOf(texts);
  const cached = doc.translations?.[key];
  if (cached && cached.hash === hash) return { summary: cached.summary, strongestAreas: cached.strongestAreas, mainWeaknesses: cached.mainWeaknesses };

  const fixedSummary = texts.summary === NO_SPEECH_SUMMARY;
  const translated = await translateAiTextGroups(
    { summary: fixedSummary ? [] : [texts.summary], strongestAreas: texts.strongestAreas, mainWeaknesses: texts.mainWeaknesses },
    lang
  );
  const result: TTexts = {
    summary: fixedSummary ? texts.summary : translated.summary[0] ?? texts.summary,
    strongestAreas: translated.strongestAreas,
    mainWeaknesses: translated.mainWeaknesses,
  };

  // Only a real translation is cached (a failure returns the English text, which must be retried next time).
  const changed =
    result.summary !== texts.summary || result.strongestAreas.some((t, i) => t !== texts.strongestAreas[i]) || result.mainWeaknesses.some((t, i) => t !== texts.mainWeaknesses[i]);
  if (changed && doc._id) {
    const stored: TStoredTranslation = { hash, ...result, createdAt: new Date() };
    await AiEvaluation.updateOne({ _id: doc._id }, { $set: { [`translations.${key}`]: stored } }).catch(() => undefined);
  }
  return result;
};
