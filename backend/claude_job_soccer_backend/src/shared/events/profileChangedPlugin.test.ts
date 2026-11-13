import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { userIdOf } from "./profileChangedPlugin";

describe("userIdOf", () => {
  const id = "6af71bda7d70b6002b44bcb8";

  it("reads a plain string id", () => {
    expect(userIdOf(id)).toBe(id);
  });

  it("reads an ObjectId", () => {
    expect(userIdOf(new Types.ObjectId(id))).toBe(id);
  });

  it("reads a populated user document (admin approval used .populate('userId'))", () => {
    expect(userIdOf({ _id: new Types.ObjectId(id), firstName: "Aud", email: "a@b.c" })).toBe(id);
  });

  it("returns null for nothing or something that is not an id", () => {
    expect(userIdOf(undefined)).toBeNull();
    expect(userIdOf(null)).toBeNull();
    expect(userIdOf("[object Object]")).toBeNull();
  });
});
