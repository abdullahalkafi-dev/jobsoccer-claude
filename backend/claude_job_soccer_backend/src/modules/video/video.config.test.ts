import { describe, expect, it } from "vitest";
import { CandidateRole } from "../user/user.interface";
import { OfficeStaffPosition, OnFieldStaffPosition } from "../../shared/constant/position.constant";
import { getVideoPlan } from "./video.config";
import { planTexts, splitOptional } from "./video.i18n";
import { VIDEO_TEXTS } from "./video.texts";

const allPlans = () => {
  const plans = [
    CandidateRole.PROFESSIONAL_PLAYER,
    CandidateRole.AMATEUR_PLAYER,
    CandidateRole.HIGH_SCHOOL,
    CandidateRole.COLLEGE_UNIVERSITY,
  ].map((role) => getVideoPlan(role, null));
  for (const position of Object.values(OnFieldStaffPosition)) plans.push(getVideoPlan(CandidateRole.ON_FIELD_STAFF, position));
  for (const position of Object.values(OfficeStaffPosition)) plans.push(getVideoPlan(CandidateRole.OFFICE_STAFF, position));
  return plans.filter((p): p is NonNullable<typeof p> => !!p);
};

describe("video plan languages", () => {
  const plans = allPlans();

  it("builds plans for every role and position", () => {
    expect(plans.length).toBeGreaterThan(15);
  });

  it("every text of every plan has a Spanish and a French translation", () => {
    const texts = new Set(plans.flatMap(planTexts).map((t) => splitOptional(t)[0]));
    const missing = { es: [] as string[], fr: [] as string[] };
    for (const text of texts) {
      if (!(text in VIDEO_TEXTS.es)) missing.es.push(text);
      if (!(text in VIDEO_TEXTS.fr)) missing.fr.push(text);
    }
    expect(missing, "Add these to src/modules/video/video.texts.ts").toEqual({ es: [], fr: [] });
  });

  it("every language has the same structure", () => {
    const shape = (p: any) => ({
      kinds: p.slots.map((s: any) => [s.kind, s.required, s.count, s.maxSeconds, s.locked]),
      sections: p.slots.map((s: any) => s.sections.map((x: any) => x.items.length)),
      consent: [p.consent.ai.required, p.consent.players.required, p.consent.version],
      limits: p.limits,
    });
    for (const [role, position] of [
      [CandidateRole.HIGH_SCHOOL, null],
      [CandidateRole.ON_FIELD_STAFF, OnFieldStaffPosition.HEAD_COACH],
      [CandidateRole.OFFICE_STAFF, Object.values(OfficeStaffPosition)[0]],
    ] as const) {
      const en = getVideoPlan(role, position, "en");
      expect(shape(getVideoPlan(role, position, "es"))).toEqual(shape(en));
      expect(shape(getVideoPlan(role, position, "fr"))).toEqual(shape(en));
    }
  });

  it("translates titles, consent and the optional suffix", () => {
    const es = getVideoPlan(CandidateRole.OFFICE_STAFF, Object.values(OfficeStaffPosition)[0], "es")!;
    expect(es.slots[0].title).toBe("Entrevista en vídeo");
    expect(es.slots[1].title).toBe("Vídeo de metodología profesional (opcional)");
    expect(es.consent.ai.text).toContain("IA");
    const fr = getVideoPlan(CandidateRole.HIGH_SCHOOL, null, "fr")!;
    expect(fr.slots[0].title).toBe("Temps forts");
  });

  it("file name examples use an unambiguous YYYY-MM-DD date", () => {
    for (const plan of plans) expect(plan.fileNameHint).toMatch(/YYYY-MM-DD, example: .*-\d{4}-\d{2}-\d{2}\)$/);
  });
});
