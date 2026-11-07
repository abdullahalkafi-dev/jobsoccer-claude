import { CandidateRole } from "../user/user.interface";
import { VideoKind } from "../video/video.constant";
import {
  LEVEL_BANDS,
  TProfileQuality,
  TQualityCategory,
  TQualityItem,
} from "./profileQuality.interface";

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
  label: string;
  max: number;
  /** 0-1: how much of the item is earned. */
  fraction: number;
  /** Not counted when false (the category is scaled instead). */
  applicable?: boolean;
  tip?: string;
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

const FIELD_LABELS: Record<string, string> = {
  dateOfBirth: "date of birth",
  placeOfBirth: "place of birth",
  nationality: "nationality",
  country: "country",
  gender: "gender",
  currentClub: "current club",
  phoneNumber: "phone number",
  league: "league",
  height: "height",
  weight: "weight",
  foot: "preferred foot",
  position: "position",
  division: "division",
  teamsJoined: "teams joined",
  contractExpires: "contract end date",
  nationalTeamGames: "national team games",
  schoolName: "school",
  gpa: "GPA",
  satOrAct: "SAT/ACT",
  category: "category",
  collegeOrUniversity: "college or university",
  diploma: "diploma",
  nationalTeamCategory: "national team category",
};

const describeMissing = (profile: Record<string, any>, fields: string[]): string => {
  const missing = missingFields(profile, fields).map((field) => FIELD_LABELS[field] ?? field);
  return missing.length ? `Add your ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? " and more" : ""}.` : "";
};

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

const STAFF_BASIC_FIELDS = ["dateOfBirth", "placeOfBirth", "nationality", "country", "gender", "currentClub", "phoneNumber"];

const staffCompletion = (s: TQualitySnapshot): TItemSpec[] => {
  const onField = s.role === CandidateRole.ON_FIELD_STAFF;
  const basics = onField ? [...STAFF_BASIC_FIELDS, "league"] : STAFF_BASIC_FIELDS;
  const experienceCount = s.experiences.length;
  const quality = s.ai?.experienceQuality ?? heuristicExperienceQuality(s.experiences);
  return [
    { key: "basics", label: "Personal and role details", max: 8, fraction: fieldShare(s.profile, basics), tip: describeMissing(s.profile, basics) },
    { key: "social", label: "Social media", max: 2, fraction: filled(s.profile.socialMedia) ? 1 : 0, tip: "Add a social media link so employers can see more of your work." },
    {
      key: "experience",
      label: "Experience history",
      max: 7,
      fraction: experienceCount ? 0.6 * (Math.min(experienceCount, 2) / 2) + 0.4 * quality : 0,
      tip:
        experienceCount === 0
          ? "Add your work experience (clubs, roles and dates)."
          : experienceCount < 2 || quality < 0.7
          ? "Add one more role and describe what you did and achieved in each."
          : undefined,
    },
    { key: "education", label: "Education", max: 4, fraction: s.educations.length ? 1 : 0, tip: "Add your education." },
    {
      key: "licenses",
      label: "Licences and certifications",
      max: 4,
      fraction: s.licenses.length ? 1 : 0,
      // Not required for office roles (do not demand irrelevant qualifications).
      applicable: onField,
      tip: "Add your coaching licences and certifications.",
    },
  ];
};

const staffVerification = (s: TQualitySnapshot): TItemSpec[] => {
  const credentialDocs = approvedCount(s.licenses) + approvedCount(s.educations);
  const credentialPending = pendingCount(s.licenses) + pendingCount(s.educations);
  return [
    {
      key: "identity",
      label: "Identity verified",
      max: 10,
      fraction: s.identityStatus === "approved" ? 1 : s.identityStatus === "pending" ? 0.3 : 0,
      tip: s.identityStatus === "pending" ? "Your identity check is waiting for review." : "Request identity verification from your profile.",
    },
    {
      key: "credentials",
      label: "Qualifications verified",
      max: 8,
      fraction: credentialDocs >= 2 ? 1 : credentialDocs === 1 ? 0.6 : credentialPending ? 0.2 : 0,
      tip: credentialPending && !credentialDocs ? "Your qualification documents are waiting for review." : "Upload a document for your latest licence or qualification so it can be verified.",
    },
    {
      key: "history",
      label: "Work history verified",
      max: 7,
      fraction: approvedCount(s.experiences) >= 1 ? 1 : pendingCount(s.experiences) ? 0.2 : 0,
      tip: pendingCount(s.experiences) ? "Your work history document is waiting for review." : "Upload a document that confirms one of your roles (contract, letter or club page).",
    },
  ];
};

