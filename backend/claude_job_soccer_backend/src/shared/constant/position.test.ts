import { describe, expect, it } from "vitest";
import { CandidateRole } from "../../modules/user/user.interface";
import { OnFieldStaffCanDto } from "../../modules/candidate/onFieldStaffCan/onFieldStaffCan.dto";
import { TPosition } from "./video.constant";
import { getVideoRequirements } from "./videoRequirements.config";
import { getVideoScoringQuestions } from "./videoScoringQuestions.config";

describe("on-field positions", () => {
  it("every position has video requirements and a legacy question set", () => {
    for (const position of Object.values(TPosition)) {
      expect(() => getVideoRequirements(position)).not.toThrow();
      expect(getVideoScoringQuestions(CandidateRole.ON_FIELD_STAFF, position)).not.toBeNull();
    }
  });

  it("profile validation accepts the client's names only", () => {
    const schema = OnFieldStaffCanDto.updateOnFieldStaffCanDto;
    expect(schema.parse({ position: "Attacking Coach" }).position).toBe("Attacking Coach");
    expect(schema.parse({ position: "Goalkeeper Coach" }).position).toBe("Goalkeeper Coach");
    for (const old of ["Specific Forward Coach", "Specific Offensive Coach", "GK Coach", "Video Analyst Coach", "Attacking Wizard"]) {
      expect(() => schema.parse({ position: old }), old).toThrow();
    }
  });

  it("uses exactly the client's twelve on-field names", () => {
    expect(Object.values(TPosition).sort()).toEqual(
      [
        "Academy Director",
        "Assistant Coach",
        "Attacking Coach",
        "Defensive Coach",
        "Director of Coaching",
        "Goalkeeper Coach",
        "Head Coach",
        "Mental Coach",
        "Scout",
        "Technical Development Coach",
        "Technical Director",
        "Video Analyst",
      ].sort()
    );
  });
});
