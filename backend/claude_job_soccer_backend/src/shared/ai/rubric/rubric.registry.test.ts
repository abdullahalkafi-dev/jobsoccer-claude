import { describe, expect, it } from "vitest";
import { CandidateRole } from "../../../modules/user/user.interface";
import { TPosition } from "../../constant/video.constant";
import { bandFor, getRubric, listRubrics, loadRubrics, resolveRubric } from "./rubric.registry";

// Sample totals stated in each client document (section 5).
const EXPECTED_SAMPLE_TOTALS: Record<string, [number, number]> = {
  "on_field_staff.head_coach.amateur.v1": [39, 72],
  "on_field_staff.assistant_coach.amateur.v1": [42, 60],
  "on_field_staff.academy_director.v1": [46, 72],
  "on_field_staff.attacking_coach.v1": [46, 72],
  "on_field_staff.defensive_coach.v1": [47, 72],
  "on_field_staff.director_of_coaching.v1": [39, 72],
  "on_field_staff.goalkeeper_coach.v1": [49, 72],
  "on_field_staff.mental_coach.v1": [40, 60],
  "on_field_staff.scout.v1": [48, 72],
  "on_field_staff.technical_director.v1": [44, 72],
  "on_field_staff.technical_development_coach.v1": [46, 72],
  "on_field_staff.video_analyst.v1": [44, 72],
};

describe("rubric registry", () => {
  it("loads all 12 client scoring guides", () => {
    expect(listRubrics().map((r) => r.rubricId).sort()).toEqual(Object.keys(EXPECTED_SAMPLE_TOTALS).sort());
  });

  it.each(Object.entries(EXPECTED_SAMPLE_TOTALS))("%s: sample answers add up to the document total", (id, [total, max]) => {
    const rubric = getRubric(id)!;
    const questions = rubric.sections.flatMap((s) => s.questions);
    const sum = questions.reduce((n, q) => n + (q.calibration?.suggestedScore ?? 0), 0);
    expect(rubric.maxTotalScore).toBe(max);
    expect(questions).toHaveLength(max / 4);
    expect(questions.every((q) => q.calibration)).toBe(true);
    expect(sum).toBe(total);
    expect(rubric.calibrationOverall?.totalScore).toBe(`${total}/${max}`);
  });

  it("every on-field position resolves to a rubric", () => {
    for (const position of Object.values(TPosition)) {
      expect(resolveRubric({ role: CandidateRole.ON_FIELD_STAFF, position })).not.toBeNull();
    }
  });

  it("uses the amateur guide for Head Coach and the legacy Forward spelling still resolves", () => {
    expect(resolveRubric({ role: CandidateRole.ON_FIELD_STAFF, position: "Head Coach" })?.rubricId).toBe(
      "on_field_staff.head_coach.amateur.v1"
    );
    expect(resolveRubric({ role: CandidateRole.ON_FIELD_STAFF, position: "Specific Forward Coach" })?.displayName).toBe(
      "Attacking Coach"
    );
    expect(resolveRubric({ role: CandidateRole.ON_FIELD_STAFF, position: "Head Coach", level: "professional" })).toBeNull();
  });

  it("bands cover every total and fall back to the base for files without bands", () => {
    for (const rubric of listRubrics()) {
      for (let total = 0; total <= rubric.maxTotalScore; total++) {
        expect(bandFor(rubric, total), `${rubric.rubricId} total ${total}`).not.toBeNull();
      }
    }
    expect(bandFor(getRubric("on_field_staff.video_analyst.v1")!, 44)).toBe("Basic/acceptable evidence");
  });

  it("rejects a broken file", () => {
    const broken = { ...getRubric("on_field_staff.scout.v1")!, rubricId: "on_field_staff.broken.v1", maxTotalScore: 70 };
    expect(() => loadRubrics([broken])).toThrow(/maxTotalScore/);
  });
});
