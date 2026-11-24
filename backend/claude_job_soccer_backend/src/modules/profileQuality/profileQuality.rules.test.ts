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
  createdAt: new Date("2026-01-01T00:00:00Z"),
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
  activityDates: [recently],
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
    expect(result.score).toBe(65); // interview 25 + methodology 10 missing
    expect(result.tips[0]).toBe("Record your video interview.");
    expect(result.tips).toContain("Optional: add a methodology video to stand out to employers.");
  });

  it("caps staff at 90 without the optional methodology video (worth 10 points)", () => {
    for (const role of [CandidateRole.ON_FIELD_STAFF, CandidateRole.OFFICE_STAFF]) {
      const result = calculateProfileQuality(fullStaff({ role, videos: [{ kind: VideoKind.INTERVIEW }] }));
      expect(result.score).toBe(90);
      expect(result.level).toBe("premium");
      const media = result.categories.find((c) => c.key === "media")!;
      expect(media.max).toBe(35);
      expect(media.items.find((i) => i.key === "methodology")!.max).toBe(10);
      expect(media.items.find((i) => i.key === "interview")!.max).toBe(25);
      expect(media.items.map((i) => i.key)).not.toContain("photo"); // the photo is a basic detail now
    }
  });

  it("counts the profile photo among the basic details of Profile Completion", () => {
    const withPhoto = calculateProfileQuality(fullStaff());
    const withoutPhoto = calculateProfileQuality(fullStaff({ profileImage: null }));
    expect(withPhoto.score).toBeGreaterThan(withoutPhoto.score);
    expect(withoutPhoto.tips.join(" ")).toContain("profile photo");
    expect(withoutPhoto.categories.find((c) => c.key === "media")!.earned).toBe(35);
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

  it("gives every registered profile a flat 3 maintenance points at once and the rest follows what the person does", () => {
    const m = (snapshot: TQualitySnapshot) => calculateProfileQuality(snapshot).categories.find((c) => c.key === "maintenance")!;
    const brandNew = { responseRate: null, profile: { ...fullStaffProfile, createdAt: new Date("2026-11-04T23:00:00Z") }, activityDates: [now] };
    const fresh = m(fullStaff(brandNew));
    expect(fresh.max).toBe(15);
    expect(fresh.items.map((i) => i.key)).toEqual(["registered", "availability", "activity", "responsiveness"]);
    expect(fresh.items.find((i) => i.key === "registered")).toMatchObject({ earned: 3, max: 3, done: true });
    // No waiting time: availability 5 + the items added while signing up 2 + registered 3
    expect(fresh.earned).toBe(10);
    // Nothing else filled in: everybody still has the 3 points
    expect(m(fullStaff({ ...brandNew, profile: { ...brandNew.profile, availability: "" }, activityDates: [] })).earned).toBe(3);
    // Replies once rated: the full 15
    expect(m(fullStaff({ ...brandNew, responseRate: 1 })).earned).toBe(15);
  });

  it("older items earn less (6 months full, 12 months 60%, older 20%)", () => {
    const m = (date: Date) => calculateProfileQuality(fullStaff({ responseRate: null, activityDates: [date] })).categories.find((c) => c.key === "maintenance")!.items.find((i) => i.key === "activity")!;
    expect(m(new Date("2026-08-01T00:00:00Z")).earned).toBe(2);
    expect(m(new Date("2026-02-01T00:00:00Z")).earned).toBe(1.2);
    expect(m(new Date("2025-06-01T00:00:00Z")).earned).toBe(0.4);
  });

  it("splits staff maintenance 3 + 5 + 2 + 5 and does not scale the reply points away before messages arrive", () => {
    const unrated = calculateProfileQuality(fullStaff({ responseRate: null })).categories.find((c) => c.key === "maintenance")!;
    expect(unrated.items.map((i) => [i.key, i.max])).toEqual([["registered", 3], ["availability", 5], ["activity", 2], ["responsiveness", 5]]);
    const replies = unrated.items.find((i) => i.key === "responsiveness")!;
    expect(replies).toMatchObject({ earned: 0, max: 5, done: false, waiting: true, tipKey: "repliesNotRated" });
    expect(unrated.earned).toBe(10);
    // The "come back and review" item no longer exists
    expect(unrated.items.map((i) => i.key)).not.toContain("freshness");
  });

  it("stamps the rules version so older saved scores are recalculated once", () => {
    expect(calculateProfileQuality(fullStaff()).rulesVersion).toBe(QUALITY_RULES_VERSION);
  });

  it("does not demand licences from office staff and does not penalise missing messages (they only keep 5 points waiting)", () => {
    const office = calculateProfileQuality(
      fullStaff({
        role: CandidateRole.OFFICE_STAFF,
        profile: { ...fullStaffProfile, league: undefined },
        licenses: [],
        responseRate: null,
        videos: [{ kind: VideoKind.INTERVIEW }, { kind: VideoKind.METHODOLOGY }],
      })
    );
    expect(office.score).toBe(95); // 100 minus the 5 reply points that start counting after the first messages
    expect(office.categories.find((c) => c.key === "completion")!.items.map((i) => i.key)).not.toContain("licenses");
    expect(office.categories.find((c) => c.key === "maintenance")!.items.find((i) => i.key === "responsiveness")).toMatchObject({ earned: 0, waiting: true });
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
    availability: "Now",
    createdAt: new Date("2026-01-01T00:00:00Z"),
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
      activityDates: [recently],
    });
    expect(result.categories.map((c) => c.max)).toEqual([35, 20, 35, 10]);
    expect(result.score).toBe(100);
    // The CV is part of Profile Completion for players too
    expect(result.categories.find((c) => c.key === "completion")!.items.find((i) => i.key === "cv")).toMatchObject({ max: 5, earned: 5 });
  });

  const player = (role: CandidateRole, over: Partial<TQualitySnapshot> = {}): TQualitySnapshot => ({
    role,
    profile: playerProfile,
    profileImage: "/images/p.webp",
    videos: [],
    experiences: [],
    educations: [],
    licenses: [],
    resume: null,
    identityStatus: null,
    responseRate: null,
    now,
    ...over,
  });
  const media = (r: ReturnType<typeof calculateProfileQuality>) => r.categories.find((c) => c.key === "media")!;

  it("gives half of the highlight points for one video and all of them for two (the client wants 2 for a high score)", () => {
    const one = calculateProfileQuality(player(CandidateRole.AMATEUR_PLAYER, { videos: [{ kind: VideoKind.HIGHLIGHTS }] }));
    expect(media(one).earned).toBe(20); // photo 5 + highlights 15
    expect(one.tips.join(" ")).toContain("highlight");
    const two = calculateProfileQuality(player(CandidateRole.AMATEUR_PLAYER, { videos: [{ kind: VideoKind.HIGHLIGHTS }, { kind: VideoKind.HIGHLIGHTS }] }));
    expect(media(two).earned).toBe(35);
  });

  it("verifies players by identity only (20 of 20): no reference letter for any player role", () => {
    const verification = (r: ReturnType<typeof calculateProfileQuality>) => r.categories.find((c) => c.key === "verification")!;
    const completion = (r: ReturnType<typeof calculateProfileQuality>) => r.categories.find((c) => c.key === "completion")!;
    for (const role of [CandidateRole.PROFESSIONAL_PLAYER, CandidateRole.AMATEUR_PLAYER, CandidateRole.HIGH_SCHOOL, CandidateRole.COLLEGE_UNIVERSITY]) {
      const result = calculateProfileQuality(player(role));
      expect(verification(result).items.map((i) => [i.key, i.max])).toEqual([["identity", 20]]);
      expect(result.tips.join(" ")).not.toMatch(/reference letter/i);
    }
    // Club items in Profile Completion stay for professional players only
    expect(completion(calculateProfileQuality(player(CandidateRole.PROFESSIONAL_PLAYER))).items.map((i) => i.key)).toContain("history");
    for (const role of [CandidateRole.AMATEUR_PLAYER, CandidateRole.HIGH_SCHOOL, CandidateRole.COLLEGE_UNIVERSITY]) {
      expect(completion(calculateProfileQuality(player(role))).items.map((i) => i.key)).not.toContain("history");
    }
    // Approved identity alone gives the whole category
    expect(verification(calculateProfileQuality(player(CandidateRole.PROFESSIONAL_PLAYER, { identityStatus: "approved" }))).earned).toBe(20);
  });

  it("does not count the optional national team games in Profile Completion", () => {
    const without = calculateProfileQuality(player(CandidateRole.PROFESSIONAL_PLAYER));
    const withGames = calculateProfileQuality(player(CandidateRole.PROFESSIONAL_PLAYER, { profile: { ...playerProfile, nationalTeamGames: "12" } }));
    expect(withGames.score).toBe(without.score);
    expect(without.tips.join(" ")).not.toContain("national team");
  });

  it("splits player maintenance 3 + 2 + 1 + 4 (registered, availability, new items, replies)", () => {
    const m = calculateProfileQuality(player(CandidateRole.PROFESSIONAL_PLAYER)).categories.find((c) => c.key === "maintenance")!;
    expect(m.items.map((i) => [i.key, i.max])).toEqual([["registered", 3], ["availability", 2], ["activity", 1], ["responsiveness", 4]]);
  });
});
