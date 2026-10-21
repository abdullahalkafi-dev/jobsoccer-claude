import { describe, expect, it } from "vitest";
import { CandidateRole } from "../../modules/user/user.interface";
import { OnFieldStaffCanDto } from "../../modules/candidate/onFieldStaffCan/onFieldStaffCan.dto";
import { normalizeOnFieldPosition, TPosition } from "./video.constant";
import { getVideoRequirements } from "./videoRequirements.config";
import { getVideoScoringQuestions } from "./videoScoringQuestions.config";

describe("on-field positions", () => {
  it("maps the legacy Forward spelling to the Offensive value", () => {
    expect(normalizeOnFieldPosition("Specific Forward Coach")).toBe(TPosition.SPECIFIC_OFFENSIVE_COACH);
    expect(normalizeOnFieldPosition("Scout")).toBe("Scout");
  });

  it("every position has video requirements and a legacy question set", () => {
    for (const position of Object.values(TPosition)) {
      expect(() => getVideoRequirements(position)).not.toThrow();
      expect(getVideoScoringQuestions(CandidateRole.ON_FIELD_STAFF, position)).not.toBeNull();
    }
  });

  it("profile validation accepts both spellings and stores the Offensive value", () => {
    const schema = OnFieldStaffCanDto.updateOnFieldStaffCanDto;
    expect(schema.parse({ position: "Specific Forward Coach" }).position).toBe("Specific Offensive Coach");
    expect(schema.parse({ position: "Specific Offensive Coach" }).position).toBe("Specific Offensive Coach");
    expect(() => schema.parse({ position: "Attacking Wizard" })).toThrow();
  });

  it("legacy spelling still finds its question set", () => {
    expect(getVideoScoringQuestions(CandidateRole.ON_FIELD_STAFF, "Specific Forward Coach")).not.toBeNull();
  });
});
