import enValidation from "@/messages/en/validation.json";

/** A translate function (the result of `useTranslations("validation")` or `getTranslations("validation")`). */
export type Translator = (key: string, values?: Record<string, string | number>) => string;


/**
 * English translator for code that has no React context (types, tests, old imports).
 * Components should use `useTranslations("validation")` and the `getXxxSchema(t)` factories.
 */
export const englishValidation: Translator = (key, values) => {
  const text = (enValidation as Record<string, string>)[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => String(values?.[name] ?? `{${name}}`));
};
