/**
 * Staff positions. The values are what is stored in the database and shown to
 * users, so they must match the client's final role names exactly.
 */
export enum OnFieldStaffPosition {
  HEAD_COACH = "Head Coach",
  ASSISTANT_COACH = "Assistant Coach",
  GOALKEEPER_COACH = "Goalkeeper Coach",
  MENTAL_COACH = "Mental Coach",
  VIDEO_ANALYST = "Video Analyst",
  ATTACKING_COACH = "Attacking Coach",
  DEFENSIVE_COACH = "Defensive Coach",
  TECHNICAL_DEVELOPMENT_COACH = "Technical Development Coach",
  SCOUT = "Scout",
  TECHNICAL_DIRECTOR = "Technical Director",
  ACADEMY_DIRECTOR = "Academy Director",
  DIRECTOR_OF_COACHING = "Director of Coaching",
}

export enum OfficeStaffPosition {
  ADMINISTRATIVE_DIRECTOR = "Administrative Director",
  COMMUNITY_MANAGER = "Community Manager",
  DATA_ANALYST = "Data Analyst",
  DIGITAL_MARKETING = "Digital Marketing",
  EVENT_MANAGER = "Event Manager",
  NUTRITIONIST = "Nutritionist",
  PR_COMMUNICATIONS_MANAGER = "PR & Communications Manager",
  TEAM_MANAGER = "Team Manager",
}
