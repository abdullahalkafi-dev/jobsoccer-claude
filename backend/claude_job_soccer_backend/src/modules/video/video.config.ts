import { CandidateRole } from "../user/user.interface";
import { OfficeStaffPosition, OnFieldStaffPosition } from "../../shared/constant/position.constant";
import { VIDEO_CONSENT_VERSION, VIDEO_LIMITS, VideoKind } from "./video.constant";
import type { Lang } from "../../shared/i18n";
import { localizePlan } from "./video.i18n";

/**
 * What each candidate must upload, and what the screen tells them to record.
 *
 * Sources: the client's "Video Requirements" PDFs (interview, technical, consent,
 * lock, file name) and the per-role "Showcase your ..." texts from
 * "Jobsoccer Questions.docx". The frontend renders this object as it is, so the
 * wording exists in exactly one place.
 */

export type TGuideSection = { heading: string; items: string[] };

export type TVideoSlot = {
  kind: VideoKind;
  required: boolean;
  /** How many videos of this kind the profile holds (players: 2 highlights). */
  count: number;
  maxSeconds: number;
  /** Locked for 3 months after each submission. */
  locked: boolean;
  title: string;
  /** One-paragraph summary of what to record. */
  headline: string;
  sections: TGuideSection[];
  /** Setup photos shown next to the recording rules (interview only). */
  showSetupPhotos: boolean;
};

export type TVideoPlan = {
  role: CandidateRole;
  position: string | null;
  slots: TVideoSlot[];
  technical: TGuideSection;
  consent: {
    /** Needed before any staff video; the AI reads, transcribes and scores it. */
    ai: { required: boolean; text: string };
    /** Needed before a methodology video that may show players. */
    players: { required: boolean; text: string };
    version: string;
  };
  lockNotice: string;
  fileNameHint: string;
  limits: { maxMegabytes: number; minShortSide: number; formats: string[] };
};

/** What the candidate gets to see about a method/showcase video for one position. */
type TMethodologyGuide = { title: string; headline: string; details?: string };

const SHOWCASE =
  "Showcase your professional approach, working methods, and expertise through a video that helps employers understand how you apply your knowledge in real-world situations.";

