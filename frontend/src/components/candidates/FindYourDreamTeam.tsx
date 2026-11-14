import { Check } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { CardSkeleton } from "../skeleton/CardSkeleton";
import { useGetNewFourJobsQuery } from "@/redux/features/job/jobApi";
import { TJob } from "@/types/job";
import { JobCard } from "../cards/JobCard";
import { useTranslations } from "next-intl";

const FindYourDreamTeam = () => {
  const t = useTranslations("candidates.dreamTeam");
  const { data: jobsData, isLoading } = useGetNewFourJobsQuery(undefined);
  const jobs: TJob[] = jobsData?.data || [];

  const opportunities: string[] = [
    t("op1"),
    t("op2"),
    t("op3"),
    t("op4"),
    t("op5"),
  ];

  return (
    <div className="bg-white">
      <div className="py-8 lg:py-16">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-4xl font-bold text-[#362F05]">
            {t("title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 xl:gap-6 items-start">
          {/* Left Column - Opportunities */}
          <div className={`space-y-6 py-8 lg:col-span-3`}>
            <h3 className="text-xl md:text-xl lg:text-2xl font-bold text-[#362F05] leading-tight">
              {t("subtitle")}
            </h3>
            <div className="space-y-8 lg:space-y-14 text-[#504A20]">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="shrink-0 mt-1 bg-amber-50">
                    <Check className="w-5 h-5 text-[#504A20]" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Jobs */}
          <div className="bg-[#F7F6F2] rounded-3xl p-4 md:p-6 w-full lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {t("jobPostings")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))
              ) : jobs.length > 0 ? (
                jobs.map((job) => <JobCard key={job._id} job={job} />)
              ) : (
                <p className="col-span-full text-center text-gray-500">
                  {t("noJobs")}
                </p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button className="bg-yellow-300  hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3">
                <Link href="/employers">{t("seeAll")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindYourDreamTeam;
