import { Clock, MapPin } from "lucide-react";
import { TNewJobPost } from "../home/NewJobs";
import Image from "next/image";
import employerLogo from "@/assets/employers/compony logo.png";
import Link from "next/link";

export function NewJobCard({ job }: { job: TNewJobPost }) {
  return (
    <Link href={`jobs/${job.id}`}>
      <div className="bg-linear-to-br from-white to-[#FDF9E3] rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 bg-white`}
          >
            <Image
              src={employerLogo}
              alt="Logo"
              className="object-contain rounded-xl"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg">
              {job.company}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>

        {/* Applicant avatars */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-4">
            {job.applicantImages.map((image, index: number) => (
              <div key={index} className="relative">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Applicant ${index + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              </div>
            ))}
            <div className="relative w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center text-white text-sm font-semibold">
              +
            </div>
          </div>
        </div>

        {/* Bottom section with applicant count, salary, and time */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-gray-600 text-sm">
              {job.applicantCount} Applicant
            </span>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="w-3 h-3" />
              <span>{job.postedTime}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{job.salary}</div>
            <div className="text-gray-500 text-sm">/mo</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
