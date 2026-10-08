import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import employersImg from "@/assets/employers.svg";
import { IEmployer } from "@/types/user";
import { useGetEmployersQuery } from "@/redux/features/employer/employerApi";
import { EmployerCardSkeleton } from "../skeleton";
import { EmployerCard } from "../cards/EmployerCard";

const FindYourDreamTeam = () => {
  const { data: employersData, isLoading } = useGetEmployersQuery(null);

  return (
    <div className=" bg-white">
      <div className="py-8 lg:py-16">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-4xl font-bold text-[#362F05]">
            Find Your Next Opportunity
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 xl:gap-6 items-start">
          {/* Left Column - Image */}
          <div className="lg:col-span-3 h-full">
            <Image
              src={employersImg}
              alt="Employers"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          {/* Right Column - Employers */}
          <div className="bg-[#F7F6F2] rounded-3xl p-4 md:p-6 w-full lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Employers
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <EmployerCardSkeleton key={index} />
                  ))
                : employersData?.data
                    ?.slice(0, 4)
                    ?.map((employer: IEmployer) => (
                      <EmployerCard key={employer._id} employer={employer} />
                    ))}
            </div>

            <div className="flex justify-end">
              <Button className="bg-yellow-300  hover:scale-105 transition-transform duration-200 font-semibold px-6 py-3">
                <Link href="/employers">See All</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindYourDreamTeam;
