import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("../shared/logger/logger", () => ({ logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() } }));

import handleZodError from "./handleZodError";
import handleDuplicateError from "./handleDuplicateError";
import handleValidationError from "./handleValidationError";
import AppError from "./AppError";
import globalErrorHandler from "../shared/middlewares/globalErrorHandler";

const parse = (schema: z.ZodType, value: unknown) => {
  const result = schema.safeParse(value);
  if (result.success) throw new Error("expected a validation error");
  return result.error;
};

describe("handleZodError (Zod 4)", () => {
  const schema = z.object({
    body: z.object({
      email: z.string(),
      firstName: z.string().min(2),
      age: z.number().min(18),
      tags: z.array(z.string()).min(1),
      role: z.enum(["a", "b"]),
      contact: z.string().email(),
    }),
  });
  const error = parse(schema, { body: { firstName: "J", age: 3, tags: [], role: "z", contact: "nope" } });

  it("returns one source per field, translated", () => {
    const en = handleZodError(error, "en");
    expect(en.statusCode).toBe(400);
    const by = Object.fromEntries(en.errorSources.map((s) => [s.path, s.message]));
    expect(by.email).toBe("Email is required");
    expect(by.firstName).toBe("First name must be at least 2 characters");
    expect(by.age).toBe("Age must be at least 18");
    expect(by.tags).toBe("Tags must contain at least 1 item(s)");
    expect(by.role).toBe("Role must be one of: a, b");
    expect(by.contact).toBe("Contact must be a valid email address");

    const es = Object.fromEntries(handleZodError(error, "es").errorSources.map((s) => [s.path, s.message]));
    expect(es.email).toBe("El correo electrónico es obligatorio");
    expect(es.firstName).toBe("El nombre debe tener al menos 2 caracteres");
    const fr = Object.fromEntries(handleZodError(error, "fr").errorSources.map((s) => [s.path, s.message]));
    expect(fr.email).toBe("L'adresse e-mail est obligatoire");
    expect(fr.firstName).toBe("Le prénom doit contenir au moins 2 caractères");
  });

  it("top-level message is a field message, not API key names", () => {
    const result = handleZodError(error, "es");
    expect(result.message).toBe(result.errorSources[0].message);
    expect(result.message).not.toMatch(/^Invalid input for/);
  });

  it("passes custom schema messages through as written (and translates known ones)", () => {
    const custom = parse(z.object({ name: z.string().min(1, "Please tell us your name") }), { name: "" });
    expect(handleZodError(custom, "es").message).toBe("Please tell us your name");
    const known = parse(z.object({ name: z.string().min(1, "First name is required") }), { name: "" });
    expect(handleZodError(known, "es").message).toBe("El nombre es obligatorio.");
    expect(handleZodError(known, "en").message).toBe("First name is required");
  });

  it("detects a missing field and a wrong type", () => {
    const missing = parse(z.object({ title: z.string() }), {});
    expect(handleZodError(missing, "en").message).toBe("Title is required");
    const wrong = parse(z.object({ title: z.string() }), { title: 5 });
    expect(handleZodError(wrong, "en").message).toBe("Title must be text");
  });

  it("reports unrecognized keys", () => {
    const strict = parse(z.object({ a: z.string() }).strict(), { a: "x", extra: 1 });
    expect(handleZodError(strict, "en").errorSources[0].message).toContain("extra");
  });
});

describe("other handlers", () => {
  it("duplicate key error names the field in a proper sentence", () => {
    const err = { code: 11000, keyValue: { email: "a@b.c" }, message: "E11000" };
    expect(handleDuplicateError(err, "en").message).toBe("An account with this email already exists.");
    expect(handleDuplicateError(err, "es").message).toBe("Ya existe una cuenta con este correo electrónico.");
    expect(handleDuplicateError({ code: 11000, keyValue: { slug: "x" } }, "fr").message).toBe("Un enregistrement avec ce champ « slug » existe déjà.");
  });

  it("mongoose validation error uses the first field message", () => {
    const err: any = { name: "ValidationError", errors: { firstName: { path: "firstName", message: "First name contains invalid characters" } } };
    const result = handleValidationError(err, "es");
    expect(result.message).toBe("El nombre contiene caracteres no válidos.");
    expect(result.errorSources[0].path).toBe("firstName");
  });
});

describe("globalErrorHandler", () => {
  const run = (err: unknown, lang: "en" | "es" | "fr" = "es") => {
    let status = 0;
    let body: any;
    const res: any = {
      status(code: number) {
        status = code;
        return this;
      },
      json(payload: unknown) {
        body = payload;
        return this;
      },
    };
    (globalErrorHandler as any)(err, { lang, path: "/x", method: "GET", headers: {} }, res, () => undefined);
    return { status, body };
  };

  it("translates AppError messages and passes the code through", () => {
    const { status, body } = run(new AppError(400, "OTP expired", { code: "OTP_EXPIRED" }));
    expect(status).toBe(400);
    expect(body.message).toBe("El código ha caducado. Solicita uno nuevo.");
    expect(body.errorSources[0].message).toBe(body.message);
    expect(body.code).toBe("OTP_EXPIRED");
  });

  it("AppError stays backward compatible (third argument can be a stack string)", () => {
    const err = new AppError(404, "User not found", "custom stack");
    expect(err.stack).toBe("custom stack");
    expect(err.code).toBeUndefined();
    expect(run(err, "fr").body.code).toBeUndefined();
  });

  it("does not leak internal error messages", () => {
    const { status, body } = run(new Error("Invalid role for candidate userType"));
    expect(status).toBe(500);
    expect(body.message).toBe("Algo salió mal. Inténtalo de nuevo.");
    expect(JSON.stringify(body)).not.toContain("candidate userType");
  });

  it("maps multer errors to friendly messages", () => {
    const err: any = Object.assign(new Error("File too large"), { name: "MulterError", code: "LIMIT_FILE_SIZE", field: "video" });
    const { status, body } = run(err, "fr");
    expect(status).toBe(413);
    expect(body.message).toBe("Le fichier est trop volumineux.");
  });

  it("zod errors come back in the request language", () => {
    const err = parse(z.object({ body: z.object({ email: z.string() }) }), { body: {} });
    expect(run(err, "fr").body.message).toBe("L'adresse e-mail est obligatoire");
  });
});
