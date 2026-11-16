import { describe, expect, it } from "vitest";
import { CandidateRole } from "../user/user.interface";
import { VideoKind } from "../video/video.constant";
import { QUALITY_RULES_VERSION } from "./profileQuality.interface";
import { calculateProfileQuality, TQualitySnapshot } from "./profileQuality.rules";

const now = new Date("2026-11-05T00:00:00Z");
const recently = new Date("2026-10-20T00:00:00Z");

const fullStaffProfile = {
  dateOfBirth: new Date("1985-01-01"),
  placeOfBirth: "Madrid",
  nationality: "Spanish",
  country: "Spain",
  gender: "Male",
  currentClub: "FC Test",
  phoneNumber: "+34 600 000 000",
  league: "La Liga 2",
  socialMedia: "https://instagram.com/test",
  availability: "Immediately",
  updatedAt: recently,
};

const approved = { verificationStatus: "approved" };
const richExperience = { description: "Led the U19 team for three seasons, built the training plan, promoted 6 players to the first team.", verificationStatus: "approved" };

const fullStaff = (overrides: Partial<TQualitySnapshot> = {}): TQualitySnapshot => ({
  role: CandidateRole.ON_FIELD_STAFF,
  profile: fullStaffProfile,
  profileImage: "/images/me.webp",
  videos: [{ kind: VideoKind.INTERVIEW }, { kind: VideoKind.METHODOLOGY }],
  experiences: [richExperience, richExperience],
  educations: [approved],
  licenses: [approved, approved],
  resume: { text: "CV text" },
  identityStatus: "approved",
  responseRate: 1,
  now,
  ai: { experienceQuality: 1, cvRelevance: 1 },
  ...overrides,
});

describe("calculateProfileQuality (staff)", () => {
  it("gives 100 and Premium to a complete, verified staff profile", () => {
    const result = calculateProfileQuality(fullStaff());
    expect(result.score).toBe(100);
    expect(result.level).toBe("premium");
    expect(result.stars).toBe(5);
    expect(result.tips).toEqual([]);
  });

  it("uses the client's point split: 25 / 25 / 35 / 15", () => {
    const result = calculateProfileQuality(fullStaff());
    expect(result.categories.map((c) => [c.key, c.max])).toEqual([
      ["completion", 25],
      ["verification", 25],
      ["media", 35],
      ["maintenance", 15],
    ]);
  });

  it("scores an empty profile as Incomplete with improvement actions", () => {
    const result = calculateProfileQuality({
      role: CandidateRole.ON_FIELD_STAFF,
      profile: { updatedAt: new Date("2020-01-01") },
      videos: [],
      experiences: [],
      educations: [],
      licenses: [],
      resume: null,
      identityStatus: null,
      responseRate: null,
      now,
    });
    expect(result.score).toBeLessThan(20);
    expect(result.level).toBe("incomplete");
    expect(result.tips.length).toBeGreaterThan(0);
  });

  it("ranks missing videos as the biggest improvement actions", () => {
    const result = calculateProfileQuality(fullStaff({ videos: [] }));
    expect(result.score).toBe(70); // interview 25 + methodology 5 missing
    expect(result.tips[0]).toBe("Record your video interview.");
    expect(result.tips).toContain("Optional: add a methodology video to stand out to employers.");
  });

  it("caps staff at 95 without the optional methodology video (worth 5 points)", () => {
    for (const role of [CandidateRole.ON_FIELD_STAFF, CandidateRole.OFFICE_STAFF]) {
      const result = calculateProfileQuality(fullStaff({ role, videos: [{ kind: VideoKind.INTERVIEW }] }));
      expect(result.score).toBe(95);
      expect(result.level).toBe("premium");
      const media = result.categories.find((c) => c.key === "media")!;
      expect(media.max).toBe(35);
      expect(media.items.find((i) => i.key === "methodology")!.max).toBe(5);
      expect(media.items.find((i) => i.key === "interview")!.max).toBe(25);
    }
  });

  it("puts the CV under Profile Completion (5 points) and any uploaded CV earns all of them", () => {
    const withCv = calculateProfileQuality(fullStaff({ ai: { experienceQuality: 1, cvRelevance: 0 } }));
    const withoutCv = calculateProfileQuality(fullStaff({ resume: null }));
    const completion = (r: ReturnType<typeof calculateProfileQuality>) => r.categories.find((c) => c.key === "completion")!;
    const media = (r: ReturnType<typeof calculateProfileQuality>) => r.categories.find((c) => c.key === "media")!;
    expect(completion(withCv).items.find((i) => i.key === "cv")).toMatchObject({ max: 5, earned: 5 });
    expect(media(withCv).items.map((i) => i.key)).not.toContain("cv");
    expect(withCv.score - withoutCv.score).toBe(5);
    expect(withoutCv.tips).toContain("Upload your CV.");
  });

  it("gives the 25 verification points for a verified identity plus one approved credential", () => {
    const verification = (r: ReturnType<typeof calculateProfileQuality>) => r.categories.find((c) => c.key === "verification")!;
    const ok = calculateProfileQuality(fullStaff({ licenses: [approved], educations: [], experiences: [richExperience] }));
    expect(verification(ok)).toMatchObject({ earned: 25, max: 25 });
    expect(verification(ok).items.map((i) => [i.key, i.max])).toEqual([["identity", 13], ["credentials", 12]]);
    // A verified work history counts as a credential
    const onlyWork = calculateProfileQuality(fullStaff({ licenses: [], educations: [], experiences: [richExperience] }));
    expect(verification(onlyWork).earned).toBe(25);
    // Identity alone is not enough
    const identityOnly = calculateProfileQuality(fullStaff({ licenses: [], educations: [], experiences: [{ description: "x" }] }));
    expect(verification(identityOnly).earned).toBe(13);
  });

  it("gives a brand-new profile at least 10 of the 15 maintenance points and never rewards logins", () => {
    const fresh = calculateProfileQuality(
      fullStaff({ responseRate: null, profile: { ...fullStaffProfile, availability: "", updatedAt: now } })
    );
    const maintenance = fresh.categories.find((c) => c.key === "maintenance")!;
    expect(maintenance.max).toBe(15);
    expect(maintenance.earned).toBeGreaterThanOrEqual(10);
    expect(maintenance.items.map((i) => i.key)).toEqual(["availability", "freshness"]);
  });

  it("splits maintenance 7 + 3 + 5 once messages have been received (and 10 + 5 before)", () => {
    const rated = calculateProfileQuality(fullStaff({ responseRate: 1 })).categories.find((c) => c.key === "maintenance")!;
    expect(rated.items.map((i) => [i.key, i.max]).sort()).toEqual([["availability", 3], ["freshness", 7], ["responsiveness", 5]]);
    const unrated = calculateProfileQuality(fullStaff({ responseRate: null })).categories.find((c) => c.key === "maintenance")!;
    expect(unrated.items.map((i) => [i.key, i.max]).sort()).toEqual([["availability", 5], ["freshness", 10]]);
  });

  it("stamps the rules version so older saved scores are recalculated once", () => {
    expect(calculateProfileQuality(fullStaff()).rulesVersion).toBe(QUALITY_RULES_VERSION);
  });

  it("does not demand licences from office staff and does not penalise missing messages", () => {
    const office = calculateProfileQuality(
      fullStaff({
        role: CandidateRole.OFFICE_STAFF,
        profile: { ...fullStaffProfile, league: undefined },
        licenses: [],
        responseRate: null,
        videos: [{ kind: VideoKind.INTERVIEW }, { kind: VideoKind.METHODOLOGY }],
      })
    );
    expect(office.score).toBeGreaterThanOrEqual(95);
    expect(office.categories.find((c) => c.key === "completion")!.items.map((i) => i.key)).not.toContain("licenses");
    expect(office.categories.find((c) => c.key === "maintenance")!.items.map((i) => i.key)).not.toContain("responsiveness");
  });

  it("rewards verified documents but gives partial credit while they wait for review", () => {
    const pending = calculateProfileQuality(fullStaff({ identityStatus: "pending", licenses: [{ verificationStatus: "pending" }], educations: [] }));
    const verified = calculateProfileQuality(fullStaff());
    expect(pending.score).toBeLessThan(verified.score);
    expect(pending.tips.join(" ")).toMatch(/waiting for review/);
  });

  it("falls back to a text-length rule when the AI judgement is not available", () => {
    const thin = calculateProfileQuality(fullStaff({ ai: null, experiences: [{ description: "coach" }, { description: "" }] }));
    const rich = calculateProfileQuality(fullStaff({ ai: null }));
    expect(thin.score).toBeLessThan(rich.score);
  });

  it("keeps a profile without the video interview below the premium threshold (90)", () => {
    expect(calculateProfileQuality(fullStaff({ videos: [{ kind: VideoKind.METHODOLOGY }] })).score).toBeLessThan(90);
  });
});

