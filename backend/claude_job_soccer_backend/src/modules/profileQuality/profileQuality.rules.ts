import { CandidateRole } from "../user/user.interface";
import { VideoKind } from "../video/video.constant";
import {
  LEVEL_BANDS,
  TProfileQuality,
  TQualityCategory,
  TQualityItem,
} from "./profileQuality.interface";
import { itemLabel, renderTip, TipParams } from "./profileQuality.i18n";

/**
 * Profile Quality Score rules: pure functions, no database, no AI.
 *
 * Points per category come from the client's PDF:
 *            Completion  Verification  Media  Maintenance
 *   Staff        25           25         35       15
 *   Players      35           20         35       10
 *
 * Items that do not apply to a role (e.g. licences for office staff, response
 * reliability before the candidate ever received a message) are left out and the
 * category is scaled to its full points, so nobody is penalised for them.
 * Recruitment results never add points.
 */

/** Everything the rules need to know about one candidate (loaded by the service). */
export type TQualitySnapshot = {
  role: CandidateRole;
  profile: Record<string, any>;
  profileImage?: string | null;
  videos: { kind: string }[];
  experiences: { description?: string; verificationStatus?: string }[];
  educations: { verificationStatus?: string }[];
  licenses: { verificationStatus?: string }[];
  /** An active CV is uploaded; `text` is its extracted text when there is one. */
  resume: { text?: string | null } | null;
  /** Account-level identity verification by an admin. */
  identityStatus: "approved" | "pending" | "rejected" | null;
  /** Chats where the candidate received a message in the last 90 days; null = fewer than 3 (not rated). */
  responseRate: number | null;
  now: Date;
  /** AI judgement of text quality, when available (0-1 each). */
  ai?: { experienceQuality?: number; cvRelevance?: number } | null;
};

type TItemSpec = {
  key: string;
  /** Key of the label in the en/es/fr catalog (profileQuality.i18n). */
  labelKey: string;
  max: number;
  /** 0-1: how much of the item is earned. */
  fraction: number;
  /** Not counted when false (the category is scaled instead). */
  applicable?: boolean;
  /** Catalog key of the improvement tip (+ params), shown while the item is not complete. */
  tipKey?: string;
  tipParams?: TipParams;
  /** The tip is only "waiting for an admin review": sorted after tips the candidate can act on. */
  waiting?: boolean;
};

const PLAYER_ROLES: CandidateRole[] = [
  CandidateRole.PROFESSIONAL_PLAYER,
  CandidateRole.AMATEUR_PLAYER,
  CandidateRole.HIGH_SCHOOL,
  CandidateRole.COLLEGE_UNIVERSITY,
];

export const isPlayer = (role: CandidateRole): boolean => PLAYER_ROLES.includes(role);

const filled = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    // height / weight are { size, unit }
    return "size" in record ? filled(record.size) : Object.keys(record).length > 0;
  }
  return Boolean(value);
};

/** Share of the given profile fields that are filled in (0-1). */
const fieldShare = (profile: Record<string, any>, fields: string[]): number =>
  fields.length ? fields.filter((field) => filled(profile[field])).length / fields.length : 1;

const missingFields = (profile: Record<string, any>, fields: string[]): string[] => fields.filter((field) => !filled(profile[field]));

const monthsSince = (date: Date | string | undefined, now: Date): number =>
  date ? (now.getTime() - new Date(date).getTime()) / (30 * 24 * 3600 * 1000) : Infinity;

const approvedCount = (records: { verificationStatus?: string }[]): number => records.filter((r) => r.verificationStatus === "approved").length;
const pendingCount = (records: { verificationStatus?: string }[]): number => records.filter((r) => r.verificationStatus === "pending").length;

