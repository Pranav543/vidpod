import type { AdPerformance } from "./marker-config";
import { buildTimeline, type TimelineSegment } from "./timeline-build";
import type { Ad, AdMarker } from "./types";

export type { TimelineSegment } from "./timeline-build";

export function timelineToEpisodeTime(
  t: number,
  segments: TimelineSegment[]
):
  | { kind: "episode"; episodeTime: number }
  | { kind: "ad"; segment: Extract<TimelineSegment, { type: "ad" }> }
  | null {
  if (segments.length === 0) return { kind: "episode", episodeTime: t };

  for (const seg of segments) {
    if (t >= seg.timelineStart && t < seg.timelineEnd) {
      if (seg.type === "episode") {
        return {
          kind: "episode",
          episodeTime: seg.episodeStart + (t - seg.timelineStart),
        };
      }
      return { kind: "ad", segment: seg };
    }
  }

  const last = segments[segments.length - 1];
  if (t >= last.timelineEnd) {
    if (last.type === "episode") return { kind: "episode", episodeTime: last.episodeEnd };
    const prev = segments[segments.length - 2];
    if (prev?.type === "episode") return { kind: "episode", episodeTime: prev.episodeEnd };
  }
  return null;
}

export function timelinePositionToEpisodeTime(
  t: number,
  segments: TimelineSegment[]
): number {
  const pos = timelineToEpisodeTime(t, segments);
  if (!pos) return 0;
  if (pos.kind === "episode") return pos.episodeTime;
  const adSeg = pos.segment;
  const idx = segments.indexOf(adSeg);
  if (idx > 0) {
    const prev = segments[idx - 1];
    if (prev.type === "episode") return prev.episodeEnd;
  }
  return 0;
}

export function timelinePositionToMarkerEpisodeTime(
  t: number,
  segments: TimelineSegment[],
  episodeDuration: number
): number {
  if (segments.length === 0) return Math.max(0, Math.min(t, episodeDuration));

  for (const seg of segments) {
    if (t >= seg.timelineStart && t < seg.timelineEnd) {
      if (seg.type === "episode") {
        return seg.episodeStart + (t - seg.timelineStart);
      }
      const idx = segments.indexOf(seg);
      const prev = segments[idx - 1];
      if (prev?.type === "episode") return prev.episodeEnd;
      return 0;
    }
  }

  const last = segments[segments.length - 1];
  if (last.type === "episode") return last.episodeEnd;
  const prev = segments[segments.length - 2];
  if (prev?.type === "episode") return prev.episodeEnd;
  return episodeDuration;
}

export function episodeMarkerToTimeline(
  markerStart: number,
  segments: TimelineSegment[]
): number {
  for (const seg of segments) {
    if (seg.type === "episode") {
      if (markerStart >= seg.episodeStart && markerStart <= seg.episodeEnd) {
        return seg.timelineStart + (markerStart - seg.episodeStart);
      }
      if (markerStart < seg.episodeStart) {
        return seg.timelineStart;
      }
    }
  }
  return markerStart;
}

export function buildTimelineExcludingMarker(
  markers: AdMarker[],
  excludeId: string,
  episodeDuration: number,
  catalog: Ad[] = [],
  performance: Record<string, AdPerformance> = {}
) {
  return buildTimeline(
    markers.filter((m) => m.id !== excludeId),
    episodeDuration,
    catalog,
    performance
  );
}

export function episodeSecondsPerPixel(
  episodeTime: number,
  segments: TimelineSegment[],
  episodeDuration: number,
  pixelsPerSecond: number
): number {
  if (pixelsPerSecond <= 0) return 1;
  const eps = 0.25;
  const t0 = episodeMarkerToTimeline(episodeTime, segments);
  const t1 = episodeMarkerToTimeline(
    Math.min(episodeTime + eps, episodeDuration),
    segments
  );
  const timelinePerEpisode = (t1 - t0) / eps;
  if (timelinePerEpisode <= 0) return 1 / pixelsPerSecond;
  return timelinePerEpisode / pixelsPerSecond;
}

export function episodeTimeFromPixelDelta(
  initialEpisodeTime: number,
  deltaPx: number,
  segments: TimelineSegment[],
  episodeDuration: number,
  pixelsPerSecond: number
): number {
  const secPerPx = episodeSecondsPerPixel(
    initialEpisodeTime,
    segments,
    episodeDuration,
    pixelsPerSecond
  );
  return initialEpisodeTime + deltaPx * secPerPx;
}

/** Inverse of episodeMarkerToTimeline for drag placement (segments exclude dragged marker). */
export function timelinePositionToEpisodeMarkerTime(
  timelineSec: number,
  segments: TimelineSegment[],
  episodeDuration: number
): number {
  if (segments.length === 0) {
    return Math.max(0, Math.min(timelineSec, episodeDuration));
  }

  const T = Math.max(0, timelineSec);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];

    if (T < seg.timelineStart) {
      if (seg.type === "episode") return seg.episodeStart;
      for (let j = i - 1; j >= 0; j--) {
        if (segments[j].type === "episode") return segments[j].episodeEnd;
      }
      return 0;
    }

    if (T >= seg.timelineStart && T < seg.timelineEnd) {
      if (seg.type === "episode") {
        return seg.episodeStart + (T - seg.timelineStart);
      }
      for (let j = i - 1; j >= 0; j--) {
        if (segments[j].type === "episode") return segments[j].episodeEnd;
      }
      return 0;
    }

    if (T === seg.timelineEnd && seg.type === "episode") {
      return seg.episodeEnd;
    }
  }

  for (let i = segments.length - 1; i >= 0; i--) {
    if (segments[i].type === "episode") return segments[i].episodeEnd;
  }
  return episodeDuration;
}

export function episodeMarkerTimeFromTrackPx(
  markerLeftPx: number,
  segments: TimelineSegment[],
  episodeDuration: number,
  pixelsPerSecond: number
): number {
  if (pixelsPerSecond <= 0) return 0;
  const timelineSec = Math.max(0, markerLeftPx / pixelsPerSecond);
  return timelinePositionToEpisodeMarkerTime(timelineSec, segments, episodeDuration);
}

export function getPlayheadLabels(
  timelineTime: number,
  episodeDuration: number,
  segments: TimelineSegment[]
): { episodeTime: number; timelineTime: number; inAd: boolean; adLabel?: string } {
  const pos = timelineToEpisodeTime(timelineTime, segments);
  if (pos?.kind === "ad") {
    const ep = timelinePositionToEpisodeTime(timelineTime, segments);
    return {
      episodeTime: ep,
      timelineTime,
      inAd: true,
      adLabel: pos.segment.adId,
    };
  }
  const episodeTime =
    pos?.kind === "episode"
      ? pos.episodeTime
      : timelinePositionToEpisodeTime(timelineTime, segments);
  return {
    episodeTime: Math.min(episodeTime, episodeDuration || episodeTime),
    timelineTime,
    inAd: false,
  };
}
