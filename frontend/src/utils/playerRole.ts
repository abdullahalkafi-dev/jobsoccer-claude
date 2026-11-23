/** The four player roles. Players have simpler forms than staff (no descriptions, a Diploma instead of a Degree, no contracts). */
const PLAYER_ROLES = ["Professional Player", "Amateur Player", "High School Player", "College/University Player"];

export const isPlayerRole = (role?: string | null): boolean => !!role && PLAYER_ROLES.includes(role);
