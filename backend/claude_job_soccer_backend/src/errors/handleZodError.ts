import { ZodError } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../shared/types/error";
import { DEFAULT_LANG, Lang, translateMessage } from "../shared/i18n";
import { fieldLabel, zodTexts } from "../shared/i18n/zodMessages";

/**
 * Zod 4 issue shapes used here:
 *  invalid_type  { expected }                 message "Invalid input: expected string, received undefined"
 *  too_small     { origin, minimum }          message "Too small: expected string to have >=1 characters"
 *  too_big       { origin, maximum }
 *  invalid_format{ format }                   message "Invalid email address" / "Invalid string: must match pattern ..."
 *  invalid_value { values }                   message "Invalid option: expected one of ..."
 *  unrecognized_keys { keys }
 *  custom        { params }
 * A message written by hand in the schema is passed through as written; Zod's own default
 * English texts are replaced by our translated sentences.
 */
type TIssue = {
  code: string;
  path: PropertyKey[];
  message: string;
  expected?: string;
  origin?: string;
  minimum?: number | bigint;
  maximum?: number | bigint;
  format?: string;
  values?: unknown[];
  keys?: string[];
};

const DEFAULT_MESSAGE =
  /^(Invalid input|Too small:|Too big:|Invalid string:|Invalid option:|Unrecognized keys?:|Invalid (email address|URL|UUID|GUID|ISO|IP|CIDR|JSON|number|date|value|key)|Input not instance|Number must be|String must contain|Required$)/i;

const isDefaultMessage = (message: unknown): boolean => typeof message !== "string" || !message || DEFAULT_MESSAGE.test(message);

/** Name of the field the issue is about: last text segment of the path ("body", "data" wrappers are skipped when alone). */
const fieldNameOf = (path: PropertyKey[]): string => {
  const texts = path.filter((p): p is string => typeof p === "string");
  return texts[texts.length - 1] ?? "field";
};

const pathValueOf = (path: PropertyKey[]): string | number => {
  const last = path[path.length - 1];
  if (last === undefined) return "";
  return typeof last === "symbol" ? String(last) : last;
};

export const issueMessage = (issue: TIssue, lang: Lang): string => {
  if (!isDefaultMessage(issue.message)) return translateMessage(issue.message, lang);

  const t = zodTexts[lang];
  const field = fieldLabel(fieldNameOf(issue.path), lang);

  switch (issue.code) {
    case "invalid_type": {
      if (/received (undefined|null)$/.test(issue.message ?? "")) return t.required(field);
      const expected = issue.expected ?? "";
      return t.types[expected] ? t.invalidType(field, t.types[expected]) : t.invalid(field);
    }
    case "too_small": {
      const n = issue.minimum !== undefined ? String(issue.minimum) : "";
      if (issue.origin === "string") return Number(n) === 1 ? t.required(field) : t.tooSmallText(field, n);
      if (issue.origin === "array" || issue.origin === "set") return t.tooSmallList(field, n);
      return t.tooSmallNumber(field, n);
    }
    case "too_big": {
      const n = issue.maximum !== undefined ? String(issue.maximum) : "";
      if (issue.origin === "string") return t.tooBigText(field, n);
      if (issue.origin === "array" || issue.origin === "set") return t.tooBigList(field, n);
      return t.tooBigNumber(field, n);
    }
    case "invalid_format":
      if (issue.format === "email") return t.email(field);
      if (issue.format === "url") return t.url(field);
      if (issue.format === "uuid" || issue.format === "guid") return t.uuid(field);
      return t.format(field);
    case "invalid_value": {
      const values = (issue.values ?? []).map(String);
      return values.length > 0 && values.length <= 12 ? t.oneOf(field, values.join(", ")) : t.invalidValue(field);
    }
    case "unrecognized_keys":
      return t.unrecognized((issue.keys ?? []).join(", "));
    default:
      return t.invalid(field);
  }
};

const handleZodError = (err: ZodError, lang: Lang = DEFAULT_LANG): TGenericErrorResponse => {
  const errorSources: TErrorSources = (err.issues as unknown as TIssue[]).map((issue) => ({
    path: pathValueOf(issue.path),
    message: issueMessage(issue, lang),
  }));

  // The top-level message is the first field message (people read this one in the toast).
  const message = errorSources[0]?.message ?? translateMessage("Invalid input", lang);

  return { statusCode: 400, message, errorSources };
};

export default handleZodError;
