import { describe, expect, it } from "vitest";
import {
  episodeSegmentAfterAd,
  isAdVideoFinished,
  segmentAtTimelineTime,
  timelineTimeDuringAd,
} from "./ad-playback";
import { buildTimeline } from "./timeline-build";
import type { Ad, AdMarker } from "./types";

const catalog: Ad[] = [
  { id: "ad-1", name: "A1", filename: "ads/sample-ad-1.mp4", duration: 15 },
];

const markers: AdMarker[] = [
  { id: "m1", startTime: 30, mode: "static", adIds: ["ad-1"] },
];

describe("ad-playback", () => {
  it("finds episode segment after ad", () => {
    const { segments } = buildTimeline(markers, 120, catalog);
    const adSeg = segments.find((s) => s.type === "ad")!;
    const resume = episodeSegmentAfterAd(adSeg, segments);
    expect(resume?.episodeStart).toBe(30);
    expect(resume?.timelineStart).toBe(45);
  });

  it("finishes when video reaches end", () => {
    expect(isAdVideoFinished(5.7, 5.76)).toBe(true);
    expect(isAdVideoFinished(2, 10)).toBe(false);
  });

  it("caps timeline position at ad block end", () => {
    const { segments } = buildTimeline(markers, 120, catalog);
    const adSeg = segments.find((s) => s.type === "ad")!;
    expect(timelineTimeDuringAd(adSeg, 99)).toBe(adSeg.timelineEnd);
  });
});

describe("segmentAtTimelineTime", () => {
  const catalog10: Ad[] = [
    { id: "ad-1", name: "A1", filename: "ads/sample-ad-1.mp4", duration: 10 },
  ];
  const { segments } = buildTimeline(markers, 120, catalog10);

  it("picks episode before the ad", () => {
    expect(segmentAtTimelineTime(10, segments)?.type).toBe("episode");
  });

  it("picks ad inside the ad block", () => {
    expect(segmentAtTimelineTime(35, segments)?.type).toBe("ad");
  });

  it("picks episode after the ad, not ad at boundary", () => {
    const seg = segmentAtTimelineTime(40, segments);
    expect(seg?.type).toBe("episode");
    if (seg?.type === "episode") {
      expect(seg.episodeStart).toBe(30);
    }
  });
});
