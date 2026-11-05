import Link from "next/link";
import type { TPremiumAccess } from "./types";

/**
 * Explains a premium job next to the Apply button. Candidates below the threshold
 * can see the job but not apply; the message says how far they are and links to
 * the page where the improvement actions are.
 */
export function PremiumNotice({ access }: { access?: TPremiumAccess | null }) {
  if (access?.canApply) {
    return <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">This is a premium opportunity. Your Premium Qualified profile can apply.</p>;
  }
  return (
    <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
      <p className="font-semibold">Premium opportunity</p>
      {access ? (
        <p className="mt-1">
          Premium opportunities are open to candidates with a 5-star (Premium Qualified) Profile Quality. You need{" "}
          <strong>{Math.max(0, access.required - access.score)} more points</strong>.{" "}
          <Link href="/profile/candidate" className="font-medium underline">
            See how to improve your profile
          </Link>
        </p>
      ) : (
        <p className="mt-1">Everyone can view this job. To apply, you need a candidate profile with a 5-star (Premium Qualified) Profile Quality.</p>
      )}
    </div>
  );
}
