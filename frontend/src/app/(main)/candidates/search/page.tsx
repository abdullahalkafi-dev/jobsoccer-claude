"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CandidateSearch } from "@/components/search/CandidateSearch";
import CandidateCard from "@/components/cards/CandidateCard";
import { useGetCandidatesQuery } from "@/redux/features/candidate/candidateApi";
import { ICandidate } from "@/types/user";
import { CardSkeleton } from "@/components/skeleton/CardSkeleton";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useOptionLabel } from "@/i18n/options";

function CandidateSearchPageContent() {
  const t = useTranslations("candidates.search");
  const label = useOptionLabel();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [page, setPage] = useState(1);
  const { data: candidatesData, isLoading } = useGetCandidatesQuery({
    ...filters,
    page: String(page),
  });

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: Record<string, string> = {};

    const searchTerm = searchParams.get("searchTerm");
    const role = searchParams.get("role");
    const country = searchParams.get("country");

    if (searchTerm) urlFilters.searchTerm = searchTerm;
    if (role) urlFilters.role = role;
    if (country) urlFilters.country = country;

    setFilters(urlFilters);
    setPage(1);
  }, [searchParams]);

  const candidates = candidatesData?.data || [];
  const totalCandidates = candidatesData?.meta?.total ?? candidates.length;
  const totalPages = candidatesData?.meta?.totalPage ?? 1;

  return (
    <div>
      {/* Search Section */}
      <div className="bg-[#F7F6F2]">
        <CandidateSearch />
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Results Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
              {t("results")}
            </h2>
          </div>
          {!isLoading && (
            <div className="text-sm text-gray-600">
              {t.rich("found", {
                count: totalCandidates,
                green: (chunks) => (
                  <span className="font-semibold text-green-500">{chunks}</span>
                ),
              })}
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(filters.searchTerm || filters.role || filters.country) && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2 font-medium">
              {t("activeSearch")}
            </p>
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <span className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full text-sm">
                  {t.rich("searchFilter", {
                    value: filters.searchTerm,
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </span>
              )}
              {filters.role && (
                <span className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full text-sm">
                  {t.rich("roleFilter", {
                    value: label("role", filters.role),
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </span>
              )}
              {filters.country && (
                <span className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full text-sm">
                  {t.rich("locationFilter", {
                    value: label("country", filters.country),
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {isLoading ? (
            <>
              {Array.from({ length: 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </>
          ) : candidates.length > 0 ? (
            candidates.map((candidate: ICandidate) => (
              <CandidateCard key={candidate._id} candidate={candidate} />
            ))
          ) : (
            <div className="col-span-full py-12 sm:py-16">
              <div className="text-center">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                  {t("noneTitle")}
                </h3>
                <p className="text-gray-500">
                  {t("noneHint")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {candidates.length > 0 && (
          <div className="flex items-center justify-center gap-4 py-8">
            <button
              disabled={page <= 1}
              onClick={() => {
                setPage(page - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t("previous")}
            </button>
            <span className="text-sm text-gray-600">
              {t("pageOf", { page, total: totalPages })}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => {
                setPage(page + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateSearchPage() {
  const t = useTranslations("candidates.search");
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <CandidateSearchPageContent />
    </Suspense>
  );
}
