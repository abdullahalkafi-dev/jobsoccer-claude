"use client";

import { useTranslations } from "next-intl";
import { useFormats } from "@/i18n/format";
import { FormLayout } from "@/components/form/FormLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsentChecklist } from "./ConsentChecklist";
import { VideoSlotCard } from "./VideoSlotCard";
import { useGetVideoStatusQuery } from "./videoApi";

type TStep = { id: number; label: string; completed?: boolean; active?: boolean };

const Body = () => {
  const t = useTranslations("video");
  const f = useFormats();
  const { data: status, isLoading, isError } = useGetVideoStatusQuery();

  // Roughly the height of the video cards, so the page below does not jump when they arrive
  if (isLoading) return <Skeleton className="h-[36rem] w-full" />;
  if (isError || !status) return <p className="text-sm text-red-600">{t("step.loadError")}</p>;

  const consentOk =
    (!status.plan.consent.ai.required || !!status.consent.aiAt) && (!status.plan.consent.players.required || !!status.consent.playersAt);

  return (
    <div className="space-y-6">
      {!status.isComplete && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          {t(status.missing.length > 1 ? "step.stillNeededMany" : "step.stillNeeded", { kinds: f.list(status.missing.map((kind) => t(`kind.${kind}`))) })}
        </p>
      )}
      <ConsentChecklist status={status} />
      {status.plan.slots.map((slot) => (
        <VideoSlotCard
          key={slot.kind}
          slot={slot}
          plan={status.plan}
          videos={status.videos.filter((video) => video.kind === slot.kind)}
          consentOk={consentOk}
        />
      ))}
      <p className="text-xs text-gray-500">{status.plan.lockNotice}</p>
    </div>
  );
};

/** Registration step: the candidate uploads the required videos one by one, then finishes. */
export function VideoUploadStep({ steps, onFinish, onBack }: { steps?: TStep[]; onFinish: () => void; onBack?: () => void }) {
  const t = useTranslations("video");
  const { data: status } = useGetVideoStatusQuery();
  const hasInterview = status?.plan.slots.some((slot) => slot.kind === "Interview");
  const subtitle = hasInterview ? t("step.subtitleInterview") : t("step.subtitle");

  return (
    <FormLayout
      steps={steps}
      title={t("step.title")}
      subtitle={subtitle}
      onNext={onFinish}
      onPrev={onBack}
      showPrev={!!onBack}
      nextLabel={t("step.complete")}
      isNextDisabled={!status?.isComplete}
    >
      <Body />
    </FormLayout>
  );
}

/** The same cards inside the candidate's profile page (to replace a video once the lock has ended). */
export function VideoManager() {
  return <Body />;
}
