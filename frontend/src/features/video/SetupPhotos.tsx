import Image from "next/image";
import { Check, X } from "lucide-react";

/**
 * The client's two example pictures for the interview recording:
 * the first is the correct set-up, the second (behind a table, framed from the
 * waist up) is the one to avoid.
 */
export function SetupPhotos() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="How to set yourself up for the video interview">
      <figure className="overflow-hidden rounded-lg border-2 border-green-500 bg-white">
        <Image src="/video-setup/correct.jpg" alt="Correct set-up: sitting on a sofa, shown from head to knees" width={640} height={427} className="h-auto w-full" />
        <figcaption className="flex items-start gap-2 p-3 text-sm text-gray-700">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <span>
            <strong className="text-green-700">Do this:</strong> sit on a chair or sofa (or stand), camera shows you from head to knees, hands in view.
          </span>
        </figcaption>
      </figure>
      <figure className="overflow-hidden rounded-lg border-2 border-red-400 bg-white">
        <Image src="/video-setup/not-this.jpg" alt="Not this: sitting behind a table, shown from the waist up" width={640} height={427} className="h-auto w-full" />
        <figcaption className="flex items-start gap-2 p-3 text-sm text-gray-700">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span>
            <strong className="text-red-700">Not this:</strong> behind a desk or table, cut off at the waist. Notes or screens could be hidden.
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
