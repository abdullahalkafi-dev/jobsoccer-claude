import { beforeEach, describe, expect, it, vi } from "vitest";

// A tiny in-memory stand-in for the CandidateResume model
type Doc = { _id: string; userId: string; isActive: boolean; createdAt: number; deleteOne: () => Promise<void>; save: () => Promise<void> };
const store: { docs: Doc[]; deleted: string[]; saved: string[] } = { docs: [], deleted: [], saved: [] };
const make = (id: string, userId: string, isActive: boolean, createdAt: number): Doc => ({
  _id: id,
  userId,
  isActive,
  createdAt,
  deleteOne: async () => {
    store.deleted.push(id);
    store.docs = store.docs.filter((d) => d._id !== id);
  },
  save: async () => {
    store.saved.push(id);
  },
});

vi.mock("./candidateResume.model", () => ({
  CandidateResume: {
    findOne: (query: { _id?: string; userId: string }) => {
      const matches = store.docs.filter((d) => d.userId === query.userId && (!query._id || d._id === query._id));
      const result = Promise.resolve(matches[0] ?? null) as Promise<Doc | null> & { sort: (s: unknown) => Promise<Doc | null> };
      // .sort({ createdAt: -1 }) -> the newest one
      result.sort = async () => [...matches].sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
      return result;
    },
  },
}));

import { CandidateResumeService } from "./candidateResume.service";

describe("removeResume", () => {
  beforeEach(() => {
    store.docs = [make("old", "u1", false, 1), make("current", "u1", true, 2), make("other-user", "u2", true, 3)];
    store.deleted = [];
    store.saved = [];
  });

  it("deletes with a document delete (so the Profile Quality Score is recalculated)", async () => {
    await CandidateResumeService.removeResume("old", "u1");
    expect(store.deleted).toEqual(["old"]);
  });

  it("makes the newest remaining resume current when the current one is deleted", async () => {
    await CandidateResumeService.removeResume("current", "u1");
    const old = store.docs.find((d) => d._id === "old")!;
    expect(old.isActive).toBe(true);
    expect(store.saved).toEqual(["old"]);
  });

  it("does not touch the current resume when another one is deleted", async () => {
    await CandidateResumeService.removeResume("old", "u1");
    expect(store.docs.find((d) => d._id === "current")!.isActive).toBe(true);
    expect(store.saved).toEqual([]);
  });

  it("cannot delete somebody else's resume", async () => {
    await expect(CandidateResumeService.removeResume("other-user", "u1")).rejects.toThrow("Resume not found");
    expect(store.deleted).toEqual([]);
  });
});
