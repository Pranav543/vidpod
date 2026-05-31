import { describe, expect, it } from "vitest";
import { pickBestAbAd, pickRandomAutoAd, resolveAdForMarker } from "./marker-config";
import { buildTimeline, timelinePositionToEpisodeTime } from "./playback";
import type { Ad, AdMarker } from "./types";

const catalog: Ad[] = [
  { id: "ad-1", name: "A1", filename: "sample-ad-1.mp4", duration: 10 },
  { id: "ad-2", name: "A2", filename: "sample-ad-2.mp4", duration: 12 },
  { id: "ad-3", name: "A3", filename: "sample-ad-3.mp4", duration: 8 },
  { id: "ad-4", name: "A4", filename: "sample-ad-4.mp4", duration: 15 },
];

describe("marker-config", () => {
  it("static uses first ad", () => {
    const m: AdMarker = { id: "1", startTime: 0, mode: "static", adIds: ["ad-1"] };
    expect(resolveAdForMarker(m)).toBe("ad-1");
  });

  it("ab picks highest CTR ad (ad-4)", () => {
    const m: AdMarker = {
      id: "1",
      startTime: 0,
      mode: "ab",
      adIds: ["ad-1", "ad-2", "ad-3", "ad-4"],
    };
    expect(pickBestAbAd(m.adIds)).toBe("ad-4");
    expect(resolveAdForMarker(m)).toBe("ad-4");
  });

  it("auto random respects pool", () => {
    const pool = ["ad-1", "ad-2"];
    expect(pool).toContain(pickRandomAutoAd(pool, () => 0));
    expect(pool).toContain(pickRandomAutoAd(pool, () => 0.99));
  });
});

describe("buildTimeline", () => {
  const markers: AdMarker[] = [
    { id: "m1", startTime: 30, mode: "static", adIds: ["ad-1"] },
    { id: "m2", startTime: 60, mode: "ab", adIds: ["ad-1", "ad-4"] },
  ];

  it("extends total duration with ad lengths", () => {
    const { totalDuration, segments } = buildTimeline(markers, 120, catalog);
    expect(totalDuration).toBe(30 + 10 + 30 + 15 + 60);
    expect(segments.filter((s) => s.type === "ad")).toHaveLength(2);
    const abSeg = segments.find((s) => s.type === "ad" && s.markerId === "m2");
    expect(abSeg?.type === "ad" && abSeg.adId).toBe("ad-4");
  });

  it("maps timeline position to episode time when dragging", () => {
    const { segments } = buildTimeline(markers, 120, catalog);
    const t = timelinePositionToEpisodeTime(45, segments);
    expect(t).toBeGreaterThanOrEqual(30);
    expect(t).toBeLessThanOrEqual(60);
  });
});
