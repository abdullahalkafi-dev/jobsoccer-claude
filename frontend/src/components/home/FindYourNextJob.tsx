import { Check } from "lucide-react";
import React from "react";
import { NewJobs } from "./NewJobs";

const FindYourNextJob = () => {
  const opportunities: string[] = [
    "Club Professional and Amateur — Discover verified players, coaching staff and performance insights to build your squad",
    "Agent — Manage your talent roster, track opportunities and expand your club network all in one place",
    "Professional Player and Amateur — Create your dynamic profile, get discovered by clubs and agents worldwide",
    "Staff — Showcase your expertise, browse openings and connect directly with clubs and agents looking for your skills",
    "College/University — Connect with elite coaches, scout emerging soccer talent and build your academic program",
  ];
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left Column - Opportunities */}
          <div className={`space-y-6 py-8 lg:col-span-2`}>
            <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-[#362F05] leading-tight">
              Find the Right Opportunity for You
            </h2>

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
          <div className="lg:col-span-3">
            <NewJobs />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindYourNextJob;
