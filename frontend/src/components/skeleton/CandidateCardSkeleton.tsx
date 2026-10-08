"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Skeleton loader for CandidateCard component
 * Matches the structure of CandidateCard for consistent loading experience
 */
export function CandidateCardSkeleton() {
  return (
    <Card className="bg-linear-to-br from-white to-[#FDF9E3] border-0 shadow-sm">
      <CardContent className="p-6">
        {/* Profile Header Skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Location Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3 w-40" />
        </div>

        {/* Nationality Skeleton */}
        <div className="mb-3">
          <Skeleton className="h-3 w-48" />
        </div>

        {/* View Profile Button Skeleton */}
        <div className="flex items-center gap-1 mb-3">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Watch Interview Button Skeleton */}
        <div className="flex items-center gap-1 mb-6">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3 w-28" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-full rounded" />
          <Skeleton className="h-8 w-full rounded" />
          <Skeleton className="h-9 w-full rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of CandidateCard skeletons for loading states
 * @param count - Number of skeleton cards to render
 * @param className - Optional className for grid container
 */
export function CandidateCardSkeletonGrid({
  count = 6,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <CandidateCardSkeleton key={index} />
      ))}
    </div>
  );
}