/** Heuristic text quality when the AI judgement is not available: longer, concrete descriptions score higher. */
export const heuristicExperienceQuality = (experiences: { description?: string }[]): number => {
  if (!experiences.length) return 0;
  const scores: number[] = experiences.map((e) => {
    const length = (e.description ?? "").trim().length;
    return length >= 120 ? 1 : length >= 40 ? 0.5 : 0;
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

// ─── Category builders ───────────────────────────────────────────────────────

/** Tip of an item: a catalog key plus params, so it can be shown in any language. */
type TTipRef = { tipKey?: string; tipParams?: TipParams; waiting?: boolean };

/** "Add your a, b, c and more." for the profile fields still empty (no tip when nothing is missing). */
const missingTip = (profile: Record<string, any>, fields: string[]): TTipRef => {
  const missing = missingFields(profile, fields);
  return missing.length ? { tipKey: "addMissingFields", tipParams: { fields: missing.slice(0, 3), more: missing.length > 3 } } : {};
};

const STAFF_BASIC_FIELDS = ["dateOfBirth", "placeOfBirth", "nationality", "country", "gender", "currentClub", "phoneNumber"];

const staffCompletion = (s: TQualitySnapshot): TItemSpec[] => {
  const onField = s.role === CandidateRole.ON_FIELD_STAFF;
  const basics = onField ? [...STAFF_BASIC_FIELDS, "league"] : STAFF_BASIC_FIELDS;
  const experienceCount = s.experiences.length;
  const quality = s.ai?.experienceQuality ?? heuristicExperienceQuality(s.experiences);
  return [
    { key: "basics", labelKey: "basicsStaff", max: 8, fraction: fieldShare(s.profile, basics), ...missingTip(s.profile, basics) },
    { key: "social", labelKey: "social", max: 2, fraction: filled(s.profile.socialMedia) ? 1 : 0, tipKey: "addSocial" },
    {
      key: "experience",
      labelKey: "experience",
      max: 7,
      fraction: experienceCount ? 0.6 * (Math.min(experienceCount, 2) / 2) + 0.4 * quality : 0,
      ...(experienceCount === 0
        ? { tipKey: "addExperience" }
        : experienceCount < 2 || quality < 0.7
        ? { tipKey: "addMoreExperience" }
        : {}),
    },
    { key: "education", labelKey: "education", max: 4, fraction: s.educations.length ? 1 : 0, tipKey: "addEducation" },
    {
      key: "licenses",
      labelKey: "licenses",
      max: 4,
      fraction: s.licenses.length ? 1 : 0,
      // Not required for office roles (do not demand irrelevant qualifications).
      applicable: onField,
      tipKey: "addLicenses",
    },
  ];
};

const staffVerification = (s: TQualitySnapshot): TItemSpec[] => {
  const credentialDocs = approvedCount(s.licenses) + approvedCount(s.educations);
  const credentialPending = pendingCount(s.licenses) + pendingCount(s.educations);
  return [
    {
      key: "identity",
      labelKey: "identity",
      max: 10,
      fraction: s.identityStatus === "approved" ? 1 : s.identityStatus === "pending" ? 0.3 : 0,
      ...(s.identityStatus === "pending" ? { tipKey: "identityWaiting", waiting: true } : { tipKey: "identityRequest" }),
    },
    {
      key: "credentials",
      labelKey: "credentials",
      max: 8,
      fraction: credentialDocs >= 2 ? 1 : credentialDocs === 1 ? 0.6 : credentialPending ? 0.2 : 0,
      ...(credentialPending && !credentialDocs ? { tipKey: "credentialsWaiting", waiting: true } : { tipKey: "credentialsUpload" }),
    },
    {
      key: "history",
      labelKey: "workHistoryVerified",
      max: 7,
      fraction: approvedCount(s.experiences) >= 1 ? 1 : pendingCount(s.experiences) ? 0.2 : 0,
      ...(pendingCount(s.experiences) ? { tipKey: "workHistoryWaiting", waiting: true } : { tipKey: "workHistoryUpload" }),
    },
  ];
};

const staffMedia = (s: TQualitySnapshot): TItemSpec[] => {
  const has = (kind: VideoKind) => s.videos.some((v) => v.kind === kind);
  const cvFraction = s.resume ? 0.6 + 0.4 * (s.ai?.cvRelevance ?? (s.resume.text ? 0.7 : 0.5)) : 0;
  return [
    { key: "photo", labelKey: "photo", max: 5, fraction: s.profileImage ? 1 : 0, tipKey: "addPhoto" },
    { key: "cv", labelKey: "cv", max: 5, fraction: cvFraction, tipKey: s.resume ? "updateCv" : "uploadCv" },
    // The methodology video is optional (5 points); the interview carries the rest, so media always adds up to 35.
    { key: "interview", labelKey: "interview", max: 20, fraction: has(VideoKind.INTERVIEW) ? 1 : 0, tipKey: "recordInterview" },
    { key: "methodology", labelKey: "methodology", max: 5, fraction: has(VideoKind.METHODOLOGY) ? 1 : 0, tipKey: "addMethodology" },
  ];
};

const maintenance = (s: TQualitySnapshot, weights: { availability: number; freshness: number; responsiveness: number }): TItemSpec[] => {
  const age = monthsSince(s.profile.updatedAt, s.now);
  return [
    { key: "availability", labelKey: "availability", max: weights.availability, fraction: filled(s.profile.availability) ? 1 : 0, tipKey: "updateAvailability" },
    { key: "freshness", labelKey: "freshness", max: weights.freshness, fraction: age <= 6 ? 1 : age <= 12 ? 0.6 : 0.2, tipKey: "reviewProfile" },
    {
      key: "responsiveness",
      labelKey: "responsiveness",
      max: weights.responsiveness,
      fraction: s.responseRate === null ? 0 : s.responseRate >= 0.7 ? 1 : s.responseRate >= 0.4 ? 0.6 : 0.2,
      // Only rated once the candidate has actually received messages.
      applicable: s.responseRate !== null,
      tipKey: "replyMessages",
    },
  ];
};

const PLAYER_BASIC_FIELDS = ["dateOfBirth", "placeOfBirth", "nationality", "country", "gender", "height", "weight", "foot"];

const PLAYER_BACKGROUND_FIELDS: Partial<Record<CandidateRole, string[]>> = {
  [CandidateRole.PROFESSIONAL_PLAYER]: ["teamsJoined", "contractExpires", "nationalTeamGames"],
  [CandidateRole.HIGH_SCHOOL]: ["schoolName", "gpa", "satOrAct", "category"],
  [CandidateRole.COLLEGE_UNIVERSITY]: ["collegeOrUniversity", "schoolName", "gpa", "satOrAct"],
};

const playerCompletion = (s: TQualitySnapshot): TItemSpec[] => {
  const sporting = ["position", "currentClub", s.role === CandidateRole.PROFESSIONAL_PLAYER ? "division" : "league"];
  const background = PLAYER_BACKGROUND_FIELDS[s.role];
  const contactFields = ["phoneNumber", "socialMedia"];
  const contactTip = missingTip(s.profile, contactFields);
  return [
    { key: "basics", labelKey: "basicsPlayer", max: 10, fraction: fieldShare(s.profile, PLAYER_BASIC_FIELDS), ...missingTip(s.profile, PLAYER_BASIC_FIELDS) },
    { key: "sporting", labelKey: "sporting", max: 6, fraction: fieldShare(s.profile, sporting), ...missingTip(s.profile, sporting) },
    {
      key: "contact",
      labelKey: "contact",
      max: 6,
      fraction: fieldShare(s.profile, contactFields),
      ...(contactTip.tipKey ? contactTip : { tipKey: "addPhoneSocial" }),
    },
    {
      key: "background",
      labelKey: s.role === CandidateRole.HIGH_SCHOOL || s.role === CandidateRole.COLLEGE_UNIVERSITY ? "schoolDetails" : "careerDetails",
      max: 8,
      fraction: background ? fieldShare(s.profile, background) : 0,
      applicable: !!background,
      ...(background ? missingTip(s.profile, background) : {}),
    },
    { key: "history", labelKey: "clubHistory", max: 5, fraction: s.experiences.length ? 1 : 0, tipKey: "addClubs" },
  ];
};

const playerVerification = (s: TQualitySnapshot): TItemSpec[] => [
  {
    key: "identity",
    labelKey: "identity",
    max: 10,
    fraction: s.identityStatus === "approved" ? 1 : s.identityStatus === "pending" ? 0.3 : 0,
    ...(s.identityStatus === "pending" ? { tipKey: "identityWaiting", waiting: true } : { tipKey: "identityRequest" }),
  },
  {
    key: "history",
    labelKey: "clubHistoryVerified",
    max: 10,
    fraction: approvedCount(s.experiences) >= 1 ? 1 : pendingCount(s.experiences) ? 0.2 : 0,
    ...(pendingCount(s.experiences) ? { tipKey: "clubHistoryWaiting", waiting: true } : { tipKey: "clubHistoryUpload" }),
  },
];

const playerMedia = (s: TQualitySnapshot): TItemSpec[] => [
  { key: "photo", labelKey: "photo", max: 5, fraction: s.profileImage ? 1 : 0, tipKey: "addPhoto" },
  {
    key: "highlights",
    labelKey: "highlights",
    max: 30,
    fraction: Math.min(s.videos.filter((v) => v.kind === VideoKind.HIGHLIGHTS).length, 2) / 2,
    tipKey: "uploadHighlights",
  },
];

// ─── Scoring ─────────────────────────────────────────────────────────────────

const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Turn item specs into one category. Applicable items are scaled to the category's full points. */
const buildCategory = (
  key: TQualityCategory["key"],
  label: string,
  categoryMax: number,
  specs: TItemSpec[]
): TQualityCategory => {
  const applicable = specs.filter((spec) => spec.applicable !== false);
  const applicableMax = applicable.reduce((sum, spec) => sum + spec.max, 0);
  const scale = applicableMax > 0 ? categoryMax / applicableMax : 0;

  const items: TQualityItem[] = applicable.map((spec) => {
    const max = round1(spec.max * scale);
    const earned = round1(Math.min(1, Math.max(0, spec.fraction)) * max);
    const done = earned >= max - 0.05;
    const tip = done || !spec.tipKey ? undefined : renderTip(spec.tipKey, spec.tipParams, "en");
    return {
      key: spec.key,
      label: itemLabel(spec.labelKey, "en"),
      labelKey: spec.labelKey,
      earned,
      max,
      done,
      ...(tip
        ? { tip, tipKey: spec.tipKey, ...(spec.tipParams ? { tipParams: spec.tipParams } : {}), ...(spec.waiting ? { waiting: true } : {}) }
        : {}),
    };
  });
  const earned = Math.min(categoryMax, Math.round(items.reduce((sum, item) => sum + item.earned, 0)));
  return { key, label, earned, max: categoryMax, items };
};

/**
 * Items that still have a tip, best first: the most points still to win, with
 * "waiting for review" notes last. Uses the item's own flag, never its (translated) text.
 */
export const selectTipItems = (categories: TQualityCategory[]): TQualityItem[] =>
  categories
    .flatMap((category) => category.items)
    .filter((item) => !item.done && item.tip)
    .sort((a, b) => {
      if (!!a.waiting !== !!b.waiting) return a.waiting ? 1 : -1;
      return b.max - b.earned - (a.max - a.earned);
    });

/** Calculate the Profile Quality Score from a snapshot of the candidate. */
export const calculateProfileQuality = (s: TQualitySnapshot): Omit<TProfileQuality, "calculatedAt"> => {
  const player = isPlayer(s.role);
  const categories: TQualityCategory[] = player
    ? [
        buildCategory("completion", "Profile Completion", 35, playerCompletion(s)),
        buildCategory("verification", "Verification & Credentials", 20, playerVerification(s)),
        buildCategory("media", "Media Portfolio", 35, playerMedia(s)),
        buildCategory("maintenance", "Maintenance & Responsiveness", 10, maintenance(s, { availability: 4, freshness: 3, responsiveness: 3 })),
      ]
    : [
        buildCategory("completion", "Profile Completion", 25, staffCompletion(s)),
        buildCategory("verification", "Verification & Credentials", 25, staffVerification(s)),
        buildCategory("media", "Media Portfolio", 35, staffMedia(s)),
        buildCategory("maintenance", "Maintenance & Responsiveness", 15, maintenance(s, { availability: 5, freshness: 5, responsiveness: 5 })),
      ];

  const score = Math.min(100, categories.reduce((sum, category) => sum + category.earned, 0));
  const band = LEVEL_BANDS.find((b) => score >= b.min)!;

  const tips = selectTipItems(categories)
    .map((item) => item.tip as string)
    .slice(0, 5);

  return { score, level: band.level, stars: band.stars, categories, tips };
};
