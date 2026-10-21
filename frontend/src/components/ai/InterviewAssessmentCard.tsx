"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TAssessmentResponse } from "@/redux/features/aiEvaluation/aiEvaluationApi";

interface InterviewAssessmentCardProps {
  data?: TAssessmentResponse;
  isLoading?: boolean;
  /** Text shown to the profile owner when no assessment exists yet. */
  emptyText?: string;
}

const PENDING_TEXT: Record<string, string> = {
  queued: "Your interview assessment is waiting to start.",
  transcribing: "We are listening to your interview video.",
  evaluating: "Your answers are being assessed.",
  failed: "The assessment could not be completed. Our team has been notified.",
};

/**
 * The client's "Overall assessment" section: total score, percentage, level,
 * strongest areas, main weaknesses and the AI summary.
 */
export default function InterviewAssessmentCard({ data, isLoading, emptyText }: InterviewAssessmentCardProps) {
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview Assessment</h3>
          <p className="text-sm text-gray-600">{pending ? PENDING_TEXT[pending.status] ?? PENDING_TEXT.queued : emptyText}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Interview Assessment</h3>
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

        {pending && <p className="text-xs text-gray-500">{PENDING_TEXT[pending.status] ?? PENDING_TEXT.queued}</p>}
        {!!report.notAnsweredCount && (
          <p className="text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            {report.notAnsweredCount} question{report.notAnsweredCount > 1 ? "s were" : " was"} not answered in the
            interview, so no overall level is given.
          </p>
        )}
        {report.underReview && (
          <p className="text-sm text-gray-700 bg-gray-50 rounded-md px-3 py-2">This assessment is being checked by our team.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Strongest areas</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {report.strongestAreas?.map((area) => <li key={area}>{area}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Main weaknesses</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {report.mainWeaknesses?.map((area) => <li key={area}>{area}</li>)}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-1">Summary</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
        </div>

        {report.disclaimer && <p className="text-xs text-gray-500 border-t pt-3">{report.disclaimer}</p>}
      </CardContent>
    </Card>
  );
}
