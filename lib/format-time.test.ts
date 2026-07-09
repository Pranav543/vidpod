import { describe, expect, it } from "vitest";
import { formatTimecode, parseTimecode } from "./format-time";

describe("parseTimecode", () => {
  it("parses HH:MM:SS", () => {
    expect(parseTimecode("01:02:03")).toBe(3723);
  });

  it("parses MM:SS", () => {
    expect(parseTimecode("05:30")).toBe(330);
  });

  it("parses raw seconds", () => {
    expect(parseTimecode("90")).toBe(90);
  });

  it("round-trips with formatTimecode", () => {
    expect(parseTimecode(formatTimecode(4523))).toBe(4523);
  });

  it("rejects invalid values", () => {
    expect(parseTimecode("")).toBeNull();
    expect(parseTimecode("abc")).toBeNull();
    expect(parseTimecode("01:99:00")).toBeNull();
  });
});
