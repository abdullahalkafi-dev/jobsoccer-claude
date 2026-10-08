"use client";

import { useGetUserCountsQuery } from "@/redux/api/baseApi";
import { Skeleton } from "@/components/ui/skeleton";
import UserStatsCard from "@/components/Cards/UserStatsCard";
import MonthlyIncomeChart from "@/components/Charts/MonthlyIncomeChart";

const OverviewPage = () => {
  const { data: userData, isLoading, error } = useGetUserCountsQuery({});

  if (isLoading) {
    return (
      <main className="h-full space-y-6 p-6">
        <h1 className="text-2xl font-bold">Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="h-full space-y-6 p-6">
        <h1 className="text-2xl font-bold">Overview</h1>
        <div className="text-red-500">
          Error loading statistics. Please try again later.
        </div>
      </main>
    );
  }

  return (
    <main className="h-full space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <UserStatsCard title="Total Users" user={userData?.data?.totalUsers} />
        <UserStatsCard title="Paid Users" user={userData?.data?.paidUsers} />
        <UserStatsCard title="Unpaid Users" user={userData?.data?.unpaidUsers} />
      </div>

      <MonthlyIncomeChart />
    </main>
  );
};

export default OverviewPage;
