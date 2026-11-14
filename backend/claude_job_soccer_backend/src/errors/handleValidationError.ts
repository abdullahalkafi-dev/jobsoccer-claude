import mongoose from "mongoose";
import { TErrorSources, TGenericErrorResponse } from "../shared/types/error";
import { DEFAULT_LANG, Lang, translateMessage } from "../shared/i18n";

const handleValidationError = (
  err: mongoose.Error.ValidationError,
  lang: Lang = DEFAULT_LANG,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => ({
      path: val?.path,
      message: translateMessage(val?.message ?? "", lang),
    }),
  );

  return {
    statusCode: 400,
    // The first field's message says what is wrong; "Validation Error" alone helps nobody.
    message: errorSources[0]?.message || translateMessage("Validation Error", lang),
    errorSources,
  };
};

export default handleValidationError;
