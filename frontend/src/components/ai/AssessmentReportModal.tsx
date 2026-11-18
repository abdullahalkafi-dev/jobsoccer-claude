"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Info, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { renderCaptionTracks, TVideoCaptions } from "@/features/video/captionTracks";
import { useGetVideoStatusQuery } from "@/features/video/videoApi";
import {
  TAssessmentReport,
  TReportQuestion,
  useGetCandidateAssessmentReportQuery,
  useGetMyAssessmentReportQuery,
} from "@/redux/features/aiEvaluation/aiEvaluationApi";

/** A profile video as the profile API returns it (only what the player needs). */
export type TReportVideo = TVideoCaptions & { _id: string; url: string; kind?: string };

type Filter = "all" | "notAnswered" | "toImprove" | "strong";

interface AssessmentReportModalProps {
  open: boolean;
  onClose: () => void;
  /** Whose report: leave empty for the signed-in candidate's own report. */
  candidateUserId?: string;
  /** The candidate's videos, to play an answer from its moment in the interview. */
  videos?: TReportVideo[];
}

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/** Every score has a word next to it; 2 ("Acceptable") is neutral, never red. */
const scoreStyle = (q: Pick<TReportQuestion, "status" | "score">) => {
  if (q.status === "not_answered" || q.score === null) return "bg-gray-100 text-gray-500";
  if (q.score >= 4) return "bg-emerald-100 text-emerald-800";
  if (q.score === 3) return "bg-sky-100 text-sky-800";
  if (q.score === 2) return "bg-slate-100 text-slate-700";
  if (q.score === 1) return "bg-amber-100 text-amber-800";
  return "bg-orange-100 text-orange-800";
};

