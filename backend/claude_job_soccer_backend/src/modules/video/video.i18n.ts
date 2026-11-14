import type { Lang } from "../../shared/i18n";
import type { TGuideSection, TVideoPlan, TVideoSlot } from "./video.config";
import { VIDEO_TEXTS } from "./video.texts";

const OPTIONAL_SUFFIX = " (optional)";

/** Every text of a plan, in one list (used by the coverage test). */
export const planTexts = (plan: TVideoPlan): string[] => {
  const sectionTexts = (s: TGuideSection) => [s.heading, ...s.items];
  return [
    ...plan.slots.flatMap((slot) => [slot.title, slot.headline, ...slot.sections.flatMap(sectionTexts)]),
    ...sectionTexts(plan.technical),
    plan.consent.ai.text,
    plan.consent.players.text,
    plan.lockNotice,
    plan.fileNameHint,
  ];
};

/** Texts the plan builder joins together; they are looked up in pieces ("Title (optional)"). */
export const splitOptional = (text: string): [string, string] =>
  text.endsWith(OPTIONAL_SUFFIX) ? [text.slice(0, -OPTIONAL_SUFFIX.length), OPTIONAL_SUFFIX] : [text, ""];

/** English text -> text in the language; unknown text stays English. */
export const tr = (text: string, lang: Lang): string => {
  if (lang === "en") return text;
  const dict = VIDEO_TEXTS[lang];
  const [base, suffix] = splitOptional(text);
  return (dict[base] ?? base) + (suffix ? dict[suffix] ?? suffix : "");
};

const trSection = (section: TGuideSection, lang: Lang): TGuideSection => ({
  heading: tr(section.heading, lang),
  items: section.items.map((item) => tr(item, lang)),
});

const trSlot = (slot: TVideoSlot, lang: Lang): TVideoSlot => ({
  ...slot,
  title: tr(slot.title, lang),
  headline: tr(slot.headline, lang),
  sections: slot.sections.map((s) => trSection(s, lang)),
});

/** The plan with every guide, consent and notice text in the user's language. Structure is unchanged. */
export const localizePlan = (plan: TVideoPlan, lang: Lang): TVideoPlan => {
  if (lang === "en") return plan;
  return {
    ...plan,
    slots: plan.slots.map((slot) => trSlot(slot, lang)),
    technical: trSection(plan.technical, lang),
    consent: {
      ...plan.consent,
      ai: { ...plan.consent.ai, text: tr(plan.consent.ai.text, lang) },
      players: { ...plan.consent.players, text: tr(plan.consent.players.text, lang) },
    },
    lockNotice: tr(plan.lockNotice, lang),
    fileNameHint: tr(plan.fileNameHint, lang),
  };
};
