"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TAssessmentResponse } from "@/redux/features/aiEvaluation/aiEvaluationApi";
import AssessmentReportModal, { TReportVideo } from "./AssessmentReportModal";

interface InterviewAssessmentCardProps {
  data?: TAssessmentResponse;
  isLoading?: boolean;
  /** Text shown to the profile owner when no assessment exists yet. */
  emptyText?: string;
  /** Whose report the "View full report" window shows; empty = the signed-in candidate. */
  candidateUserId?: string;
  /** The candidate's videos, so an answer can be played from its moment in the interview. */
  videos?: TReportVideo[];
}

/**
 * "?report=1" in the address opens the full report: the phone's back button closes it,
 * and a link (e.g. from the "assessment ready" notification) can open it directly.
 */
const useReportInAddress = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const sync = () => setOpen(new URLSearchParams(window.location.search).get("report") === "1");
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const openReport = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("report", "1");
    window.history.pushState({ ...window.history.state, jobsoccerReport: true }, "", url);
    setOpen(true);
  }, []);
  const closeReport = useCallback(() => {
    if (window.history.state?.jobsoccerReport) {
      window.history.back(); // popstate closes it
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("report");
      window.history.replaceState(window.history.state, "", url);
    }
    setOpen(false);
  }, []);
  return { open, openReport, closeReport };
};

/**
 * Compact interview assessment on the profile: score, level, how many questions were answered and
 * the start of the summary. Everything else is in the "View full report" window.
 */
export default function InterviewAssessmentCard({ data, isLoading, emptyText, candidateUserId, videos }: InterviewAssessmentCardProps) {
  const t = useTranslations("quality");
  const { open, openReport, closeReport } = useReportInAddress();
  const pendingText = (status: string) => t(`assessment.pending.${["queued", "transcribing", "evaluating", "failed"].includes(status) ? status : "queued"}`);
  if (isLoading) {
    return <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />;
  }
  const report = data?.report;
  const pending = data?.pending;

  if (!report) {
    if (!pending && !emptyText) return null;
    return (
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("assessment.title")}</h3>
          <p className="text-sm text-gray-600">{pending ? pendingText(pending.status) : emptyText}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("assessment.title")}</h3>
            <p className="text-sm text-gray-500">{report.displayName}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {report.totalScore}/{report.maxScore}
              <span className="ml-2 text-base font-medium text-gray-600">{report.percentage}%</span>
            </p>
            {report.classification && <p className="text-sm font-medium text-blue-700">{report.classification}</p>}
          </div>
        </div>

        {pending && <p className="text-xs text-gray-500">{pendingText(pending.status)}</p>}
        {report.answeredCount !== undefined && report.questionCount !== undefined && (
          <p className="text-sm font-medium text-gray-800">
            {t("assessment.answeredOf", { answered: report.answeredCount, total: report.questionCount })}
          </p>
        )}
        {!!report.notAnsweredCount && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            {t("assessment.notAnswered", { count: report.notAnsweredCount })}
            {!!report.notAnsweredQuestionIds?.length && (
              <span className="block mt-1 font-medium">
                {t("assessment.notAnsweredList", { list: report.notAnsweredQuestionIds.join(", ") })}
              </span>
            )}
          </p>
        )}
        {report.underReview && (
          <p className="text-sm text-gray-700 bg-gray-50 rounded-md px-3 py-2">{t("assessment.underReview")}</p>
        )}

        {/* Client requirement: strongest areas, main weaknesses and the summary stay on the profile (kept short here). */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">{t("assessment.strongest")}</h4>
            <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-700">
              {report.strongestAreas?.slice(0, 3).map((area) => <li key={area}>{area}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">{t("assessment.weaknesses")}</h4>
            <ul className="list-disc list-inside space-y-0.5 text-sm text-gray-700">
              {report.mainWeaknesses?.slice(0, 3).map((area) => <li key={area}>{area}</li>)}
            </ul>
          </div>
        </div>

        {report.summary && <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{report.summary}</p>}
        {report.disclaimer && <p className="text-xs text-gray-500">{report.disclaimer}</p>}

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={openReport}>
            {t("report.viewFull")}
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      </CardContent>

      <AssessmentReportModal open={open} onClose={closeReport} candidateUserId={candidateUserId} videos={videos} />
    </Card>
  );
}
