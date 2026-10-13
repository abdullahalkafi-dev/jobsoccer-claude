import React from "react";
import { NewJobs } from "./NewJobs";

const FindYourNextJob = () => {
  return (
    <section className="bg-white py-10 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro Mission Statement from Image 2 */}
        <div className="max-w-4xl text-left mb-8 lg:mb-10">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 font-medium leading-relaxed">
            <span className="font-bold text-gray-900 tracking-tight">JOBSOCCER</span> is the recruitment platform built specifically for soccer. Using AI-powered matching, video analysis, and performance data, we help employers hire faster and more efficiently, while giving candidates worldwide the visibility and fair chance they deserve.
          </p>
        </div>

        {/* 3-Column New Jobs Section */}
        <NewJobs />
      </div>
    </section>
  );
};

export default FindYourNextJob;