const ON_FIELD_METHODOLOGY: Record<OnFieldStaffPosition, TMethodologyGuide> = {
  [OnFieldStaffPosition.HEAD_COACH]: {
    title: "Coaching Methodology Video",
    headline:
      "Showcase your coaching philosophy, playing style, and approach to team management. Demonstrate how you plan and organize training sessions, implement tactical strategies, and develop players to achieve individual and team objectives.",
  },
  [OnFieldStaffPosition.ASSISTANT_COACH]: {
    title: "Coaching Methodology Video",
    headline:
      "Showcase your approach to supporting the Head Coach during training sessions and matches. Demonstrate how you assist with organizing drills, providing player feedback, and contributing to individual and team development.",
  },
  [OnFieldStaffPosition.GOALKEEPER_COACH]: {
    title: "Goalkeeper Coaching Methodology Video",
    headline: SHOWCASE,
    details:
      "Show one goalkeeper session: the objective, the exercises, your coaching points, and how you link it to the team's game model and to match situations.",
  },
  [OnFieldStaffPosition.MENTAL_COACH]: {
    title: "Mental Coaching Methodology Video",
    headline: SHOWCASE,
    details:
      "Explain how you work with a player or team: how you identify needs, the tools you use, how you measure progress, and how you protect privacy and wellbeing. No real names or medical details.",
  },
  [OnFieldStaffPosition.VIDEO_ANALYST]: {
    title: "Video Analysis Methodology Video",
    headline: SHOWCASE,
    details:
      "Show a short example of your analysis: what you code and why, how you select clips, and how you present findings to coaches and players in a useful way.",
  },
  [OnFieldStaffPosition.ATTACKING_COACH]: {
    title: "Training Methodology Video",
    headline:
      "Demonstrate your coaching methods, practical exercises, and how you help players improve their performance.",
    details:
      "Show one specialist session for your area: the objective, the setup, your coaching points, how you adapt it to different players, and how it connects to the team's game model.",
  },
  [OnFieldStaffPosition.DEFENSIVE_COACH]: {
    title: "Training Methodology Video",
    headline:
      "Demonstrate your coaching methods, practical exercises, and how you help players improve their performance.",
    details:
      "Show one specialist session for your area: the objective, the setup, your coaching points, how you adapt it to different players, and how it connects to the team's game model.",
  },
  [OnFieldStaffPosition.TECHNICAL_DEVELOPMENT_COACH]: {
    title: "Training Methodology Video",
    headline:
      "Demonstrate your coaching methods, practical exercises, and how you help players improve their performance.",
    details:
      "Show one specialist session for your area: the objective, the setup, your coaching points, how you adapt it to different players, and how it connects to the team's game model.",
  },
  [OnFieldStaffPosition.SCOUT]: {
    title: "Scouting Methodology Video",
    headline:
      "Showcase your approach to identifying, observing, and evaluating players. Demonstrate your scouting criteria, analysis methods, and how you assess player potential and suitability for a club's playing philosophy and recruitment objectives.",
    details:
      "Explain your scouting process from start to finish: how you find players, what you assess, how many times you watch them, how you write a report, and how you make a recommendation. A sample report (without real names) is welcome.",
  },
  // One methodology video for the Technical Director, covering both topics from the client's text.
  [OnFieldStaffPosition.TECHNICAL_DIRECTOR]: {
    title: "Club Philosophy & Recruitment Methodology Video",
    headline:
      "Showcase your approach to defining and implementing a club's football philosophy, playing style, and technical methodology, and to identifying, evaluating, and recruiting players. Demonstrate how you align coaching staff, player development, recruitment, and team performance with the club's long-term vision.",
    details:
      "Present the club philosophy you would build or have built: playing identity, development pathway, and how coaches across all teams apply it. Then explain how you recruit players: identifying needs, the scouting process, criteria, decision-making with staff, and how you judge whether a signing worked.",
  },
  [OnFieldStaffPosition.ACADEMY_DIRECTOR]: {
    title: "Youth Development Methodology Video",
    headline:
      "Showcase your approach to structuring and managing youth development programs. Demonstrate your methodology for player progression, coach development, and building a consistent development pathway across all age groups.",
    details:
      "Present your youth development model: the age-group pathway, priorities at each stage, how you track progress, player welfare and safeguarding, and how players move up to the first team.",
  },
  [OnFieldStaffPosition.DIRECTOR_OF_COACHING]: {
    title: "Coaching Recruitment Methodology Video",
    headline:
      "Showcase your approach to identifying, evaluating, and recruiting coaches. Demonstrate your selection criteria, assessment methods, and how you ensure coaches align with the club's philosophy and development objectives.",
    details:
      "Explain how you recruit and develop coaches: the profile you look for, the selection process, how you check qualifications and safeguarding, and how you support and evaluate coaches once hired.",
  },
};

const OFFICE_METHODOLOGY: TMethodologyGuide = {
  title: "Professional Methodology Video",
  headline: SHOWCASE,
  details:
    "Show how you work in your role using one real example: a project, campaign, event or process. Explain the goal, the steps you took, the tools you used, and the result.",
};

const RECORDING_POSITION: TGuideSection = {
  heading: "Recording position",
  items: [
    "Sit on a chair or sofa, or stand, away from any desk, table, or computer screen.",
    "Place the camera far enough away to show you from head to at least the knees, with your face clearly visible and your hands in view.",
    "Look at the camera while answering.",
    "No notes, screens, or devices in front of you during the recording.",
    "Candidates who need an adjustment for accessibility reasons can contact JOBSOCCER support.",
  ],
};

