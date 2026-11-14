import { describe, expect, it } from "vitest";
import { CandidateRole } from "../user/user.interface";
import { VideoKind } from "../video/video.constant";
import { CATEGORY_LABELS, ITEM_LABELS, renderTip } from "./profileQuality.i18n";
import { calculateProfileQuality, selectTipItems, TQualitySnapshot } from "./profileQuality.rules";
import { localizedBands, localizeQuality, qualityFor, toPublicQuality } from "./profileQuality.view";

const base: TQualitySnapshot = {
  role: CandidateRole.ON_FIELD_STAFF,
  profile: { position: "Head Coach", dateOfBirth: new Date("1985-01-01") },
  profileImage: null,
  videos: [{ kind: VideoKind.INTERVIEW }],
  experiences: [],
  educations: [],
  licenses: [],
  resume: null,
  identityStatus: "pending",
  responseRate: null,
  now: new Date(),
};

describe("profile quality catalog", () => {
  it("has es and fr text for every category and item label", () => {
    for (const texts of [...Object.values(CATEGORY_LABELS), ...Object.values(ITEM_LABELS)]) {
      expect(texts.es.length).toBeGreaterThan(0);
      expect(texts.fr.length).toBeGreaterThan(0);
    }
  });

  it("builds the add-your-fields tip in each language", () => {
    const params = { fields: ["dateOfBirth", "phoneNumber"], more: true };
    expect(renderTip("addMissingFields", params, "en")).toBe("Add your date of birth, phone number and more.");
    expect(renderTip("addMissingFields", params, "es")).toBe("Añade: fecha de nacimiento, número de teléfono y más.");
    expect(renderTip("addMissingFields", params, "fr")).toBe("Complétez : date de naissance, numéro de téléphone et plus.");
  });
});

describe("localized profile quality", () => {
  const result = { ...calculateProfileQuality(base), calculatedAt: new Date() };

  it("keeps the English text and the points when the language is English", () => {
    const en = localizeQuality(result, "en");
    expect(en.score).toBe(result.score);
    expect(en.tips).toEqual(result.tips);
    expect(en.label).toBe("Incomplete");
    expect(en.levelKey).toBe(result.level);
  });

  it("translates labels and tips by key and never changes points", () => {
    const es = localizeQuality(result, "es");
    expect(es.score).toBe(result.score);
    expect(es.categories.map((c) => c.earned)).toEqual(result.categories.map((c) => c.earned));
    expect(es.categories[0].label).toBe("Perfil completo");
    expect(es.tips.join(" ")).toMatch(/Graba tu entrevista|Añade/);
    expect(es.tips.join(" ")).not.toMatch(/waiting for review/);
    expect(es.levelKey).toBe(result.level);
  });

  it("sorts waiting-for-review tips last using the flag, not the text (also when translated)", () => {
    const items = selectTipItems(result.categories);
    const firstWaiting = items.findIndex((item) => item.waiting);
    expect(firstWaiting).toBeGreaterThan(-1);
    expect(items.slice(firstWaiting).every((item) => item.waiting)).toBe(true);
    const fr = localizeQuality(result, "fr");
    expect(fr.tips.join(" ")).not.toMatch(/waiting for review/);
  });

  it("appends the cached translation of the personal AI tips", () => {
    const withAi = { ...result, ai: { hash: "h", experienceQuality: 0.5, cvRelevance: 0.5, tips: ["Describe your results."], translations: { es: ["Describe tus resultados."] }, judgedAt: new Date() } };
    expect(localizeQuality(withAi, "es").tips).toContain("Describe tus resultados.");
    expect(localizeQuality(withAi, "fr").tips).toContain("Describe your results."); // no French cache yet: English
  });

  it("returns a localized label plus the stable level key for public views and bands", () => {
    expect(toPublicQuality({ stars: 5, level: "premium" }, "fr")).toEqual({ stars: 5, level: "premium", levelKey: "premium", label: "Premium qualifié" });
    expect(toPublicQuality({ stars: 5, level: "premium" })?.label).toBe("Premium Qualified");
    expect(localizedBands("es").find((b) => b.level === "complete")?.label).toBe("Completo");
    expect(qualityFor(result, "u1", "u1", "es")).toMatchObject({ label: "Incompleto", levelKey: result.level });
    expect(qualityFor(result, "u1", "other", "es")).toMatchObject({ label: "Incompleto" });
    expect(qualityFor(result, "u1", "other", "es")).not.toHaveProperty("categories");
  });
});
