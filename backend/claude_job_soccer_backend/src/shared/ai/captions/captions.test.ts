import { describe, expect, it } from "vitest";
import { toWebVtt } from "./captions";

describe("toWebVtt", () => {
  it("writes a WebVTT header and numbered cues with timestamps", () => {
    const vtt = toWebVtt([
      { start: 0, end: 2.5, text: "Hello, I am a coach." },
      { start: 3661.25, end: 3665, text: "Second cue" },
    ]);
    expect(vtt.startsWith("WEBVTT\n\n")).toBe(true);
    expect(vtt).toContain("1\n00:00:00.000 --> 00:00:02.500\nHello, I am a coach.");
    expect(vtt).toContain("2\n01:01:01.250 --> 01:01:05.000\nSecond cue");
  });

  it("keeps cue text from breaking the file format", () => {
    const vtt = toWebVtt([{ start: 1, end: 2, text: "a --> b\n\nnew paragraph" }]);
    expect(vtt).not.toContain("a --> b");
    expect(vtt).not.toMatch(/\n\n\n/);
  });

  it("never ends a cue before it starts", () => {
    const vtt = toWebVtt([{ start: 5, end: 5, text: "x" }]);
    expect(vtt).toContain("00:00:05.000 --> 00:00:05.100");
  });
});
