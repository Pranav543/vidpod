import { describe, expect, it } from "vitest";
import { adIdsForMode } from "./marker-config";

describe("adIdsForMode", () => {
  it("returns hardcoded pools", () => {
    expect(adIdsForMode("static")).toEqual(["ad-1"]);
    expect(adIdsForMode("auto")).toHaveLength(4);
    expect(adIdsForMode("ab")).toHaveLength(4);
  });
});
