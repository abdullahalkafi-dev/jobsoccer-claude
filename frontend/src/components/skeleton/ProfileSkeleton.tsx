"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfileSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 container mx-auto">
      {/* Banner and Profile Picture Skeleton */}
      <div className="relative mb-8 w-full">
        <Skeleton className="h-48 lg:h-64 w-full rounded-lg" />
        <div className="absolute -bottom-16 left-4 lg:left-8">
          <Skeleton className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white" />
        </div>
      </div>

      {/* Profile Info Skeleton */}
      <div className="mt-20 mb-8 px-4 w-full">
        <div className="mb-6">
          <Skeleton className="h-9 w-64 mb-2" />
          <div className="flex flex-wrap gap-4 mt-2 mb-4">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2 flex-wrap mt-4">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-10 w-52 rounded-full" />
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Profile Information Section Skeleton */}
      <div className="w-full p-4 md:p-6 border rounded-2xl shadow">
        <div className="bg-white rounded-lg border shadow border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Cards Skeleton */}
        <div className="my-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experience Section Skeleton */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20 rounded" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Licenses & Certifications Skeleton */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-20 rounded" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education Skeleton */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20 rounded" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Videos Skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20 rounded" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
