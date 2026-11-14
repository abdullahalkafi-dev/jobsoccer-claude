import { AiLang } from "./lang";

/**
 * Fixed texts of the AI features in English, Spanish and French.
 * These are never sent to an LLM: they are looked up here.
 */

type Catalog = Record<AiLang, string>;

export const AI_TEXTS = {
  disclaimer: {
    en: "AI-assisted assessment of the interview answers only. It is guidance for recruiters, not an objective fact or a hiring decision. Qualifications, references and practical work have not been verified.",
    es: "Evaluación asistida por IA solo de las respuestas de la entrevista. Es una orientación para los reclutadores, no un hecho objetivo ni una decisión de contratación. Las cualificaciones, las referencias y el trabajo práctico no se han verificado.",
    fr: "Évaluation assistée par IA des réponses de l'entretien uniquement. Elle sert de guide aux recruteurs ; ce n'est ni un fait objectif ni une décision de recrutement. Les qualifications, les références et le travail pratique n'ont pas été vérifiés.",
  },
  noAnswer: {
    en: "No answer to this question was found in the interview.",
    es: "No se encontró ninguna respuesta a esta pregunta en la entrevista.",
    fr: "Aucune réponse à cette question n'a été trouvée dans l'entretien.",
  },
  noSpeechSummary: {
    en: "No speech could be found in the interview video, so the answers could not be assessed.",
    es: "No se encontró voz en el vídeo de la entrevista, por lo que no se pudieron evaluar las respuestas.",
    fr: "Aucune parole n'a été trouvée dans la vidéo de l'entretien, les réponses n'ont donc pas pu être évaluées.",
  },
} satisfies Record<string, Catalog>;

export type AiTextKey = keyof typeof AI_TEXTS;

export const aiText = (key: AiTextKey, lang: AiLang = "en"): string => AI_TEXTS[key][lang] ?? AI_TEXTS[key].en;

/** Stored (English) fixed text -> the same text in the viewer's language; any other text is returned unchanged. */
export const localizeFixedText = (text: string, lang: AiLang): string => {
  if (lang === "en") return text;
  for (const key of Object.keys(AI_TEXTS) as AiTextKey[]) {
    if (AI_TEXTS[key].en === text) return AI_TEXTS[key][lang];
  }
  return text;
};

/** Language names (Whisper reports English names, e.g. "spanish"), in each output language. */
const LANGUAGE_NAMES: Record<string, Catalog> = {
  english: { en: "English", es: "inglés", fr: "anglais" },
  spanish: { en: "Spanish", es: "español", fr: "espagnol" },
  french: { en: "French", es: "francés", fr: "français" },
  portuguese: { en: "Portuguese", es: "portugués", fr: "portugais" },
  italian: { en: "Italian", es: "italiano", fr: "italien" },
  german: { en: "German", es: "alemán", fr: "allemand" },
  dutch: { en: "Dutch", es: "neerlandés", fr: "néerlandais" },
  arabic: { en: "Arabic", es: "árabe", fr: "arabe" },
  turkish: { en: "Turkish", es: "turco", fr: "turc" },
  russian: { en: "Russian", es: "ruso", fr: "russe" },
  polish: { en: "Polish", es: "polaco", fr: "polonais" },
  catalan: { en: "Catalan", es: "catalán", fr: "catalan" },
};

const ISO_TO_NAME: Record<string, string> = {
  en: "english", es: "spanish", fr: "french", pt: "portuguese", it: "italian", de: "german",
  nl: "dutch", ar: "arabic", tr: "turkish", ru: "russian", pl: "polish", ca: "catalan",
};

/** Normalise what Whisper returns ("spanish", "es", "Spanish") to the English name key. */
const languageKey = (detected: string): string => {
  const value = detected.trim().toLowerCase();
  return ISO_TO_NAME[value] ?? value;
};

export const isEnglishLanguage = (detected?: string | null): boolean => !detected || /^(en|english)$/i.test(detected.trim());

/** Language name in the output language; unknown languages keep the name Whisper gave (capitalised). */
export const languageDisplayName = (detected: string, lang: AiLang = "en"): string => {
  const key = languageKey(detected);
  return LANGUAGE_NAMES[key]?.[lang] ?? (key ? key.charAt(0).toUpperCase() + key.slice(1) : "");
};

/** English name used inside prompts. */
export const languageEnglishName = (detected: string): string => languageDisplayName(detected, "en");

export const interviewLanguageNote = (detected: string | undefined | null, isTranslated: boolean, lang: AiLang): string | null => {
  if (!detected || !isTranslated || isEnglishLanguage(detected) || /^unknown$/i.test(detected.trim())) return null;
  const name = languageDisplayName(detected, lang);
  if (lang === "es") return `Entrevista realizada en ${name} (evaluada sobre una traducción al inglés)`;
  if (lang === "fr") return `Entretien réalisé en ${name} (évalué sur une traduction anglaise)`;
  return `Interview given in ${name} (scored on an English translation)`;
};
