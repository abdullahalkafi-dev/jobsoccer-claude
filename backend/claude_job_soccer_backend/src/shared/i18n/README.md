# Languages (en, es, fr)

The frontend sends `Accept-Language: en|es|fr` on every call and, after sign-in, `PATCH /api/v1/user/language`.
The backend answers in the user's language.

## Which language is used

`languageMiddleware` (registered early in `app.ts`) sets `req.lang`:

1. the signed-in user's saved `language` (User model, default `en`; cached 60 s),
2. else the first of en/es/fr in `Accept-Language`,
3. else `en`.

Use `req.lang` in controllers and pass a `lang` argument down to services that build texts.
Sign-up stores the language of the request on the new user.

## 1. API messages (errors and `sendResponse` messages)

Write the English sentence in the code exactly as before:

```ts
throw new AppError(StatusCodes.NOT_FOUND, "Job not found");
sendResponse(res, { ..., message: "Job created successfully" });
```

Then add the same sentence as a key to `messages/es.ts` and `messages/fr.ts`
(`"Job not found": "Oferta no encontrada."`). `globalErrorHandler` and `sendResponse` translate it.

- Values inside a sentence use a template literal; the placeholder name is the last identifier in
  `${...}`: `` `Invalid job ID: ${id}` `` -> key `"Invalid job ID: {id}"`. Keep every `{placeholder}` in the translation.
- Words that are values (status, plan, video kind, role) are translated through `messages/values.ts`.
  Status sentences read "Status updated: {status}" so they agree in every language.
- Spanish uses "tú", French uses "vous".
- `messages/en.ts` is only for polishing an English sentence for everybody.
- Unknown messages are shown in English. Internal `Error` messages are never shown ("Something went wrong").
- A stable machine code for the frontend: `new AppError(400, "OTP expired", { code: "OTP_EXPIRED" })`.
  The error response then has `code`. Existing codes: `OTP_EXPIRED`, `OTP_INVALID`, `ACCOUNT_NOT_FOUND`, `VIDEO_LOCKED`.

`pnpm vitest run src/shared/i18n` scans every `AppError(`, `new ApiError(` and `sendResponse(... message:)` literal
(and `message:` literals returned by services) and **fails if a sentence has no es or fr entry**.

## 2. Zod / validation messages

`errors/handleZodError.ts` passes messages written in a schema through as written (and translates them when they
are in the catalog). Zod's own default messages are replaced by translated sentences from `zodMessages.ts`
("{field} is required", "{field} must be at least {n} characters", ...). Field names for es/fr are in
`zodMessages.ts` (`fieldLabels`).

## 3. E-mails

`shared/email/email.texts.ts` has subject, body and footer per language; `email.template.ts` renders them.
Pass `lang` to `emailTemplate.createAccount / resetPassword`. To add a new e-mail: add a block to `TEmailTexts`
in the three languages, a template function in `email.template.ts` using `layout(...)`, and a test in
`email.template.test.ts` that renders all three.

## 4. Notifications

Store a `type` and `params`, never a finished sentence:

```ts
NotificationService.sendNotificationToUser(userId, "Video unlocked", "Your video has been unlocked ...", "video_unlocked", { ... });
```

The English title/description are kept in the document (fallback); when the notification is sent over the socket and
when it is listed (`GET /notifications`) it is rendered in the reader's language with
`renderNotification(type, params, lang)` from `notifications.ts`. Add the type to `NOTIFICATION_TEXTS`
(en, es, fr). Notifications without a type (old ones) keep their stored text. Free text written by an admin goes in
`params` and is shown unchanged.

## 5. Video plan texts

`modules/video/video.config.ts` is written in English; `video.texts.ts` has the es/fr version of every sentence
(key = the English text) and `video.i18n.ts` localizes the plan. `video.config.test.ts` fails when a text has no
translation.

## Not covered here

- Interview questions, rubrics, AI summaries and AI notifications text: the AI layer (`shared/ai`, `aiEvaluation`,
  `profileQuality`) owns them.
- The job `$text` index uses the default English language (changing it needs dropping and recreating the index).