const videoSrc = (url: string) => (url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_BASE_URL}/${url}`);

export default function AssessmentReportModal({ open, onClose, candidateUserId, videos = [] }: AssessmentReportModalProps) {
  const t = useTranslations("quality");
  const own = useGetMyAssessmentReportQuery(undefined, { skip: !open || !!candidateUserId });
  const other = useGetCandidateAssessmentReportQuery(candidateUserId ?? "", { skip: !open || !candidateUserId });
  const { data: report, isLoading } = candidateUserId ? other : own;
  // Own report without a video list: the candidate's own videos (same cached request the video step uses)
  const { data: myVideos } = useGetVideoStatusQuery(undefined, { skip: !open || !!candidateUserId || videos.length > 0 });
  const playable: TReportVideo[] = videos.length ? videos : myVideos?.videos ?? [];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="flex flex-col gap-0 p-0 overflow-hidden w-full max-w-full h-[100dvh] rounded-none sm:h-auto sm:max-h-[90vh] sm:max-w-4xl sm:rounded-lg">
        {isLoading || !report ? (
          <div className="p-6">
            <DialogTitle>{t("report.title")}</DialogTitle>
            <DialogDescription className="mt-2">{isLoading ? t("report.loading") : t("report.unavailable")}</DialogDescription>
          </div>
        ) : (
          <ReportBody report={report} videos={playable} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReportBody({ report, videos }: { report: TAssessmentReport; videos: TReportVideo[] }) {
  const t = useTranslations("quality");
  const [tab, setTab] = useState("overview");
  const [seekTo, setSeekTo] = useState<number | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const video = useMemo(
    () => videos.find((v) => v._id === report.interviewVideoId) ?? videos.find((v) => v.kind === "Interview"),
    [videos, report.interviewVideoId]
  );

  const playFrom = (seconds: number) => {
    setTab("questions");
    setShowPlayer(true);
    setSeekTo(seconds);
  };

  return (
    <>
      {/* Fixed header: the headline numbers stay visible while scrolling */}
      <div className="border-b px-4 py-4 sm:px-6 pr-12">
        <DialogTitle className="text-lg font-semibold text-gray-900">{t("report.title")}</DialogTitle>
        <DialogDescription className="text-sm text-gray-500">{report.displayName}</DialogDescription>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-bold text-gray-900">
            {report.totalScore}/{report.maxScore}
          </span>
          <span className="text-base font-medium text-gray-600">{report.percentage}%</span>
          {report.classification && <span className="text-sm font-medium text-blue-700">{report.classification}</span>}
          {report.answeredCount !== undefined && report.questionCount !== undefined && (
            <span className="text-sm text-gray-700">
              {t("assessment.answeredOf", { answered: report.answeredCount, total: report.questionCount })}
            </span>
          )}
          {report.underReview && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{t("assessment.underReview")}</span>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-4 pt-2 sm:px-6">
          <TabsList>
            <TabsTrigger value="overview">{t("report.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="questions">{t("report.tabs.questions")}</TabsTrigger>
          </TabsList>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <TabsContent value="overview" className="mt-0">
            <Overview report={report} />
          </TabsContent>
          <TabsContent value="questions" className="mt-0">
            {showPlayer && (
              <AnswerPlayer video={video} seekTo={seekTo} onSeekDone={() => setSeekTo(null)} onHide={() => setShowPlayer(false)} />
            )}
            <QuestionList report={report} canPlay={!!video} onPlay={playFrom} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}

function Overview({ report }: { report: TAssessmentReport }) {
  const t = useTranslations("quality");
  return (
    <div className="space-y-6">
      <section>
        <h4 className="mb-2 text-sm font-semibold text-gray-800">{t("report.bySection")}</h4>
        <ul className="space-y-2">
          {report.sections.map((s) => (
            <li key={s.id}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-gray-800">{s.name}</span>
                <span className="shrink-0 font-medium text-gray-900">
                  {s.earned}/{s.max}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-100" aria-hidden>
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${s.max ? Math.round((s.earned / s.max) * 100) : 0}%` }} />
              </div>
              {s.answeredCount < s.questionCount && (
                <p className="mt-0.5 text-xs text-amber-700">
                  {t("report.sectionAnswered", { answered: s.answeredCount, total: s.questionCount })}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {report.coaching && report.improvementTips.length > 0 && (
        <section className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("report.tipsTitle")}</h4>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-blue-900">
            {report.improvementTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-800">{t("assessment.strongest")}</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
            {report.strongestAreas?.map((area) => <li key={area}>{area}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-800">{t("assessment.weaknesses")}</h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
            {report.mainWeaknesses?.map((area) => <li key={area}>{area}</li>)}
          </ul>
        </div>
      </section>

      <section>
        <h4 className="mb-1 text-sm font-semibold text-gray-800">{t("assessment.summary")}</h4>
        <p className="text-sm leading-relaxed text-gray-700">{report.summary}</p>
      </section>

      <ScaleHelp />
      {report.disclaimer && <p className="border-t pt-3 text-xs text-gray-500">{report.disclaimer}</p>}
    </div>
  );
}

function ScaleHelp() {
  const t = useTranslations("quality");
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border p-3 text-sm">
      <button type="button" className="flex w-full items-center gap-2 text-left font-medium text-gray-800" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <Info className="size-4 shrink-0" />
        {t("report.scaleTitle")}
        <ChevronDown className={cn("ml-auto size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-2 space-y-2 text-gray-700">
          <p>{t("report.scaleHelp")}</p>
          <div className="flex flex-wrap gap-2">
            {[4, 3, 2, 1, 0].map((score) => (
              <span key={score} className={cn("rounded-full px-2 py-0.5 text-xs font-medium", scoreStyle({ status: "scored", score }))}>
                {score}/4 {t(`report.scale.${score}`)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionList({ report, canPlay, onPlay }: { report: TAssessmentReport; canPlay: boolean; onPlay: (seconds: number) => void }) {
  const t = useTranslations("quality");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const matches = (q: TReportQuestion) => {
    if (filter === "notAnswered") return q.status === "not_answered";
    if (filter === "toImprove") return q.status === "scored" && (q.score ?? 0) <= 2;
    if (filter === "strong") return q.status === "scored" && (q.score ?? 0) >= 3;
    return true;
  };
  const counts: Record<Filter, number> = {
    all: report.questions.length,
    notAnswered: report.questions.filter((q) => q.status === "not_answered").length,
    toImprove: report.questions.filter((q) => q.status === "scored" && (q.score ?? 0) <= 2).length,
    strong: report.questions.filter((q) => q.status === "scored" && (q.score ?? 0) >= 3).length,
  };
  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visible = report.questions.filter(matches);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "notAnswered", "toImprove", "strong"] as Filter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              filter === key ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            {t(`report.filters.${key}`)} ({counts[key]})
          </button>
        ))}
      </div>
      {report.isTranslated && <p className="text-xs text-gray-500">{t("report.translatedQuotes")}</p>}

      {visible.length === 0 && <p className="text-sm text-gray-500">{t("report.noneInFilter")}</p>}

      {report.sections.map((section) => {
        const inSection = visible.filter((q) => q.sectionId === section.id);
        if (!inSection.length) return null;
        return (
          <section key={section.id}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-800">{section.name}</h4>
              <span className="text-xs text-gray-500">
                {section.earned}/{section.max}
              </span>
            </div>
            <ul className="divide-y rounded-lg border">
              {inSection.map((q) => (
                <QuestionRow
                  key={q.id}
                  q={q}
                  coaching={report.coaching}
                  open={expanded.has(q.id)}
                  onToggle={() => toggle(q.id)}
                  canPlay={canPlay}
                  onPlay={onPlay}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function QuestionRow({
  q,
  coaching,
  open,
  onToggle,
  canPlay,
  onPlay,
}: {
  q: TReportQuestion;
  coaching: boolean;
  open: boolean;
  onToggle: () => void;
  canPlay: boolean;
  onPlay: (seconds: number) => void;
}) {
  const t = useTranslations("quality");
  const answered = q.status === "scored" && q.score !== null;
  return (
    <li className={cn("text-sm", !answered && "bg-gray-50")}>
      <div className="flex items-start gap-2 p-3">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-start gap-2 text-left" aria-expanded={open}>
          <span className="shrink-0 font-semibold text-gray-900">Q{q.id}</span>
          <span className={cn("min-w-0 flex-1 text-gray-800", !open && "line-clamp-1")}>{q.text}</span>
          <ChevronDown className={cn("mt-0.5 size-4 shrink-0 text-gray-500 transition-transform", open && "rotate-180")} />
        </button>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", scoreStyle(q))}>
          {answered ? `${q.score}/4 ${t(`report.scale.${q.score}`)}` : t("report.filters.notAnswered")}
        </span>
        {canPlay && q.startSec !== null && (
          <button
            type="button"
            onClick={() => onPlay(q.startSec!)}
            className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-blue-700 hover:bg-blue-50"
            aria-label={t("report.play", { time: clock(q.startSec) })}
            title={t("report.play", { time: clock(q.startSec) })}
          >
            <Play className="size-3" />
            {clock(q.startSec)}
          </button>
        )}
      </div>

      {open && (
        <div className="space-y-3 px-3 pb-3 pl-10">
          {!answered ? (
            <p className="text-gray-600">{t("report.notAnsweredRow")}</p>
          ) : (
            <>
              {q.evidence.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{coaching ? t("report.youSaid") : t("report.candidateSaid")}</p>
                  {q.evidence.map((quote) => (
                    <p key={quote} className="mt-1 border-l-2 border-gray-300 pl-2 italic text-gray-700">
                      “{quote}”
                    </p>
                  ))}
                </div>
              )}
              {q.rationale && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("report.why")}</p>
                  <p className="mt-1 text-gray-700">{q.rationale}</p>
                </div>
              )}
              {coaching && q.missing.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("report.higher")}</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-gray-700">
                    {q.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
}

/** Small player inside the report: jumps to the chosen answer in the interview video. */
function AnswerPlayer({
  video,
  seekTo,
  onSeekDone,
  onHide,
}: {
  video?: TReportVideo;
  seekTo: number | null;
  onSeekDone: () => void;
  onHide: () => void;
}) {
  const t = useTranslations("quality");
  const locale = useLocale();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || seekTo === null) return;
    const go = () => {
      element.currentTime = seekTo;
      element.play().catch(() => undefined);
      onSeekDone();
    };
    element.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (element.readyState >= 1) go();
    else element.addEventListener("loadedmetadata", go, { once: true });
    return () => element.removeEventListener("loadedmetadata", go);
  }, [seekTo, onSeekDone]);

  if (!video) return <p className="mb-4 text-sm text-gray-500">{t("report.videoMissing")}</p>;
  return (
    <div className="mb-4">
      <div className="aspect-video overflow-hidden rounded-lg bg-gray-900">
        <video
          ref={ref}
          src={videoSrc(video.url)}
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          className="h-full w-full object-contain"
        >
          {renderCaptionTracks(video, locale, (path) => videoSrc(path))}
        </video>
      </div>
      <button type="button" onClick={onHide} className="mt-1 text-xs text-gray-500 hover:underline">
        {t("report.hideVideo")}
      </button>
    </div>
  );
}
