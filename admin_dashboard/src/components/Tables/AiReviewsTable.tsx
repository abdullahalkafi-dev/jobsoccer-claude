"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Pagination } from "../Shared/Pagination";
import {
  useAddAiCorrectionMutation,
  useGetAiReviewQueueQuery,
  useGetCandidateAssessmentQuery,
  useRescoreCandidateMutation,
} from "@/redux/api/baseApi";

interface QueueItem {
  _id: string;
  candidateUserId: { _id: string; firstName: string; lastName: string; email: string } | null;
  position: string;
  report?: {
    displayName: string;
    totals: { earned: number; max: number; percentage: number; notAnsweredCount: number };
    reviewReasons: string[];
  };
  finishedAt?: string;
}

interface QuestionResult {
  questionId: number;
  sectionId: string;
  status: "scored" | "not_answered";
  score: number | null;
  modelScore: number | null;
  confidence: string;
  evidence: string[];
  missingEvidence: string[];
  redFlags: string[];
  rationale: string;
  adjustments: string[];
}

const errorMessage = (error: unknown) =>
  (error as { data?: { message?: string } })?.data?.message || "Something went wrong";

/** One candidate's full assessment with review tools. */
function AssessmentDetail({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data, isLoading } = useGetCandidateAssessmentQuery(userId);
  const [addCorrection, { isLoading: isSaving }] = useAddAiCorrectionMutation();
  const [rescore, { isLoading: isRescoring }] = useRescoreCandidateMutation();
  const [edits, setEdits] = useState<Record<number, { score: string; reason: string }>>({});
  const [showTranscript, setShowTranscript] = useState(false);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const doc = data?.data?.report;
  if (!doc) return <p className="text-sm text-gray-600">No completed assessment for this candidate.</p>;
  const reviewed = doc.reviewedReport ?? doc.report;
  const questions: QuestionResult[] = reviewed?.questions ?? [];

  const saveScore = async (questionId: number) => {
    const edit = edits[questionId];
    if (!edit?.reason || edit.reason.trim().length < 3) return toast.error("Please give a reason");
    try {
      await addCorrection({
        id: doc._id,
        body: {
          questionId,
          newScore: edit.score === "" ? null : Number(edit.score),
          reason: edit.reason.trim(),
        },
      }).unwrap();
      toast.success(`Question ${questionId} updated`);
      setEdits((prev) => ({ ...prev, [questionId]: { score: "", reason: "" } }));
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const markReviewed = async () => {
    try {
      await addCorrection({ id: doc._id, body: { reviewStatus: "reviewed", reason: "Checked by admin" } }).unwrap();
      toast.success("Marked as reviewed");
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const runRescore = async () => {
    try {
      await rescore(userId).unwrap();
      toast.success("New assessment queued");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{reviewed?.displayName}</h3>
          <p className="text-sm text-gray-600">
            {reviewed?.totals.earned}/{reviewed?.totals.max} ({reviewed?.totals.percentage}%)
            {reviewed?.totals.band ? ` - ${reviewed.totals.band}` : " - no level (questions not answered)"}
            {" · "}model {doc.aiModel} · rubric {doc.rubricId}@{doc.rubricVersion} · cost ${doc.costUsd ?? 0}
          </p>
          {reviewed?.reviewReasons?.length > 0 && (
            <p className="text-sm text-amber-700">Review: {reviewed.reviewReasons.join("; ")}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runRescore} disabled={isRescoring}>
            Re-score
          </Button>
          <Button onClick={markReviewed} disabled={isSaving}>
            Mark reviewed
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-700">{reviewed?.summary}</p>

      <div className="divide-y rounded-lg border">
        {questions.map((q) => (
          <div key={q.questionId} className="p-3 text-sm space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">
                Q{q.questionId} ({q.sectionId}) -{" "}
                {q.status === "not_answered" ? "Not answered" : `${q.score}/4`}
                {q.modelScore !== q.score && q.modelScore !== null ? ` (AI proposed ${q.modelScore})` : ""} ·
                confidence {q.confidence}
              </span>
              <div className="flex items-center gap-2">
                <select
                  className="rounded border px-2 py-1"
                  value={edits[q.questionId]?.score ?? ""}
                  onChange={(e) =>
                    setEdits((prev) => ({ ...prev, [q.questionId]: { reason: prev[q.questionId]?.reason ?? "", score: e.target.value } }))
                  }
                >
                  <option value="">Not answered</option>
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n}/4
                    </option>
                  ))}
                </select>
                <Input
                  className="h-8 w-56"
                  placeholder="Reason for change"
                  value={edits[q.questionId]?.reason ?? ""}
                  onChange={(e) =>
                    setEdits((prev) => ({ ...prev, [q.questionId]: { score: prev[q.questionId]?.score ?? "", reason: e.target.value } }))
                  }
                />
                <Button size="sm" variant="outline" onClick={() => saveScore(q.questionId)} disabled={isSaving}>
                  Save
                </Button>
              </div>
            </div>
            <p className="text-gray-700">{q.rationale}</p>
            {q.evidence.length > 0 && <p className="text-gray-500">Evidence: “{q.evidence.join("” · “")}”</p>}
            {q.missingEvidence.length > 0 && <p className="text-gray-500">Missing: {q.missingEvidence.join("; ")}</p>}
            {q.redFlags.length > 0 && <p className="text-red-600">Red flags: {q.redFlags.join("; ")}</p>}
            {q.adjustments.length > 0 && <p className="text-gray-400">Rules applied: {q.adjustments.join("; ")}</p>}
          </div>
        ))}
      </div>

      {doc.corrections?.length > 0 && (
        <div className="text-sm">
          <h4 className="font-medium mb-1">Review history</h4>
          <ul className="list-disc list-inside text-gray-600">
            {doc.corrections.map((c: { createdAt: string; questionId?: number; previousScore?: number; newScore?: number; reviewStatus?: string; reason: string }, i: number) => (
              <li key={i}>
                {new Date(c.createdAt).toLocaleString()}:{" "}
                {c.questionId ? `Q${c.questionId} ${c.previousScore ?? "-"} → ${c.newScore ?? "not answered"}` : c.reviewStatus}{" "}
                - {c.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Button variant="ghost" size="sm" onClick={() => setShowTranscript((v) => !v)}>
          {showTranscript ? "Hide transcript" : "Show transcript"}
        </Button>
        {showTranscript && (
          <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs">{doc.transcript}</pre>
        )}
      </div>
    </div>
  );
}

/** Assessments the AI flagged for a person to check (client rule: human review). */
export function AiReviewsTable() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { data, isLoading } = useGetAiReviewQueueQuery({ page, limit: 20 });
  const items: QueueItem[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Reviews</h1>
        <p className="text-sm text-gray-600">
          Interview assessments flagged for a person to check (red flags, low confidence, unclear audio or attempts
          to influence the AI). The AI never decides hiring on its own.
        </p>
      </div>

      {selectedUserId && (
        <div className="rounded-lg border bg-white p-4">
          <AssessmentDetail userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        </div>
      )}

      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-gray-600">Nothing to review.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Candidate</th>
                <th className="p-3">Position</th>
                <th className="p-3">Score</th>
                <th className="p-3">Why flagged</th>
                <th className="p-3">Date</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="p-3">
                    {item.candidateUserId ? `${item.candidateUserId.firstName} ${item.candidateUserId.lastName}` : "-"}
                    <div className="text-xs text-gray-500">{item.candidateUserId?.email}</div>
                  </td>
                  <td className="p-3">{item.report?.displayName ?? item.position}</td>
                  <td className="p-3">
                    {item.report ? `${item.report.totals.earned}/${item.report.totals.max} (${item.report.totals.percentage}%)` : "-"}
                  </td>
                  <td className="p-3 text-gray-600">{item.report?.reviewReasons.join("; ")}</td>
                  <td className="p-3">{item.finishedAt ? new Date(item.finishedAt).toLocaleDateString() : "-"}</td>
                  <td className="p-3">
                    {item.candidateUserId && (
                      <Button size="sm" variant="outline" onClick={() => setSelectedUserId(item.candidateUserId!._id)}>
                        Open
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.totalPage > 1 && (
        <Pagination currentPage={page} totalPages={meta.totalPage} onPageChange={setPage} />
      )}
    </div>
  );
}
