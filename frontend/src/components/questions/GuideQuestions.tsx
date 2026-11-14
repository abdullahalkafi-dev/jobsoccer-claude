"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useGetInterviewQuestionsQuery } from "@/redux/features/aiEvaluation/aiEvaluationApi";

interface GuideQuestionsProps {
  position?: string;
  /** Show the list inside a box the candidate can fold and unfold (like the recording guide). */
  collapsible?: boolean;
  /** With `collapsible`: whether the box starts open. */
  defaultOpen?: boolean;
}

/**
 * Interview questions straight from the client's scoring guide, so candidates
 * answer exactly what the AI assesses. Shows nothing when the position has no guide.
 */
export function GuideQuestions({ position, collapsible = false, defaultOpen = true }: GuideQuestionsProps) {
  const t = useTranslations("quality");
  const { data: guide } = useGetInterviewQuestionsQuery(position ?? "", { skip: !position });
  if (!guide) return null;

  const title = t("guide.title", { name: guide.displayName, count: guide.questionCount });

  let offset = 0;
  const body = (
    <>
      <p className="text-sm text-gray-600 mb-4">
        {t("guide.intro")}
      </p>
      <div className="space-y-4">
        {guide.sections.map((section) => {
          const start = offset + 1;
          offset += section.questions.length;
          return (
            <div key={section.id} className="space-y-2">
              <h4 className="font-semibold text-gray-800 text-sm">{`${section.id}. ${section.name}`}</h4>
              <ol className="list-decimal list-inside space-y-1 ml-2" start={start}>
                {section.questions.map((question) => (
                  <li key={question.id} className="text-sm text-gray-700">
                    {question.text}
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </>
  );

  if (collapsible) {
    return (
      <details className="bg-blue-50 border border-blue-200 rounded-lg p-4" open={defaultOpen}>
        <summary className="cursor-pointer text-base font-semibold text-gray-900">{title}</summary>
        <div className="mt-4">{body}</div>
      </details>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {body}
    </div>
  );
}
