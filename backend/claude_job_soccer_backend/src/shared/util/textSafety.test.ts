import path from "path";
import { describe, expect, it } from "vitest";
import { NAME_REGEX } from "./nameRegex";
import { accentInsensitiveRegex, escapedRegex } from "./searchRegex";
import newFileName, { decodeUploadedName, toSafeSlug } from "./filenameGenerator";

describe("NAME_REGEX", () => {
  it.each(["José", "Zoë", "D’Angelo", "O'Brien", "Œdipe", "Anne-Marie", "Jean Pierre", "Nuñez", "Ibáñez", "Müller", "Çelik", "Pere l·l", "St. John", "Łukasz", "Đorđević"])(
    "accepts %s",
    (name) => expect(NAME_REGEX.test(name)).toBe(true)
  );
  it.each(["John3", "<script>", "a@b", ""])("rejects %s", (name) => expect(NAME_REGEX.test(name)).toBe(false));
});

describe("accent-insensitive search", () => {
  it("matches accented names from plain letters and the reverse", () => {
    expect(accentInsensitiveRegex("Jose").test("José")).toBe(true);
    expect(accentInsensitiveRegex("jose").test("JOSÉ")).toBe(true);
    expect(accentInsensitiveRegex("José").test("Jose")).toBe(true);
    expect(accentInsensitiveRegex("munoz").test("Muñoz")).toBe(true);
    expect(accentInsensitiveRegex("zoe").test("Zoë")).toBe(true);
    expect(accentInsensitiveRegex("francois").test("François")).toBe(true);
    expect(accentInsensitiveRegex("Jose").test("Jorge")).toBe(false);
  });

  it("never treats the term as a regular expression", () => {
    expect(accentInsensitiveRegex("a.*").test("abc")).toBe(false);
    expect(accentInsensitiveRegex("(").test("(")).toBe(true);
    expect(() => accentInsensitiveRegex("[")).not.toThrow();
    expect(escapedRegex("a+b").test("a+b")).toBe(true);
    expect(escapedRegex("a+b").test("aab")).toBe(false);
  });
});

describe("uploaded file names", () => {
  it("decodes latin1-read UTF-8 names", () => {
    const garbled = Buffer.from("Résumé José.pdf", "utf8").toString("latin1");
    expect(decodeUploadedName(garbled)).toBe("Résumé José.pdf");
  });

  it("leaves already correct names alone", () => {
    expect(decodeUploadedName("Résumé.pdf")).toBe("Résumé.pdf");
    expect(decodeUploadedName("Łukasz.pdf")).toBe("Łukasz.pdf");
    expect(decodeUploadedName("plain.pdf")).toBe("plain.pdf");
  });

  it("stores a safe ASCII slug", () => {
    expect(toSafeSlug("Résumé de José")).toBe("resume-de-jose");
    expect(toSafeSlug("Œuvre ../../etc/passwd")).toBe("oeuvre-etc-passwd");
    expect(toSafeSlug("日本語")).toBe("file");
    const garbled = Buffer.from("Curriculum Vitæ José.pdf", "utf8").toString("latin1");
    const stored = newFileName({ originalname: garbled }, path);
    expect(stored).toMatch(/^curriculum-vitae-jose-[A-Za-z0-9]{5}-\d+-\d+-\d{4}$/);
  });
});
