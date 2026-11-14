import { DEFAULT_LANG, fillTemplate, isLang, Lang } from "./index";

/**
 * Notification texts per type and language. A notification is stored with `type` + `params`;
 * title and description are rendered for the reader's language when it is sent and when it is listed.
 * {param} placeholders are filled from `params`. Free text written by an admin (a rejection note) is
 * passed in as a param and shown unchanged.
 */
export type TNotificationType =
  | "interview_assessment_ready"
  | "interview_no_speech"
  | "document_approved"
  | "document_rejected"
  | "video_unlocked";

type TText = { title: string; description: string };

export const NOTIFICATION_TEXTS: Record<TNotificationType, Record<Lang, TText>> = {
  interview_assessment_ready: {
    en: { title: "Interview assessment ready", description: "Your {displayName} interview assessment is ready on your profile." },
    es: { title: "Evaluación de la entrevista lista", description: "La evaluación de tu entrevista de {displayName} ya está disponible en tu perfil." },
    fr: { title: "Évaluation de l'entretien disponible", description: "L'évaluation de votre entretien {displayName} est disponible sur votre profil." },
  },
  interview_no_speech: {
    en: {
      title: "We could not hear your interview",
      description: "No speech was found in your interview video. Please upload it again with your microphone close to you.",
    },
    es: {
      title: "No pudimos escuchar tu entrevista",
      description: "No se detectó voz en el vídeo de tu entrevista. Vuelve a subirlo con el micrófono cerca de ti.",
    },
    fr: {
      title: "Nous n'avons pas pu entendre votre entretien",
      description: "Aucune voix n'a été détectée dans la vidéo de votre entretien. Veuillez la téléverser à nouveau avec le micro près de vous.",
    },
  },
  document_approved: {
    en: { title: "Document approved", description: "Your {document} document was verified. It now counts towards your Profile Quality Score." },
    es: { title: "Documento aprobado", description: "Tu documento de {document} ha sido verificado. Ya cuenta para tu Puntuación de Calidad del Perfil." },
    fr: { title: "Document approuvé", description: "Votre document ({document}) a été vérifié. Il est désormais pris en compte dans votre Score de qualité du profil." },
  },
  document_rejected: {
    en: { title: "Document not approved", description: "Your {document} document was not approved: {note}" },
    es: { title: "Documento no aprobado", description: "Tu documento de {document} no ha sido aprobado: {note}" },
    fr: { title: "Document non approuvé", description: "Votre document ({document}) n'a pas été approuvé : {note}" },
  },
  video_unlocked: {
    en: { title: "Video unlocked", description: "Your video has been unlocked by JOBSOCCER support. You can upload a new version now." },
    es: { title: "Vídeo desbloqueado", description: "El equipo de soporte de JOBSOCCER ha desbloqueado tu vídeo. Ya puedes subir una nueva versión." },
    fr: { title: "Vidéo déverrouillée", description: "Le support JOBSOCCER a déverrouillé votre vidéo. Vous pouvez maintenant téléverser une nouvelle version." },
  },
};

/** Names of the record types (param `document`) in each language. */
const DOCUMENT_NAMES: Record<Lang, Record<string, string>> = {
  en: { experience: "work history", education: "education", license: "licence or certification" },
  es: { experience: "experiencia laboral", education: "formación académica", license: "licencia o certificación" },
  fr: { experience: "expérience professionnelle", education: "formation", license: "licence ou certification" },
};

/**
 * Title and description of a notification type in a language (English when the type or language is unknown).
 * Returns null when the type is not known at all (legacy notification: keep the stored text).
 */
export const renderNotification = (
  type: string | undefined | null,
  params: Record<string, unknown> | undefined | null,
  lang: Lang | string | undefined
): TText | null => {
  if (!type || !Object.prototype.hasOwnProperty.call(NOTIFICATION_TEXTS, type)) return null;
  const language: Lang = isLang(lang) ? lang : DEFAULT_LANG;
  const text = NOTIFICATION_TEXTS[type as TNotificationType][language];
  const filled: Record<string, unknown> = { ...(params ?? {}) };
  if (typeof filled.document === "string") filled.document = DOCUMENT_NAMES[language][filled.document] ?? filled.document;
  return { title: fillTemplate(text.title, filled), description: fillTemplate(text.description, filled) };
};
