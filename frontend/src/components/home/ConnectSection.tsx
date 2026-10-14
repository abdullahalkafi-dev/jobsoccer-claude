import React from "react";

export function ConnectSection() {
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section Heading */}
        <div className="max-w-4xl text-left mb-8 lg:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight leading-[1.15]">
            A whole world of soccer.
            <br />
            One place to connect.
          </h2>
        </div>

        {/* 3-Column Feature Cards Container */}
        <div className="rounded-2xl lg:rounded-3xl border border-gray-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Card 01 - Candidates */}
          <div className="bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-start">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-6 lg:mb-8">
              01 / CANDIDATES
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight mb-3">
              Get seen by the right clubs.
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Build a profile that showcases your experience, licenses, and
              coaching philosophy. Find roles in coaching, analysis,
              performance, and operations.
            </p>
          </div>

          {/* Card 02 - Employers */}
          <div className="bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-start">
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-6 lg:mb-8">
              02 / EMPLOYERS
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight mb-3">
              Build your staff with confidence.
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Post your openings and discover the talent that fits your needs,
              whether you&apos;re a club, academy, college, or agency.
            </p>
          </div>

          {/* Card 03 - Soccer Community */}
          <div className="bg-[#FAF7E8] p-6 sm:p-8 lg:p-10 flex flex-col justify-start">
            <span className="text-xs font-semibold tracking-wider text-[#635D2E] uppercase mb-6 lg:mb-8">
              03 / SOCCER COMMUNITY
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight mb-3">
              Stay connected to the game.
            </h3>
            <p className="text-[#4F4A24] text-sm sm:text-base leading-relaxed">
              Follow open roles, discover the people behind the game, and be
              part of a growing professional soccer network.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
