"use client";

import React from "react";
import { useGetShortlistedCandidatesQuery } from "@/redux/features/candidateShortlist/candidateShortlistApi";
import CandidateCard from "@/components/cards/CandidateCard";
import { CardSkeletonGrid } from "@/components/skeleton/CardSkeleton";
import { Users, Bookmark } from "lucide-react";
import { ICandidate } from "@/types/user";
import { useTranslations } from "next-intl";

interface ShortlistData {
  _id: string;
  candidateId: ICandidate;
  candidateRole: string;
  shortlistedById: string;
  shortlistedByType: string;
  shortlistedByRole: string;
  createdAt: string;
  updatedAt: string;
}

interface ShortlistResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  data: ShortlistData[];
}

export default function ShortlistPage() {
  const t = useTranslations("employers.shortlist");
  const { data: shortlistData, isLoading } =
    useGetShortlistedCandidatesQuery(null);

  const typedData = shortlistData as ShortlistResponse | undefined;
  const shortlistedCandidates = (typedData?.data || []).filter(
    (s) => s.candidateId && s.candidateId.profile
  );
  const totalShortlisted = typedData?.meta?.total || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("title")}
          </h1>
        </div>
        <CardSkeletonGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" />
      </div>
    );
  }

  // Empty state
  if (!isLoading && shortlistedCandidates.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("title")}
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {t("emptyTitle")}
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            {t("emptyText")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("title")}
          </h1>
        </div>
        <div className="bg-yellow-100 px-4 py-2 rounded-full">
          <span className="text-sm font-semibold text-gray-700">
            {t("count", { count: totalShortlisted })}
          </span>
        </div>
      </div>

      {/* Shortlisted Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shortlistedCandidates.map((shortlist) => (
          <CandidateCard
            key={shortlist._id}
            candidate={shortlist.candidateId}
          />
        ))}
      </div>

      {/* Pagination info */}
      {typedData?.meta && typedData.meta.totalPage > 1 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          {t("pageOf", { page: typedData.meta.page, total: typedData.meta.totalPage })}
        </div>
      )}
    </div>
  );
}
