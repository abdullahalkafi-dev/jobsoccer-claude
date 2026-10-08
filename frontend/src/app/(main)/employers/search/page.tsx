"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmployerSearch } from "@/components/search/EmploerSearch";
import { EmployerCard } from "@/components/cards/EmployerCard";
import { useGetEmployersQuery } from "@/redux/features/employer/employerApi";
import { IEmployer } from "@/types/user";
import { CardSkeleton } from "@/components/skeleton/CardSkeleton";
import { Building2 } from "lucide-react";

function EmployerSearchPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: employersData, isLoading } = useGetEmployersQuery(filters);

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
  }, [searchParams]);

  const employers = employersData?.data || [];
  const totalEmployers = employers.length;

  return (
    <div>
      {/* Search Section */}
      <div className="bg-[#F7F6F2]">
        <EmployerSearch />
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Results Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#5D4E37] shrink-0" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
              Search Results
            </h2>
          </div>
          {!isLoading && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-green-500">
                {totalEmployers}
              </span>{" "}
              {totalEmployers === 1 ? "employer" : "employers"} found
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(filters.searchTerm || filters.role || filters.country) && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Active Search:
            </p>
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <span className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full text-sm">
                  Search: <strong>{filters.searchTerm}</strong>
                </span>
              )}
              {filters.role && (
                <span className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full text-sm">
                  Role: <strong>{filters.role}</strong>
                </span>
              )}
              {filters.country && (
                <span className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full text-sm">
                  Location: <strong>{filters.country}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Employers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {isLoading ? (
            <>
              {Array.from({ length: 8 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </>
          ) : employers.length > 0 ? (
            employers.map((employer: IEmployer) => (
              <EmployerCard key={employer._id} employer={employer} />
            ))
          ) : (
            <div className="col-span-full py-12 sm:py-16">
              <div className="text-center">
                <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                  No employers found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria to find more employers
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Load More / Pagination (Optional - can be added later) */}
        {employers.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Showing all {totalEmployers}{" "}
              {totalEmployers === 1 ? "result" : "results"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployerSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployerSearchPageContent />
    </Suspense>
  );
}
