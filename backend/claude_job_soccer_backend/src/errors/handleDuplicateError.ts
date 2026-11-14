/* eslint-disable @typescript-eslint/no-explicit-any */

import { TErrorSources, TGenericErrorResponse } from "../shared/types/error";
import { DEFAULT_LANG, Lang, translateMessage } from "../shared/i18n";

/** Name of the duplicated field from a Mongo E11000 error (keyValue, keyPattern or the message). */
const duplicateField = (err: any): string => {
  const fromKey = err?.keyValue && Object.keys(err.keyValue)[0];
  if (fromKey) return fromKey;
  const fromPattern = err?.keyPattern && Object.keys(err.keyPattern)[0];
  if (fromPattern) return fromPattern;
  const match = String(err?.message ?? "").match(/index: (?:\w+\.\$)?([A-Za-z0-9_]+?)(?:_\d+)? dup key/);
  return match?.[1] ?? "value";
};

const handleDuplicateError = (err: any, lang: Lang = DEFAULT_LANG): TGenericErrorResponse => {
  const field = duplicateField(err);
  const message = translateMessage(
    field === "email" ? "An account with this email already exists." : "A record with this {field} already exists.".replace("{field}", field),
    lang,
  );

  const errorSources: TErrorSources = [{ path: field, message }];

  return { statusCode: 400, message, errorSources };
};

export default handleDuplicateError;
