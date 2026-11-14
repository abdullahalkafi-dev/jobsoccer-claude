import React from "react";
import { useTranslations } from "next-intl";

export function ConnectSection() {
  const t = useTranslations("home");
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section Heading */}
        <div className="max-w-4xl text-left mb-8 lg:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight leading-[1.15]">
            {t("connect.title1")}
            <br />
            {t("connect.title2")}
          </h2>
        </div>

        {/* 3-Column Feature Cards Container */}
        <div className="rounded-2xl lg:rounded-3xl border border-gray-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Card 01 - Candidates */}
          <div className="bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-start">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-6 lg:mb-8">
              {t("connect.card1Label")}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight mb-3">
              {t("connect.card1Title")}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {t("connect.card1Text")}
            </p>
          </div>

          {/* Card 02 - Employers */}
          <div className="bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-start">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-6 lg:mb-8">
              {t("connect.card2Label")}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight mb-3">
              {t("connect.card2Title")}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {t("connect.card2Text")}
            </p>
          </div>

          {/* Card 03 - Soccer Community */}
          <div className="bg-[#FAF7E8] p-6 sm:p-8 lg:p-10 flex flex-col justify-start">
            <span className="text-xs font-semibold tracking-wider text-[#635D2E] uppercase mb-6 lg:mb-8">
              {t("connect.card3Label")}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight mb-3">
              {t("connect.card3Title")}
            </h3>
            <p className="text-[#4F4A24] text-sm sm:text-base leading-relaxed">
              {t("connect.card3Text")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
