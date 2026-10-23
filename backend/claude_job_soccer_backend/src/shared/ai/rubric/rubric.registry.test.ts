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
  // 2026-10-23: 18-question versions
  "on_field_staff.assistant_coach.amateur.v2": [50, 72],
  "on_field_staff.mental_coach.v2": [48, 72],
  // 2026-10-23: office staff guides
  "office_staff.administrative_director.v1": [48, 72],
  "office_staff.community_manager.v1": [49, 72],
  "office_staff.data_analyst.v1": [49, 72],
  "office_staff.digital_marketing.v1": [47, 72],
  "office_staff.event_manager.v1": [51, 72],
  "office_staff.nutritionist.v1": [51, 72],
  "office_staff.pr_communications_manager.v1": [52, 72],
  "office_staff.team_manager.v1": [50, 72],
};

describe("rubric registry", () => {
  it("loads all client scoring guides (on-field v1, 18-question v2 and office staff)", () => {
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

  it("the 18-question versions win over the old 15-question ones", () => {
    const mental = resolveRubric({ role: CandidateRole.ON_FIELD_STAFF, position: "Mental Coach" })!;
    expect(mental.rubricId).toBe("on_field_staff.mental_coach.v2");
    expect(mental.questionCount).toBe(18);
    const assistant = resolveRubric({ role: CandidateRole.ON_FIELD_STAFF, position: "Assistant Coach" })!;
    expect(assistant.rubricId).toBe("on_field_staff.assistant_coach.amateur.v2");
    expect(assistant.maxTotalScore).toBe(72);
    // old evaluations still find their guide by id
    expect(getRubric("on_field_staff.mental_coach.v1")?.questionCount).toBe(15);
  });

  it("office staff guides resolve by the client's role names", () => {
    for (const position of [
      "Administrative Director",
      "Community Manager",
      "Data Analyst",
      "Digital Marketing",
      "Event Manager",
      "Nutritionist",
      "PR & Communications Manager",
      "Team Manager",
    ]) {
      const rubric = resolveRubric({ role: CandidateRole.OFFICE_STAFF, position });
      expect(rubric, position).not.toBeNull();
      expect(rubric!.questionCount).toBe(18);
    }
    expect(resolveRubric({ role: CandidateRole.OFFICE_STAFF, position: "Sales" })).toBeNull();
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
