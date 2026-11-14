import React from "react";
import { useTranslations } from "next-intl";
import { NewJobs } from "./NewJobs";

const FindYourNextJob = () => {
  const t = useTranslations("home");
  return (
    <section className="bg-white py-10 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro Mission Statement from Image 2 */}
        <div className="w-full text-left mb-8 lg:mb-10">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 font-medium leading-relaxed">
            <span className="font-bold text-gray-900 tracking-tight">Jobsoccer</span> <span className="text-gray-600 text-sm sm:text-base">{t("intro")}</span>
          </p>
        </div>

        {/* 3-Column New Jobs Section */}
        <NewJobs />
      </div>
    </section>
  );
};

export default FindYourNextJob;

