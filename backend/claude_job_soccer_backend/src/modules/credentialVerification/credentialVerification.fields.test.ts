import { describe, expect, it } from "vitest";
import { hideVerificationDetails } from "./credentialVerification.fields";

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
