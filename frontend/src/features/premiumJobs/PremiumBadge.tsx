import { Gem } from "lucide-react";

/** Marks a premium opportunity (set by the JOBSOCCER team). Everyone can see it; only 5-star profiles can apply. */
export function PremiumBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ${className}`}
      title="Premium opportunity: candidates need a 5-star Profile Quality to apply"
    >
      <Gem className="h-3 w-3" /> Premium
    </span>
  );
}
