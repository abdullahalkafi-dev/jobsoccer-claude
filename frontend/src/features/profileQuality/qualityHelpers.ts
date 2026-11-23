import type { TProfileQuality, TQualityCategory, TQualityItem } from "./types";

/**
 * Display helpers for the Profile Quality card and the strength bar.
 * Nothing here changes the score: the points come from the server as they are.
 */

/** What the button next to a missing item does on the profile page. */
export type TQualityAction =
  | "editProfile"
  | "uploadCv"
  | "verifyIdentity"
  | "experience"
  | "education"
  | "certificates"
  | "videos"
  | "photo";

/** Section anchors on the candidate profile page (the page puts these ids on its sections). */
export const QUALITY_SECTION_IDS = {
  card: "profile-quality",
  experience: "section-experience",
  education: "section-education",
  certificates: "section-certificates",
  videos: "section-videos",
} as const;

/**
 * The action for one checklist item, or null when there is nothing the candidate can press
 * (reply to messages, or an admin review that is already under way).
 */
export function actionFor(category: TQualityCategory["key"], item: TQualityItem): TQualityAction | null {
  if (item.done || item.waiting) return null;
  switch (category) {
    case "completion":
      if (item.key === "cv") return "uploadCv";
      if (item.key === "experience" || item.key === "history") return "experience";
      if (item.key === "education") return "education";
      if (item.key === "licenses") return "certificates";
      return "editProfile"; // basics, sporting, contact, background
    case "verification":
      if (item.key === "identity") return "verifyIdentity";
      if (item.key === "credentials") return "certificates";
      if (item.key === "history") return "experience";
      return null;
    case "media":
      return item.key === "photo" ? "photo" : "videos";
    case "maintenance":
      return item.key === "responsiveness" ? null : "editProfile";
    default:
      return null;
  }
}

/** Splits `total` into whole numbers that follow `values` (largest remainders first), never above `caps`. */
function splitWhole(values: number[], total: number, caps: number[]): number[] {
  const floors = values.map((v, i) => Math.min(Math.floor(v + 1e-9), caps[i]));
  let left = Math.round(total) - floors.reduce((a, b) => a + b, 0);
  const order = values
    .map((v, i) => ({ i, frac: v - Math.floor(v + 1e-9) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  while (left > 0) {
    const open = order.filter(({ i }) => floors[i] < caps[i]);
    if (!open.length) break;
    for (const { i } of open) {
      if (left <= 0) break;
      floors[i] += 1;
      left -= 1;
    }
  }
  return floors;
}

/**
 * The category's items with whole-number points that still add up to the category's own numbers
 * (the server keeps one decimal, e.g. 9.1 / 5.7 for office staff, where licences do not apply).
 */
export function wholeNumberItems(category: TQualityCategory): TQualityItem[] {
  const maxes = splitWhole(
    category.items.map((i) => i.max),
    category.max,
    category.items.map(() => Number.MAX_SAFE_INTEGER)
  );
  // Finished items always show full/full; the rest share what is left
  const open = category.items.map((item, index) => ({ item, index })).filter(({ item }) => !item.done);
  const doneTotal = category.items.reduce((sum, item, i) => sum + (item.done ? maxes[i] : 0), 0);
  const shared = splitWhole(
    open.map(({ item }) => item.earned),
    Math.max(0, category.earned - doneTotal),
    open.map(({ index }) => maxes[index])
  );
  return category.items.map((item, index) => {
    const slot = open.findIndex((o) => o.index === index);
    return { ...item, max: maxes[index], earned: item.done ? maxes[index] : shared[slot] };
  });
}

export type TMissingItem = TQualityItem & { categoryKey: TQualityCategory["key"]; gain: number; action: TQualityAction | null };

/** Everything still to do, most points first; items that only wait for an admin come last. */
export function missingItems(quality: TProfileQuality): TMissingItem[] {
  return quality.categories
    .flatMap((category) =>
      wholeNumberItems(category)
        // "Counts once you receive messages" is only a note: the client found it confusing, so it is not listed
        .filter((item) => !item.done && item.tip && !(item.key === "responsiveness" && item.waiting))
        .map((item) => ({
          ...item,
          categoryKey: category.key,
          gain: Math.max(1, item.max - item.earned),
          action: actionFor(category.key, item),
        }))
    )
    .sort((a, b) => {
      if (!!a.waiting !== !!b.waiting) return a.waiting ? 1 : -1;
      return b.gain - a.gain;
    });
}

/** The one thing to do next (null when nothing is left). */
export function nextStep(quality: TProfileQuality): TMissingItem | null {
  // "Counts once you receive messages" is a note, not something the candidate can do now
  return missingItems(quality).find((item) => !(item.key === "responsiveness" && item.waiting)) ?? null;
}

/** The admin checks (identity, documents) that stand between the candidate and premium. */
export function adminChecks(quality: TProfileQuality): { key: string; label: string; state: "approved" | "inReview" | "notRequested" }[] {
  const verification = quality.categories.find((c) => c.key === "verification");
  return (verification?.items ?? []).map((item) => ({
    key: item.key,
    label: item.label,
    state: item.done ? "approved" : item.waiting ? "inReview" : "notRequested",
  }));
}
