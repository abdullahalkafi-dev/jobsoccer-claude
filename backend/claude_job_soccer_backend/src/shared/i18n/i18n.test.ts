import path from "path";
import { describe, expect, it } from "vitest";
import {
  isKnownMessage,
  parseAcceptLanguage,
  resolveLang,
  translateMessage,
  translateValue,
} from "./index";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { extractMessages } from "./extractMessages";
import { renderNotification, NOTIFICATION_TEXTS } from "./notifications";

const SRC = path.resolve(__dirname, "../..");
const placeholders = (text: string) => [...text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]).sort();

/** Messages written by the error handlers and middleware themselves (not found by the source scan). */
const SYSTEM_KEYS = [
  "Something went wrong",
  "Route not found",
  "API DOESN'T EXIST",
  "Invalid ID",
  "Validation Error",
  "Invalid input",
  "An account with this email already exists.",
  "An account with this {field} already exists.",
  "A record with this {field} already exists.",
  "The file is too large.",
  "Too many files were uploaded.",
  "Unexpected file field.",
  "The file could not be uploaded.",
  "Invalid request body.",
  "Unsupported language",
  "Language updated",
];

describe("message catalog coverage", () => {
  const { found, nonLiteral } = extractMessages(SRC);
  const keys = [...new Set(found.map((f) => f.key.trim()))];

  it("finds the messages in the source (scan sanity)", () => {
    expect(keys.length).toBeGreaterThan(200);
    expect(keys).toContain("User not found");
  });

  it("every AppError / sendResponse message has a Spanish entry", () => {
    const missing = keys.filter((k) => !(k in es));
    expect(missing, `Add these to src/shared/i18n/messages/es.ts:\n${missing.join("\n")}`).toEqual([]);
  });

  it("every AppError / sendResponse message has a French entry", () => {
    const missing = keys.filter((k) => !(k in fr));
    expect(missing, `Add these to src/shared/i18n/messages/fr.ts:\n${missing.join("\n")}`).toEqual([]);
  });

  it("system messages are translated", () => {
    expect(SYSTEM_KEYS.filter((k) => !(k in es))).toEqual([]);
    expect(SYSTEM_KEYS.filter((k) => !(k in fr))).toEqual([]);
  });

  it("translations keep the same {placeholders} as the key", () => {
    const bad: string[] = [];
    for (const [lang, catalog] of [["es", es], ["fr", fr]] as const) {
      for (const [key, text] of Object.entries(catalog)) {
        if (placeholders(key).join() !== placeholders(text).join()) bad.push(`${lang}: ${key}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("es and fr have the same keys", () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(fr).sort());
  });

  it("no message is built from a variable (the scan could not read it)", () => {
    // A message that is a variable cannot be checked. Use a literal, or add the literals to a ternary.
    expect(nonLiteral.map((n) => `${n.file}:${n.line} ${n.key}`)).toEqual([]);
  });
});

describe("translateMessage", () => {
  it("translates exact messages", () => {
    expect(translateMessage("User not found", "es")).toBe("Usuario no encontrado.");
    expect(translateMessage("User not found", "fr")).toBe("Utilisateur introuvable.");
  });

  it("keeps English for en and for unknown text", () => {
    expect(translateMessage("User not found", "en")).toBe("User not found");
    expect(translateMessage("Some brand new sentence", "es")).toBe("Some brand new sentence");
  });

  it("fills {param} patterns and translates known values", () => {
    expect(translateMessage("Invalid job ID: 123", "es")).toBe("Identificador de oferta no válido: 123.");
    expect(translateMessage("Your interview video is locked until 2027-02-10. Contact support if you need to change it earlier.", "fr")).toBe(
      "Votre vidéo de type entretien est verrouillée jusqu'au 2027-02-10. Contactez le support si vous devez la modifier plus tôt."
    );
    expect(translateMessage("Verification request approved successfully", "es")).toBe(
      "Estado de la solicitud de verificación actualizado: aprobado."
    );
    expect(translateMessage("Please upload your required Interview and Highlights video before applying.", "fr")).toContain("entretien et temps forts");
  });

  it("exact entries win over patterns", () => {
    expect(translateMessage("Invalid job ID", "es")).toBe("Identificador de oferta no válido.");
    expect(translateMessage("This video is larger than 600 MB.", "fr")).toBe("Cette vidéo dépasse 600 Mo.");
  });

  it("polishes a few English messages", () => {
    expect(translateMessage("User doesn't exist!", "en")).toBe("User doesn't exist.");
  });

  it("translateValue keeps unknown values", () => {
    expect(translateValue("Interview", "es")).toBe("entrevista");
    expect(translateValue("42", "es")).toBe("42");
  });

  it("isKnownMessage separates catalog messages from internal ones", () => {
    expect(isKnownMessage("User not found")).toBe(true);
    expect(isKnownMessage("Invalid role for candidate userType")).toBe(false);
    expect(isKnownMessage("File too large")).toBe(false);
  });
});

describe("language resolution", () => {
  it("reads the first supported Accept-Language entry", () => {
    expect(parseAcceptLanguage("es-MX,es;q=0.9,en;q=0.8")).toBe("es");
    expect(parseAcceptLanguage("de,fr;q=0.7,en;q=0.5")).toBe("fr");
    expect(parseAcceptLanguage("de")).toBeUndefined();
    expect(parseAcceptLanguage(undefined)).toBeUndefined();
  });

  it("order: saved user language, header, en", () => {
    expect(resolveLang({ headers: { "accept-language": "fr" }, userLang: "es" })).toBe("es");
    expect(resolveLang({ headers: { "accept-language": "fr" } })).toBe("fr");
    expect(resolveLang({ headers: {} })).toBe("en");
  });
});

describe("notification catalog", () => {
  it("has en, es and fr text for every type, with the same placeholders", () => {
    for (const [type, langs] of Object.entries(NOTIFICATION_TEXTS)) {
      for (const lang of ["es", "fr"] as const) {
        expect(placeholders(langs[lang].title), `${type}.${lang}.title`).toEqual(placeholders(langs.en.title));
        expect(placeholders(langs[lang].description), `${type}.${lang}.description`).toEqual(placeholders(langs.en.description));
      }
    }
  });

  it("renders in the reader's language and keeps an admin note as written", () => {
    const note = "Falta la firma del director";
    const text = renderNotification("document_rejected", { document: "education", note }, "es");
    expect(text?.title).toBe("Documento no aprobado");
    expect(text?.description).toBe(`Tu documento de formación académica no ha sido aprobado: ${note}`);
    expect(renderNotification("video_unlocked", {}, "fr")?.title).toBe("Vidéo déverrouillée");
  });

  it("returns null for legacy or unknown types", () => {
    expect(renderNotification(undefined, {}, "es")).toBeNull();
    expect(renderNotification("nope", {}, "es")).toBeNull();
  });
});
