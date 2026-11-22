import { describe, expect, it } from "vitest";
import { ProfessionalPlayerProfileDto } from "./professionalPlayerProfile.dto";
import { AmateurPlayerProfileDto } from "../amateurPlayerProfile/amateurPlayerProfile.dto";

const base = {
  dateOfBirth: "2000-01-01",
  placeOfBirth: "Lyon",
  nationality: "French",
  gender: "Male",
  height: { size: 180, unit: "cm" },
  currentClub: "AS Test",
  division: "National 2",
  position: "Striker",
  country: "France",
  weight: { size: 72, unit: "kg" },
  foot: "Right",
  teamsJoined: "AS Test",
  contractExpires: "2027",
};

describe("professional player DTO (client round 2026-11-22)", () => {
  const parse = (extra: Record<string, unknown>) => ProfessionalPlayerProfileDto.createProfessionalPlayerProfileDto.safeParse({ ...base, ...extra });

  it("accepts a profile without national team games and category (both optional)", () => {
    expect(parse({}).success).toBe(true);
  });

  it("accepts several national team categories, and a single old-style value becomes a list", () => {
    const several = parse({ nationalTeamCategory: ["U15", "U17", "Current International"] });
    expect(several.success && several.data.nationalTeamCategory).toEqual(["U15", "U17", "Current International"]);
    const single = parse({ nationalTeamCategory: "U19" });
    expect(single.success && single.data.nationalTeamCategory).toEqual(["U19"]);
    expect(parse({ nationalTeamCategory: ["U99"] }).success).toBe(false);
  });

  it("no longer accepts Forward as a position (Striker stays)", () => {
    expect(parse({ position: "Forward" }).success).toBe(false);
    expect(parse({ position: "Striker" }).success).toBe(true);
  });
});

describe("amateur player DTO", () => {
  it("accepts several categories including Adult", () => {
    const amateur = {
      dateOfBirth: "2000-01-01",
      placeOfBirth: "Lyon",
      nationality: "French",
      gender: "Male",
      height: { size: 180, unit: "cm" },
      currentClub: "AS Test",
      position: "Striker",
      country: "France",
      weight: { size: 72, unit: "kg" },
      foot: "Right",
      league: "District",
    };
    const result = AmateurPlayerProfileDto.createAmateurPlayerProfileDto.safeParse({ ...amateur, nationalTeamCategory: ["U17", "Adult"] });
    expect(result.success && result.data.nationalTeamCategory).toEqual(["U17", "Adult"]);
    expect(AmateurPlayerProfileDto.createAmateurPlayerProfileDto.safeParse({ ...amateur, position: "Forward" }).success).toBe(false);
  });
});
