import { getTranslations } from "next-intl/server";
import { optionSlug } from "./options";

/** Same as useOptionLabel, for server components. */
export async function getOptionLabel() {
  const t = await getTranslations("options");
  return (group: string, value?: string | null): string => {
    if (!value) return "";
    const key = `${group}.${optionSlug(value)}`;
    return t.has(key) ? t(key) : value;
  };
}
