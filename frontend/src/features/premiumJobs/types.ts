/** What the job detail API tells a signed-in candidate about a premium job. */
export type TPremiumAccess = {
  /** Profile Quality Score needed to apply (90). */
  required: number;
  /** The candidate's own score (private to them). */
  score: number;
  canApply: boolean;
};
