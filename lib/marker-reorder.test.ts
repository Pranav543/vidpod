import { describe, expect, it } from "vitest";
import {
  markersWithChangedTimes,
  reorderMarkersRedistributingTimes,
} from "./marker-reorder";
import type { AdMarker } from "./types";

const markers: AdMarker[] = [
  { id: "a", startTime: 10, mode: "static", adIds: ["ad-1"] },
  { id: "b", startTime: 30, mode: "auto", adIds: ["ad-2"] },
  { id: "c", startTime: 60, mode: "ab", adIds: ["ad-1", "ad-2"] },
];

describe("reorderMarkersRedistributingTimes", () => {
  it("moves first marker to last while preserving time slots", () => {
    const next = reorderMarkersRedistributingTimes(markers, 0, 2);
    expect(next.map((m) => m.id)).toEqual(["b", "c", "a"]);
    expect(next.map((m) => m.startTime)).toEqual([10, 30, 60]);
  });

  it("moves last marker to first while preserving time slots", () => {
    const next = reorderMarkersRedistributingTimes(markers, 2, 0);
    expect(next.map((m) => m.id)).toEqual(["c", "a", "b"]);
    expect(next.map((m) => m.startTime)).toEqual([10, 30, 60]);
  });

  it("no-ops when indices match", () => {
    const next = reorderMarkersRedistributingTimes(markers, 1, 1);
    expect(next.map((m) => m.id)).toEqual(["a", "b", "c"]);
  });
});

describe("markersWithChangedTimes", () => {
  it("returns markers whose startTime changed", () => {
    const after = reorderMarkersRedistributingTimes(markers, 0, 2);
    const changed = markersWithChangedTimes(markers, after);
    expect(changed.map((m) => m.id).sort()).toEqual(["a", "b", "c"]);
  });
});
