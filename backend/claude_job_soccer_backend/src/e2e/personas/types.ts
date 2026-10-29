/**
 * Test data for the end-to-end flow. One file per role (see headCoach.ts):
 * the same four fake candidates at known quality levels, so the result can be
 * compared with what we expect. Add a role by adding one such file.
 */

export type PersonaKey = "bad" | "weak" | "good" | "best" | "incomplete";

export interface Expectation {
  /** Share of the maximum score (0-100) the AI total should reach. */
  minPct?: number;
  maxPct?: number;
  /** Questions the AI should report as "Not Answered". */
  minNotAnswered?: number;
  maxNotAnswered?: number;
  /** True when no band/level must be shown (client rule: only when every question is answered). */
  noBand?: boolean;
}

export interface Persona {
  key: PersonaKey;
  /** What this fake candidate stands for. */
  label: string;
  firstName: string;
  lastName: string;
  /** Profile fields on top of the required ones (richer profile = more fields filled). */
  profileExtras: Record<string, string>;
  /** What the candidate says per question (index 0 = question 1). null = skipped. */
  answers: (string | null)[];
  expect: Expectation;
}

export interface RoleScenario {
  /** CLI name: --role head_coach */
  roleKey: string;
  /** Platform role used at signup. */
  role: string;
  userType: "candidate";
  position: string;
  rubricId: string;
  questionCount: number;
  /** Required videos in upload order; the interview video (index 0) carries the answers. */
  videoTypes: string[];
  /** Required profile fields (same for every persona). */
  profileBase: Record<string, string>;
  personas: Persona[];
}

/** Whisper-style text: the candidate says the question number, then answers. */
export const buildTranscript = (answers: (string | null)[]): string =>
  answers
    .map((answer, i) => (answer === null ? null : `Question ${i + 1}. ${answer}`))
    .filter((part): part is string => part !== null)
    .join(" ");

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;
