"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Skeleton loader for Jobs List Item component
 * Matches the structure of JobItem for consistent loading experience
 */
export function JobsListSkeleton() {
  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-8 w-24 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of JobsList skeletons for loading states
 * @param count - Number of skeleton cards to render
 */
export function JobsListSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <JobsListSkeleton key={index} />
      ))}
    </div>
  );
}
