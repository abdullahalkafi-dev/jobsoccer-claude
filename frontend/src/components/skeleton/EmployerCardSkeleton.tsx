"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for EmployerCard component
 * Matches the structure of EmployerCard for consistent loading experience
 */
export function EmployerCardSkeleton() {
  return (
    <div className="bg-linear-to-br from-white to-[#FDF9E3] rounded-xl p-4 shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-1">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>

        {/* Badges Skeleton */}
        <div className="flex gap-2 items-center flex-wrap">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-36" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-2 items-center">
        <Skeleton className="flex-1 h-10 rounded" />
        <Skeleton className="flex-1 h-10 rounded" />
      </div>
    </div>
  );
}

/**
 * Grid of EmployerCard skeletons for loading states
 * @param count - Number of skeleton cards to render
 * @param className - Optional className for grid container
 */
export function EmployerCardSkeletonGrid({
  count = 6,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <EmployerCardSkeleton key={index} />
      ))}
    </div>
  );
}
