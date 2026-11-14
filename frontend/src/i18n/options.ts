"use client";

import { useTranslations } from "next-intl";

/**
 * Stored values (roles, positions, countries, months…) stay English in the database. Only the label
 * shown to the user is translated. Keys in messages/<locale>/options.json are `<group>.<slug>`
 * where slug = value in lower case with every run of non-letters/digits replaced by "_"
 * ("On field staff" -> on_field_staff, "Right back" -> right_back, "U-19" -> u_19).
 */
export const optionSlug = (value: string): string =>
  value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** `const label = useOptionLabel(); label("position", "Right back")` -> "Lateral derecho". Unknown values come back unchanged. */
export function useOptionLabel() {
  const t = useTranslations("options");
  return (group: string, value?: string | null): string => {
    if (!value) return "";
    const key = `${group}.${optionSlug(value)}`;
    return t.has(key) ? t(key) : value;
  };
}
