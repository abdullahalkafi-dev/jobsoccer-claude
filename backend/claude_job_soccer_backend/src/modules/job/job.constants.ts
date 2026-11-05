/**
 * Date Filter Options
 * Filters jobs based on when they were created
 */
export enum DateFilterEnum {
  LAST_WEEK = "Last Week",
  THIS_MONTH = "This Month",
  ANY_TIME = "Any Time",
}

export type DateFilter = "Last Week" | "This Month" | "Any Time";

/**
 * Helper function to get date range based on filter
 * Returns the start date for filtering (jobs created after this date)
 */
export const getDateFilterRange = (filter: DateFilter): Date | null => {
  const now = new Date();
  
  switch (filter) {
    case "Last Week":
      // Get date 7 days ago
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      return lastWeek;
      
    case "This Month":
      // Get first day of current month
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return thisMonth;
      
    case "Any Time":
      // No date filter
      return null;
      
    default:
      return null;
  }
};
