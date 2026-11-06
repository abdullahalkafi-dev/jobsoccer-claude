import { describe, expect, it } from "vitest";
import { editUpdate, hideVerificationDetails, needsVerificationReset, withoutServerOwnedFields } from "./credentialVerification.fields";

const record = {
  _id: "r1",
  club: "FC Test",
  verificationStatus: "approved",
  documentUrl: "docs/contract-private.pdf",
  verificationNote: "looks fine",
  verifiedBy: "admin-1",
};

describe("hideVerificationDetails", () => {
  it("keeps everything for the owner", () => {
    expect(hideVerificationDetails([record], "u1", { id: "u1" })[0]).toEqual(record);
  });

  it("keeps everything for an admin", () => {
    expect(hideVerificationDetails([record], "u1", { id: "admin-1", userType: "admin" })[0]).toEqual(record);
  });

  it("shows other people (and visitors) the status but never the document, reviewer or note", () => {
    for (const viewer of [{ id: "someone-else", userType: "employer" }, undefined]) {
      const visible = hideVerificationDetails([record], "u1", viewer)[0] as Record<string, unknown>;
      expect(visible.verificationStatus).toBe("approved");
      expect(visible.club).toBe("FC Test");
      expect(visible).not.toHaveProperty("documentUrl");
      expect(visible).not.toHaveProperty("verificationNote");
      expect(visible).not.toHaveProperty("verifiedBy");
    }
  });
});

describe("withoutServerOwnedFields", () => {
  it("drops verification and ownership fields a candidate tries to send", () => {
    const sent = { title: "Head Coach", verificationStatus: "approved", verifiedBy: "me", documentUrl: "x.pdf", userId: "someone-else", profileId: "p", _id: "i" };
    expect(withoutServerOwnedFields(sent)).toEqual({ title: "Head Coach" });
  });
});

describe("verification after an edit", () => {
  const approved = { club: "FC Test", title: "Coach", verificationStatus: "approved" };

  it("resets an approved record when its content changes", () => {
    expect(needsVerificationReset(approved, { club: "Other FC" })).toBe(true);
    const update = editUpdate(approved, { club: "Other FC" });
    expect(update.$set).toMatchObject({ club: "Other FC", verificationStatus: "none" });
    expect(update).toHaveProperty("$unset.documentUrl");
  });

  it("also resets a record that is waiting for review", () => {
    expect(needsVerificationReset({ ...approved, verificationStatus: "pending" }, { title: "Other" })).toBe(true);
  });

  it("keeps the approval when the edit changes nothing", () => {
    expect(needsVerificationReset(approved, { club: "FC Test", title: "Coach" })).toBe(false);
    expect(editUpdate(approved, { club: "FC Test" })).toEqual({ $set: { club: "FC Test" } });
  });

  it("does not touch records that were never verified", () => {
    expect(needsVerificationReset({ ...approved, verificationStatus: "none" }, { club: "Other FC" })).toBe(false);
    expect(needsVerificationReset({ club: "x" }, { club: "y" })).toBe(false);
  });
});