const staffMedia = (s: TQualitySnapshot): TItemSpec[] => {
  const has = (kind: VideoKind) => s.videos.some((v) => v.kind === kind);
  const cvFraction = s.resume ? 0.6 + 0.4 * (s.ai?.cvRelevance ?? (s.resume.text ? 0.7 : 0.5)) : 0;
  return [
    { key: "photo", label: "Profile photo", max: 5, fraction: s.profileImage ? 1 : 0, tip: "Add a clear profile photo." },
    { key: "cv", label: "CV", max: 5, fraction: cvFraction, tip: s.resume ? "Update your CV so it matches your role." : "Upload your CV." },
    { key: "interview", label: "Video interview", max: 15, fraction: has(VideoKind.INTERVIEW) ? 1 : 0, tip: "Record your video interview." },
    {
      key: "methodology",
      label: "Methodology video",
      max: 10,
      fraction: has(VideoKind.METHODOLOGY) ? 1 : 0,
      tip: s.role === CandidateRole.OFFICE_STAFF ? "Optional: add a methodology video to stand out to employers." : "Upload your methodology video.",
    },
  ];
};

const maintenance = (s: TQualitySnapshot, weights: { availability: number; freshness: number; responsiveness: number }): TItemSpec[] => {
  const age = monthsSince(s.profile.updatedAt, s.now);
  return [
    { key: "availability", label: "Availability up to date", max: weights.availability, fraction: filled(s.profile.availability) ? 1 : 0, tip: "Update your availability." },
    {
      key: "freshness",
      label: "Profile recently updated",
      max: weights.freshness,
      fraction: age <= 6 ? 1 : age <= 12 ? 0.6 : 0.2,
      tip: "Review your profile. It has not been updated for a while.",
    },
    {
      key: "responsiveness",
      label: "Replies to messages",
      max: weights.responsiveness,
      fraction: s.responseRate === null ? 0 : s.responseRate >= 0.7 ? 1 : s.responseRate >= 0.4 ? 0.6 : 0.2,
      // Only rated once the candidate has actually received messages.
      applicable: s.responseRate !== null,
      tip: "Reply to the messages you receive from employers.",
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
  return [
    { key: "basics", label: "Personal details", max: 10, fraction: fieldShare(s.profile, PLAYER_BASIC_FIELDS), tip: describeMissing(s.profile, PLAYER_BASIC_FIELDS) },
    { key: "sporting", label: "Position and club", max: 6, fraction: fieldShare(s.profile, sporting), tip: describeMissing(s.profile, sporting) },
    {
      key: "contact",
      label: "Contact and social media",
      max: 6,
      fraction: fieldShare(s.profile, ["phoneNumber", "socialMedia"]),
      tip: describeMissing(s.profile, ["phoneNumber", "socialMedia"]) || "Add your phone number and social media.",
    },
    {
      key: "background",
      label: s.role === CandidateRole.HIGH_SCHOOL || s.role === CandidateRole.COLLEGE_UNIVERSITY ? "School details" : "Career details",
      max: 8,
      fraction: background ? fieldShare(s.profile, background) : 0,
      applicable: !!background,
      tip: background ? describeMissing(s.profile, background) : undefined,
    },
    { key: "history", label: "Club history", max: 5, fraction: s.experiences.length ? 1 : 0, tip: "Add the clubs you have played for." },
  ];
};

const playerVerification = (s: TQualitySnapshot): TItemSpec[] => [
  {
    key: "identity",
    label: "Identity verified",
    max: 10,
    fraction: s.identityStatus === "approved" ? 1 : s.identityStatus === "pending" ? 0.3 : 0,
    tip: s.identityStatus === "pending" ? "Your identity check is waiting for review." : "Request identity verification from your profile.",
  },
  {
    key: "history",
    label: "Club history verified",
    max: 10,
    fraction: approvedCount(s.experiences) >= 1 ? 1 : pendingCount(s.experiences) ? 0.2 : 0,
    tip: pendingCount(s.experiences) ? "Your club history document is waiting for review." : "Upload a document that confirms one of your clubs (contract or club page).",
  },
];

const playerMedia = (s: TQualitySnapshot): TItemSpec[] => [
  { key: "photo", label: "Profile photo", max: 5, fraction: s.profileImage ? 1 : 0, tip: "Add a clear profile photo." },
  {
    key: "highlights",
    label: "Highlight videos",
    max: 30,
    fraction: Math.min(s.videos.filter((v) => v.kind === VideoKind.HIGHLIGHTS).length, 2) / 2,
    tip: "Upload your two highlight videos.",
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
    return { key: spec.key, label: spec.label, earned, max, done, ...(done || !spec.tip ? {} : { tip: spec.tip }) };
  });
  const earned = Math.min(categoryMax, Math.round(items.reduce((sum, item) => sum + item.earned, 0)));
  return { key, label, earned, max: categoryMax, items };
};

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

  // Improvement actions: the items with the most points still to win come first.
  const tips = categories
    .flatMap((category) => category.items)
    .filter((item) => !item.done && item.tip)
    // Things the candidate can act on come first; "waiting for review" notes go last.
    .sort((a, b) => {
      const waiting = (i: { tip?: string }) => (i.tip ?? "").includes("waiting for review");
      if (waiting(a) !== waiting(b)) return waiting(a) ? 1 : -1;
      return b.max - b.earned - (a.max - a.earned);
    })
    .map((item) => item.tip as string)
    .slice(0, 5);

  return { score, level: band.level, stars: band.stars, categories, tips };
};
