/**
 * Skeleton Components
 *
 * Centralized export file for all skeleton loaders.
 * Follow best practices for loading states:
 *
 * 1. Match the layout of actual components
 * 2. Use consistent animation (pulse)
 * 3. Maintain proper spacing and alignment
 * 4. Support responsive design
 * 5. Provide grid variants for multiple items
 *
 * Usage:
 * ```tsx
 * import { CandidateCardSkeleton, CandidateCardSkeletonGrid } from '@/components/skeleton';
 *
 * // Single skeleton
 * <CandidateCardSkeleton />
 *
 * // Multiple skeletons in grid
 * <CandidateCardSkeletonGrid count={6} />
 * ```
 */

export { CardSkeleton, CardSkeletonGrid } from "./CardSkeleton";
export {
  CandidateCardSkeleton,
  CandidateCardSkeletonGrid,
} from "./CandidateCardSkeleton";
export {
  EmployerCardSkeleton,
  EmployerCardSkeletonGrid,
} from "./EmployerCardSkeleton";
export { JobCardSkeleton, JobCardSkeletonGrid } from "./JobCardSkeleton";
export { JobsListSkeleton, JobsListSkeletonGrid } from "./JobsListSkeleton";
export { ProfileSkeleton } from "./ProfileSkeleton";

// Re-export base Skeleton component from shadcn/ui
export { Skeleton } from "@/components/ui/skeleton";
