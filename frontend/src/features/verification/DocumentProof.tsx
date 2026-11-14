"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Clock, FileUp, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

type TRecordType = "experience" | "education" | "license";

type TProofRecord = {
  _id: string;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  verificationNote?: string;
};

const MAX_MEGABYTES = 10;

/**
 * Proof for one record (work history, education, licence): the candidate uploads a PDF,
 * an admin approves it, and "Verified" then counts towards the Profile Quality Score.
 * Other people only ever see the green "Verified" mark.
 */
export function DocumentProof({ type, record, readOnly = false }: { type: TRecordType; record: TProofRecord; readOnly?: boolean }) {
  const t = useTranslations("forms");
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const status = record.verificationStatus ?? "none";

  if (status === "approved") {
    return (
      <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> {t("proof.verified")}
      </p>
    );
  }
  if (readOnly) return null;

  const upload = async (file: File | undefined) => {
    if (!file || !token) return;
    if (file.type !== "application/pdf") return void toast.error(t("proof.notPdf"));
    if (file.size > MAX_MEGABYTES * 1024 * 1024) return void toast.error(t("proof.tooLarge", { max: MAX_MEGABYTES }));

    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("doc", file);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/credential-verification/${type}/${record._id}/document`, {
        method: "POST",
        headers: { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` },
        body: form,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.message ?? t("proof.failed"));
      toast.success(t("proof.sent"));
      dispatch(baseApi.util.invalidateTags(["Candidate", "ProfileQuality", "User"]));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("proof.failed"));
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
      {status === "pending" && (
        <span className="inline-flex items-center gap-1 font-medium text-amber-700">
          <Clock className="h-3.5 w-3.5" /> {t("proof.waiting")}
        </span>
      )}
      {status === "rejected" && (
        <span className="inline-flex items-center gap-1 font-medium text-red-700">
          <XCircle className="h-3.5 w-3.5" /> {record.verificationNote ? t("proof.notApprovedWithNote", { note: record.verificationNote }) : t("proof.notApproved")}
        </span>
      )}
      {status !== "pending" && (
        <>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={isUploading} onClick={() => inputRef.current?.click()}>
            <FileUp className="mr-1 h-3 w-3" /> {isUploading ? t("proof.sending") : status === "rejected" ? t("proof.uploadNew") : t("proof.upload")}
          </Button>
        </>
      )}
    </div>
  );
}