const interviewSlot = (introLastLine: string): TVideoSlot => ({
  kind: VideoKind.INTERVIEW,
  required: true,
  count: 1,
  maxSeconds: VIDEO_LIMITS.staffMaxSeconds,
  locked: true,
  title: "Video Interview",
  headline:
    "This video allows employers to learn about you and understand your methodology before moving to the next stage of the recruitment process. Duration: up to 6:30 minutes in total.",
  showSetupPhotos: true,
  sections: [
    {
      heading: "Introduce yourself at the start",
      items: ["Full name", "Country", "Position applying for", introLastLine],
    },
    {
      heading: "Answer the interview questions",
      items: [
        "Answer the questions shown for your position, in the order they appear.",
        "You may skip a question. A skipped question is shown as 'Not Answered' and gets 0 points.",
        "All candidates for the same position answer the same questions, so every candidate is evaluated on equal terms.",
        "Answer in your own words. Reading directly from a script is not allowed.",
      ],
    },
    {
      heading: "Recording instructions",
      items: [
        "You may pause and record your answers separately, then combine all answers into one video before uploading.",
        "The questions must be clearly displayed in the video, in the order they appear.",
        "Your final video must be up to 6:30 minutes in total.",
      ],
    },
    RECORDING_POSITION,
  ],
});

const TECHNICAL: TGuideSection = {
  heading: "Technical requirements (all videos)",
  items: [
    "Record using a phone, tablet, or laptop. Landscape or portrait format accepted.",
    "Fixed camera only (no handheld or walking shots).",
    "Good lighting and clear sound. Use a mini microphone (wireless or clip-on) connected to your phone, so your voice is clear from a distance.",
    "Quiet location: avoid wind, noise, and music.",
    "Speak in one language only, matching the role or market. English subtitles are created automatically.",
    "Accepted formats: MP4 or MOV. Minimum quality: 720p. Maximum file size: 600 MB per video.",
  ],
};

const AI_CONSENT_TEXT =
  "Your video answers are transcribed, summarized, and scored by AI to help employers review them. Scores support, never replace, the employer's judgment. I give my consent.";

const PLAYERS_CONSENT_TEXT =
  "You must have permission from your club and from the players shown in your video to share the footage. For players under 18, permission must come from their parents or legal guardians. I confirm I have this permission.";

const LOCK_NOTICE =
  "Your Video Interview and Methodology Video are locked for 3 months after submission. After this period you may upload an updated version. Each new submission starts a new 3-month lock period.";

const staffMethodologySlot = (guide: TMethodologyGuide, required: boolean, office: boolean): TVideoSlot => ({
  kind: VideoKind.METHODOLOGY,
  required,
  count: 1,
  maxSeconds: VIDEO_LIMITS.staffMaxSeconds,
  locked: true,
  title: guide.title + (required ? "" : " (optional)"),
  headline: guide.headline,
  showSetupPhotos: false,
  sections: [
    ...(guide.details ? [{ heading: "What to show", items: [guide.details] }] : []),
    {
      heading: "Content requirements",
      items: office
        ? [
            "Explain your working methodology: how you organize your work, make decisions, and measure results in your role.",
            "Speak clearly so employers can follow your process and logic.",
            "Profiles that include this video stand out to employers.",
          ]
        : ["The footage must be clear enough to evaluate your methodology."],
    },
    {
      heading: "Not allowed",
      items: office
        ? [
            "Music overlays",
            "Highlight compilations, edits, or montages",
            "Voice-over added after recording",
            "Confidential information from a current or former employer (contracts, player data, internal documents)",
          ]
        : ["Music overlays", "Highlight montages or edited sequences", "Voice-over added after recording"],
    },
  ],
});

