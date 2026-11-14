import { describe, expect, it } from "vitest";
import { interpretSetup, TSetupOutput } from "./frameCheck";

const good: TSetupOutput = {
  faceClearlyVisible: true,
  framedHeadToKnees: true,
  handsVisible: true,
  tableOrDeskInFront: false,
  notesScreenOrDeviceVisible: false,
  anotherPersonVisible: false,
  soundsReadFromScript: false,
  summary: "Seated on a sofa, framed to the knees.",
};

describe("interpretSetup", () => {
  it("raises no flag for a correct setup (sofa, head to knees, hands visible)", () => {
    expect(interpretSetup(good)).toEqual([]);
  });

  it("flags a table in front and waist-up framing (the client's 'not this' picture)", () => {
    const flags = interpretSetup({ ...good, tableOrDeskInFront: true, framedHeadToKnees: false });
    expect(flags).toContain("the candidate appears to sit behind a desk or table");
    expect(flags).toContain("the camera does not show the candidate from head to knees");
  });

  it("ignores the text-based script signal for translated transcripts (they always read like written prose)", () => {
    const translated = { isTranslated: true, spokenLanguage: "spanish" };
    expect(interpretSetup({ ...good, soundsReadFromScript: true }, translated)).toEqual([]);
    // visual signals still count
    const flags = interpretSetup({ ...good, soundsReadFromScript: true, notesScreenOrDeviceVisible: true }, translated);
    expect(flags).toHaveLength(1);
    expect(flags[0]).toMatch(/notes, a screen or a device/);
    // an English interview keeps the signal
    expect(interpretSetup({ ...good, soundsReadFromScript: true }, { isTranslated: false })).toHaveLength(1);
  });

  it("flags notes or devices and possible script reading", () => {
    const flags = interpretSetup({ ...good, notesScreenOrDeviceVisible: true, soundsReadFromScript: true });
    expect(flags).toHaveLength(2);
    expect(flags.join(" ")).toMatch(/notes, a screen or a device/);
    expect(flags.join(" ")).toMatch(/read from a script/);
  });
});
