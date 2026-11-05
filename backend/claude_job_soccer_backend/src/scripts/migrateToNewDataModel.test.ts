import { describe, expect, it } from "vitest";
import { VideoKind } from "../modules/video/video.constant";
import { migrateStaffVideos } from "./migrateToNewDataModel";

const now = new Date("2026-11-05T00:00:00Z");

describe("migrateStaffVideos", () => {
  const old = (videoType: string, url: string, uploadedAt = "2026-10-20T00:00:00Z") => ({ _id: url, videoType, url, duration: 200, title: videoType, description: "x", uploadedAt: new Date(uploadedAt) });

  it("keeps the interview and the first methodology video, drops the rest", () => {
    const { kept, dropped } = migrateStaffVideos(
      [old("Technical", "t.mp4"), old("Pre-recorded Interview", "i.mp4"), old("Tactical", "ta.mp4"), old("Game's Principals", "g.mp4")],
      now
    );
    expect(kept.map((v) => [v.kind, v.url])).toEqual([
      [VideoKind.METHODOLOGY, "t.mp4"],
      [VideoKind.INTERVIEW, "i.mp4"],
    ]);
    expect(dropped.map((v) => v.url)).toEqual(["ta.mp4", "g.mp4"]);
  });

  it("renames duration, drops the old description and keeps the id and url", () => {
    const { kept } = migrateStaffVideos([old("Pre-recorded Interview", "i.mp4")], now);
    expect(kept[0]).toMatchObject({ _id: "i.mp4", url: "i.mp4", durationSeconds: 200, kind: VideoKind.INTERVIEW });
    expect(kept[0]).not.toHaveProperty("duration");
    expect(kept[0]).not.toHaveProperty("description");
    expect(kept[0]).not.toHaveProperty("videoType");
  });

  it("locks a recent video for 3 months from its upload date and leaves old ones unlocked", () => {
    const { kept } = migrateStaffVideos([old("Pre-recorded Interview", "new.mp4", "2026-10-20T00:00:00Z"), old("Training Methodology", "old.mp4", "2026-01-01T00:00:00Z")], now);
    expect(kept[0].lockedUntil).toEqual(new Date("2027-01-20T00:00:00Z"));
    expect(kept[1].lockedUntil).toBeNull();
  });

  it("is a no-op for an already migrated list when called only on old videos", () => {
    expect(migrateStaffVideos([], now)).toEqual({ kept: [], dropped: [] });
  });
});
