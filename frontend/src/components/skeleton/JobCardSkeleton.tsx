"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for JobCard component
 * Matches the structure of JobCard for consistent loading experience
 */
export function JobCardSkeleton() {
  return (
    <div className="bg-linear-to-br from-white to-[#FDF9E3] rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-1">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="w-7 h-7 rounded" />
      </div>

      {/* Applicant Avatars Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-8 h-8 rounded-full" />
          ))}
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-1">
            <Skeleton className="w-3 h-3 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-7 w-20 ml-auto" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="border-t border-gray-200 pt-4 flex gap-4 items-center">
        <Skeleton className="flex-1 h-10 rounded" />
        <Skeleton className="flex-1 h-10 rounded" />
      </div>
    </div>
  );
}

/**
 * Grid of JobCard skeletons for loading states
 * @param count - Number of skeleton cards to render
 * @param className - Optional className for grid container
 */
export function JobCardSkeletonGrid({
  count = 6,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}
