"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QualityStars } from "./QualityStars";
import { useGetMyProfileQualityQuery } from "./qualityApi";

/**
 * The candidate's own Profile Quality Score: stars + level, the points per
 * category (the client's table) and concrete actions to improve.
 * It measures how complete and verified the profile is, not ability.
 */
/** Same layout and height as the real card (score, table of 4 rows, premium line, tips), so nothing jumps. */
function ProfileQualitySkeleton() {
  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-[11.5rem] w-full rounded-lg" />
        <Skeleton className="h-5 w-72" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

export function ProfileQualityCard() {
  const { data, isLoading } = useGetMyProfileQualityQuery();
  if (isLoading) return <ProfileQualitySkeleton />;

  const quality = data?.quality;
  if (!quality) return null;
  const toPremium = Math.max(0, (data?.premiumMinScore ?? 90) - quality.score);

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profile Quality</h3>
            <QualityStars quality={quality} size="lg" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {quality.score}
            <span className="text-base font-medium text-gray-500">/100</span>
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2 text-right">Earned</th>
                <th className="px-3 py-2 text-right">Maximum</th>
              </tr>
            </thead>
            <tbody>
              {quality.categories.map((category) => (
                <tr key={category.key} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">{category.label}</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">{category.earned}</td>
                  <td className="px-3 py-2 text-right text-gray-500">{category.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {toPremium === 0 ? (
          <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            You are <strong>Premium Qualified</strong>: you can apply to premium opportunities.
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            <strong>{toPremium} more points</strong> unlock premium opportunities (5 stars).
          </p>
        )}

        {quality.tips.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">How to improve</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {quality.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-gray-500">
          This score shows how complete and verified your profile is. It is not a measure of your professional ability, and a high score does not guarantee a job.
        </p>
      </CardContent>
    </Card>
  );
}
