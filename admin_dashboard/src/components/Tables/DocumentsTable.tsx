"use client";

import { useState } from "react";
import { CheckCircle, ExternalLink, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { useGetPendingDocumentsQuery, useReviewDocumentMutation } from "@/redux/api/baseApi";

type RecordType = "experience" | "education" | "license";

interface PendingDocument {
  _id: string;
  type: RecordType;
  userId: string;
  documentUrl: string;
  updatedAt: string;
  // experience
  title?: string;
  club?: string;
  // education
  instituteName?: string;
  degree?: string;
  // licence
  name?: string;
  issuingOrganization?: string;
}

const TYPE_LABEL: Record<RecordType, string> = { experience: "Work history", education: "Education", license: "Licence / certification" };

const describe = (doc: PendingDocument): string =>
  doc.type === "experience"
    ? `${doc.title ?? "Role"} at ${doc.club ?? "club"}`
    : doc.type === "education"
    ? `${doc.degree ?? "Degree"}, ${doc.instituteName ?? "institute"}`
    : `${doc.name ?? "Licence"} (${doc.issuingOrganization ?? "issuer"})`;

const errorMessage = (error: unknown) => (error as { data?: { message?: string } })?.data?.message || "Something went wrong";

/** Documents candidates uploaded to back up their records. Approved ones earn Verification points. */
export function DocumentsTable() {
  const { data, isLoading } = useGetPendingDocumentsQuery(undefined);
  const [reviewDocument, { isLoading: isSaving }] = useReviewDocumentMutation();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const documents: PendingDocument[] = data?.data ?? [];

  const review = async (doc: PendingDocument, status: "approved" | "rejected") => {
    if (status === "rejected" && !notes[doc._id]?.trim()) return toast.error("Please write a short reason for the candidate");
    try {
      await reviewDocument({ type: doc.type, recordId: doc._id, status, note: notes[doc._id] }).unwrap();
      toast.success(status === "approved" ? "Document approved" : "Document rejected");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const fileUrl = (path: string) => (path.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${path}`);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-gray-600">
          Supporting documents candidates uploaded for their work history, education and licences. Approve what you can verify; the candidate is
          notified and the Profile Quality Score updates.
        </p>
      </div>

      <div className="rounded-lg border bg-white">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : documents.length === 0 ? (
          <p className="p-6 text-sm text-gray-600">No documents waiting for review.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Record</th>
                <th className="p-3">Type</th>
                <th className="p-3">Document</th>
                <th className="p-3">Sent</th>
                <th className="p-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((doc) => (
                <tr key={`${doc.type}-${doc._id}`}>
                  <td className="p-3 font-medium">{describe(doc)}</td>
                  <td className="p-3">{TYPE_LABEL[doc.type]}</td>
                  <td className="p-3">
                    <a href={fileUrl(doc.documentUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                      Open PDF <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="p-3">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        className="h-8 w-48"
                        placeholder="Reason (if rejecting)"
                        value={notes[doc._id] ?? ""}
                        onChange={(event) => setNotes((prev) => ({ ...prev, [doc._id]: event.target.value }))}
                      />
                      <Button size="sm" disabled={isSaving} onClick={() => review(doc, "approved")}>
                        <CheckCircle className="mr-1 h-3 w-3" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={isSaving} onClick={() => review(doc, "rejected")}>
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
