"use client";

import React from "react";
import { useGetInterviewQuestionsQuery } from "@/redux/features/aiEvaluation/aiEvaluationApi";

interface GuideQuestionsProps {
  position?: string;
}

/**
 * Interview questions straight from the client's scoring guide, so candidates
 * answer exactly what the AI assesses. Shows nothing when the position has no guide.
 */
export function GuideQuestions({ position }: GuideQuestionsProps) {
  const { data: guide } = useGetInterviewQuestionsQuery(position ?? "", { skip: !position });
  if (!guide) return null;

  let offset = 0;
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {`${guide.displayName} – Interview Questionnaire (${guide.questionCount} Questions)`}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Please record videos answering the following questions and upload it in the sections below:
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
    </div>
  );
}
