"use client";

import { FormLayout } from "@/components/form/FormLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsentChecklist } from "./ConsentChecklist";
import { VideoSlotCard } from "./VideoSlotCard";
import { useGetVideoStatusQuery } from "./videoApi";

type TStep = { id: number; label: string; completed?: boolean; active?: boolean };

const Body = () => {
  const { data: status, isLoading, isError } = useGetVideoStatusQuery();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !status) return <p className="text-sm text-red-600">We could not load your video requirements. Please refresh the page.</p>;

  const consentOk =
    (!status.plan.consent.ai.required || !!status.consent.aiAt) && (!status.plan.consent.players.required || !!status.consent.playersAt);

  return (
    <div className="space-y-6">
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
  const { data: status } = useGetVideoStatusQuery();

  return (
    <FormLayout
      steps={steps}
      title="Upload your videos"
      subtitle="Employers watch these to get to know you. Your interview is scored by AI in the background, so you can keep using the website while it is checked."
      onNext={onFinish}
      onPrev={onBack}
      showPrev={!!onBack}
      nextLabel="Complete"
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