const highlightsSlot = (required: boolean): TVideoSlot => ({
  kind: VideoKind.HIGHLIGHTS,
  required,
  count: VIDEO_LIMITS.playerHighlightCount,
  maxSeconds: VIDEO_LIMITS.playerMaxSeconds,
  locked: false,
  title: "Highlights",
  headline: "Upload 2 highlight videos, up to 3 minutes each, that show you at your best.",
  showSetupPhotos: false,
  sections: [
    {
      heading: "Tips",
      items: [
        "Show real match or training footage where you can be seen clearly.",
        "Keep each video focused and under 3 minutes.",
        "Only show other players (especially under-18s) if you have their or their parents' permission.",
      ],
    },
  ],
});

const isPlayerRole = (role: CandidateRole): boolean =>
  [
    CandidateRole.PROFESSIONAL_PLAYER,
    CandidateRole.AMATEUR_PLAYER,
    CandidateRole.HIGH_SCHOOL,
    CandidateRole.COLLEGE_UNIVERSITY,
  ].includes(role);

/** High school and college players must upload their two highlights; the others may. */
const playersMustUpload = (role: CandidateRole): boolean =>
  role === CandidateRole.HIGH_SCHOOL || role === CandidateRole.COLLEGE_UNIVERSITY;

/**
 * The video plan for one candidate. Returns null for a staff role/position
 * that has no configuration (the caller answers 400 with a clear message).
 */
const buildPlan = (role: CandidateRole, position?: string | null): TVideoPlan | null => {
  const base = {
    role,
    position: position ?? null,
    technical: TECHNICAL,
    lockNotice: LOCK_NOTICE,
    limits: {
      maxMegabytes: VIDEO_LIMITS.maxBytes / 1024 / 1024,
      minShortSide: VIDEO_LIMITS.minShortSide,
      formats: ["MP4", "MOV"],
    },
  };

  if (isPlayerRole(role)) {
    return {
      ...base,
      slots: [highlightsSlot(playersMustUpload(role))],
      consent: {
        ai: { required: false, text: AI_CONSENT_TEXT },
        players: { required: false, text: PLAYERS_CONSENT_TEXT },
        version: VIDEO_CONSENT_VERSION,
      },
      fileNameHint: "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: John-Smith-Midfielder-2026-02-10)",
    };
  }

  if (role === CandidateRole.ON_FIELD_STAFF) {
    const guide = ON_FIELD_METHODOLOGY[position as OnFieldStaffPosition];
    if (!guide) return null;
    return {
      ...base,
      slots: [
        interviewSlot("Current club or coaching role (if applicable)"),
        staffMethodologySlot(guide, false, false),
      ],
      consent: {
        ai: { required: true, text: AI_CONSENT_TEXT },
        players: { required: true, text: PLAYERS_CONSENT_TEXT },
        version: VIDEO_CONSENT_VERSION,
      },
      fileNameHint: "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: John-Smith-U15HeadCoach-2026-02-10)",
    };
  }

  if (role === CandidateRole.OFFICE_STAFF) {
    if (!Object.values(OfficeStaffPosition).includes(position as OfficeStaffPosition)) return null;
    return {
      ...base,
      slots: [
        interviewSlot("Current role or organization (if applicable)"),
        staffMethodologySlot(OFFICE_METHODOLOGY, false, true),
      ],
      consent: {
        ai: { required: true, text: AI_CONSENT_TEXT },
        players: { required: false, text: PLAYERS_CONSENT_TEXT },
        version: VIDEO_CONSENT_VERSION,
      },
      fileNameHint: "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: Jane-Doe-OperationsManager-2026-10-15)",
    };
  }

  return null;
};

/** The plan in the user's language (en, es, fr); the structure is the same for everyone. */
export const getVideoPlan = (role: CandidateRole, position?: string | null, lang: Lang = "en"): TVideoPlan | null => {
  const plan = buildPlan(role, position);
  return plan ? localizePlan(plan, lang) : null;
};

/** The slot for one kind inside a plan, or undefined when the role does not use it. */
export const findSlot = (plan: TVideoPlan, kind: VideoKind): TVideoSlot | undefined =>
  plan.slots.find((slot) => slot.kind === kind);
