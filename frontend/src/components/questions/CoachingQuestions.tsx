import React from "react";
import { FieldStaffPosition } from "@/constants/video.constant";
import {
  academyDirectorQuestions,
  assistantCoachQuestions,
  defensiveCoachQuestions,
  directorOfCoachingQuestions,
  gkCoachQuestions,
  headCoachQuestions,
  mentalCoachQuestions,
  offensiveCoachQuestions,
  scoutQuestions,
  technicalCoachQuestions,
  technicalDirectorQuestions,
  videoAnalystQuestions,
} from "@/constants/questions";

interface CoachingQuestionsProps {
  fieldStaffPosition:
    | FieldStaffPosition.HEAD_COACH
    | FieldStaffPosition.ASSISTANT_COACH
    | FieldStaffPosition.GK_COACH
    | FieldStaffPosition.MENTAL_COACH
    | FieldStaffPosition.VIDEO_ANALYST_COACH
    | FieldStaffPosition.SPECIFIC_DEFENSIVE_COACH
    | FieldStaffPosition.SPECIFIC_OFFENSIVE_COACH
    | FieldStaffPosition.SPECIFIC_TECHNICAL_COACH
    | FieldStaffPosition.SCOUT
    | FieldStaffPosition.TECHNICAL_DIRECTOR
    | FieldStaffPosition.DIRECTOR_OF_COACHING
    | FieldStaffPosition.ACADEMY_DIRECTOR;
}

export function CoachingQuestions({
  fieldStaffPosition,
}: CoachingQuestionsProps) {
  let questions;
  let title;

  switch (fieldStaffPosition) {
    case FieldStaffPosition.HEAD_COACH:
      questions = headCoachQuestions;
      title = "Head Coach – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.ASSISTANT_COACH:
      questions = assistantCoachQuestions;
      title = "Assistant Coach – Evaluation Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.GK_COACH:
      questions = gkCoachQuestions;
      title = "Goalkeeper Coach – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.MENTAL_COACH:
      questions = mentalCoachQuestions;
      title = "Mental Coach – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.VIDEO_ANALYST_COACH:
      questions = videoAnalystQuestions;
      title = "Video Analyst – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.SPECIFIC_DEFENSIVE_COACH:
      questions = defensiveCoachQuestions;
      title =
        "Defensive Specific Coach – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.SPECIFIC_OFFENSIVE_COACH:
      questions = offensiveCoachQuestions;
      title =
        "Attacking Specific Coach – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.SPECIFIC_TECHNICAL_COACH:
      questions = technicalCoachQuestions;
      title = "Technical Coach – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.SCOUT:
      questions = scoutQuestions;
      title = "Scout – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.TECHNICAL_DIRECTOR:
      questions = technicalDirectorQuestions;
      title = "Technical Director – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.DIRECTOR_OF_COACHING:
      questions = directorOfCoachingQuestions;
      title = "Director of Coaching – Interview Questionnaire (18 Questions)";
      break;
    case FieldStaffPosition.ACADEMY_DIRECTOR:
      questions = academyDirectorQuestions;
      title = "Academy Director – Interview Questionnaire (18 Questions)";
      break;
    default:
      questions = headCoachQuestions;
      title = "Interview Questionnaire (18 Questions)";
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        Please record videos answering the following questions and upload it in
        the sections below:
      </p>

      <div className="space-y-4">
        {questions.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            <h4 className="font-semibold text-gray-800 text-sm">
              {section.section}
            </h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              {section.questions.map((question, questionIndex) => (
                <li key={questionIndex} className="text-sm text-gray-700">
                  {question}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
