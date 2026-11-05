"use client";

import { useState } from "react";
import { Gem, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Pagination } from "../Shared/Pagination";
import { useGetAdminJobsQuery, useSetJobPremiumMutation } from "@/redux/api/baseApi";

interface AdminJob {
  _id: string;
  jobTitle: string;
  jobCategory: string;
  location: string;
  country?: string;
  status: string;
  isPremium?: boolean;
  applicationCount: number;
  createdAt: string;
  creator?: { creatorId?: { firstName: string; lastName: string; email: string }; creatorRole?: string };
}

const errorMessage = (error: unknown) => (error as { data?: { message?: string } })?.data?.message || "Something went wrong";

/**
 * Every job with a Premium switch. Premium jobs stay visible to everyone, but only
 * candidates with a Profile Quality Score of 90+ (5 stars) can apply.
 */
export function JobsTable() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [premium, setPremium] = useState<"" | "true" | "false">("");
  const { data, isLoading } = useGetAdminJobsQuery({ page, limit: 20, searchTerm, premium });
  const [setJobPremium, { isLoading: isSaving }] = useSetJobPremiumMutation();
  const jobs: AdminJob[] = data?.data ?? [];
  const meta = data?.meta;

  const toggle = async (job: AdminJob) => {
    try {
      await setJobPremium({ id: job._id, isPremium: !job.isPremium }).unwrap();
      toast.success(job.isPremium ? "Job is no longer premium" : "Job marked as premium");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <p className="text-sm text-gray-600">
          Mark jobs as <strong>premium opportunities</strong>. Everyone can see them; only candidates with a Profile Quality Score of 90+ can apply.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search by job title"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={premium}
          onChange={(event) => {
            setPremium(event.target.value as "" | "true" | "false");
            setPage(1);
          }}
        >
          <option value="">All jobs</option>
          <option value="true">Premium only</option>
          <option value="false">Standard only</option>
        </select>
      </div>

      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : jobs.length === 0 ? (
          <p className="p-6 text-sm text-gray-600">No jobs found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Job</th>
                <th className="p-3">Employer</th>
                <th className="p-3">Status</th>
                <th className="p-3">Applicants</th>
                <th className="p-3">Posted</th>
                <th className="p-3">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td className="p-3">
                    <div className="font-medium">{job.jobTitle}</div>
                    <div className="text-xs text-gray-500">
                      {job.jobCategory} · {job.location}
                    </div>
                  </td>
                  <td className="p-3">
                    {job.creator?.creatorId ? `${job.creator.creatorId.firstName} ${job.creator.creatorId.lastName}` : "-"}
                    <div className="text-xs text-gray-500">{job.creator?.creatorRole}</div>
                  </td>
                  <td className="p-3 capitalize">{job.status}</td>
                  <td className="p-3">{job.applicationCount}</td>
                  <td className="p-3">{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!job.isPremium}
                      aria-label={`Premium: ${job.jobTitle}`}
                      disabled={isSaving}
                      onClick={() => toggle(job)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
                        job.isPremium ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <Gem className="h-3 w-3" /> {job.isPremium ? "Premium" : "Standard"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.totalPage > 1 && <Pagination currentPage={page} totalPages={meta.totalPage} onPageChange={setPage} />}
    </div>
  );
}