describe("calculateProfileQuality (players)", () => {
  const playerProfile = {
    dateOfBirth: new Date("2006-01-01"),
    placeOfBirth: "Lyon",
    nationality: "French",
    country: "France",
    gender: "Male",
    height: { size: 180, unit: "cm" },
    weight: { size: 72, unit: "kg" },
    foot: "Right",
    position: "Striker",
    currentClub: "AS Test",
    division: "National 2",
    phoneNumber: "+33 600 000 000",
    socialMedia: "https://instagram.com/player",
    teamsJoined: "AS Test, FC Youth",
    contractExpires: "2027",
    nationalTeamGames: "3",
    availability: "Now",
    updatedAt: recently,
  };

  it("uses the player split 35 / 20 / 35 / 10 and reaches 100 when everything is there", () => {
    const result = calculateProfileQuality({
      role: CandidateRole.PROFESSIONAL_PLAYER,
      profile: playerProfile,
      profileImage: "/images/p.webp",
      videos: [{ kind: VideoKind.HIGHLIGHTS }, { kind: VideoKind.HIGHLIGHTS }],
      experiences: [approved],
      educations: [],
      licenses: [],
      resume: { text: "CV text" },
      identityStatus: "approved",
      responseRate: 1,
      now,
    });
    expect(result.categories.map((c) => c.max)).toEqual([35, 20, 35, 10]);
    expect(result.score).toBe(100);
    // The CV is part of Profile Completion for players too
    expect(result.categories.find((c) => c.key === "completion")!.items.find((i) => i.key === "cv")).toMatchObject({ max: 5, earned: 5 });
  });

  it("gives the full highlight points for one video (the client asked for 1 or 2 videos)", () => {
    const result = calculateProfileQuality({
      role: CandidateRole.AMATEUR_PLAYER,
      profile: playerProfile,
      profileImage: "/images/p.webp",
      videos: [{ kind: VideoKind.HIGHLIGHTS }],
      experiences: [],
      educations: [],
      licenses: [],
      resume: null,
      identityStatus: null,
      responseRate: null,
      now,
    });
    const media = result.categories.find((c) => c.key === "media")!;
    expect(media.earned).toBe(35); // photo 5 + highlights 30 (one video is enough)
  });
});
