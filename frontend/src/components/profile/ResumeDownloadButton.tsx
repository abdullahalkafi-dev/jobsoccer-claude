"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetUserResumeQuery } from "@/redux/features/resume/resumeApi";

interface ResumeDownloadButtonProps {
  userId: string;
  /** The API needs a logged-in user, so nothing is requested without one. */
  enabled: boolean;
}

interface ResumeItem {
  _id: string;
  resumeUrl: string;
  isActive?: boolean;
}

/** "Resume" button on another person's profile. Shows only when they uploaded a resume. */
export default function ResumeDownloadButton({
  userId,
  enabled,
}: ResumeDownloadButtonProps) {
  const { data } = useGetUserResumeQuery(userId, { skip: !enabled || !userId });

  const resumes: ResumeItem[] = data?.data ?? [];
  const resume = resumes.find((r) => r.isActive) ?? resumes[0];
  if (!resume?.resumeUrl) return null;

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

  return (
    <Button variant="outline" asChild className="text-xs sm:text-sm">
      <a
        href={`${BASE_URL}${resume.resumeUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Download className="h-4 w-4" />
        Resume
      </a>
    </Button>
  );
}
