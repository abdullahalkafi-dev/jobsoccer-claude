import mongoose from "mongoose";
import { TErrorSources, TGenericErrorResponse } from "../shared/types/error";
import { DEFAULT_LANG, Lang, translateMessage } from "../shared/i18n";

const handleCastError = (
  err: mongoose.Error.CastError,
  lang: Lang = DEFAULT_LANG,
): TGenericErrorResponse => {
  const message = translateMessage("Invalid ID", lang);
  // err.message ("Cast to ObjectId failed for value ...") is internal; only the field name is useful.
  const errorSources: TErrorSources = [{ path: err.path, message }];

  return { statusCode: 400, message, errorSources };
};

export default handleCastError;
