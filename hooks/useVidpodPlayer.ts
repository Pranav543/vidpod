"use client";

import { adSrcByIdFromCatalog } from "@/lib/ads";
import { resolveAdForMarker } from "@/lib/marker-config";
import { buildTimeline, type TimelineSegment } from "@/lib/playback";
import type { Ad, AdMarker } from "@/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useVidpodPlayer(
  markers: AdMarker[],
  episodeSrc: string,
  adsCatalog: Ad[]
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [episodeDuration, setEpisodeDuration] = useState(0);
  const [timelineTime, setTimelineTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const seekingRef = useRef(false);
  const suppressVideoEventsRef = useRef(false);
  const playingRef = useRef(false);
  const timelineTimeRef = useRef(0);
  const segmentsRef = useRef<TimelineSegment[]>([]);
  const episodeSrcRef = useRef(episodeSrc);
  const adsCatalogRef = useRef(adsCatalog);
  const markersRef = useRef(markers);

  useEffect(() => {
    episodeSrcRef.current = episodeSrc;
  }, [episodeSrc]);
  useEffect(() => {
    adsCatalogRef.current = adsCatalog;
  }, [adsCatalog]);
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  const { segments, totalDuration } = useMemo(
    () => buildTimeline(markers, episodeDuration || 1, adsCatalog),
    [markers, episodeDuration, adsCatalog]
  );

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    timelineTimeRef.current = timelineTime;
  }, [timelineTime]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const findSegmentAt = useCallback((t: number, segs = segmentsRef.current) => {
    for (const seg of segs) {
      if (t >= seg.timelineStart && t < seg.timelineEnd) return seg;
    }
    const last = segs[segs.length - 1];
    if (last && t >= last.timelineStart) return last;
    return null;
  }, []);

  const getEpisodeFilename = () => {
    const url = episodeSrcRef.current;
    try {
      return decodeURIComponent(url.split("/").pop() ?? "");
    } catch {
      return url.split("/").pop() ?? "";
    }
  };

  const isEpisodeVideo = useCallback((video: HTMLVideoElement) => {
    const fn = getEpisodeFilename();
    if (!fn) return false;
    return (
      video.src.includes(encodeURIComponent(fn)) ||
      video.src.endsWith(fn) ||
      video.src.includes(fn)
    );
  }, []);

  const setPlayingState = useCallback((next: boolean) => {
    playingRef.current = next;
    setPlaying(next);
  }, []);

  const playEpisode = useCallback(
    async (episodeTime: number, autoplay: boolean) => {
      const v = videoRef.current;
      if (!v || !episodeSrcRef.current) return;

      suppressVideoEventsRef.current = true;
      seekingRef.current = true;

      if (!isEpisodeVideo(v)) {
        v.src = episodeSrcRef.current;
        await new Promise<void>((res) => {
          const done = () => {
            v.removeEventListener("loadedmetadata", done);
            res();
          };
          v.addEventListener("loadedmetadata", done);
          v.load();
        });
      }

      v.currentTime = episodeTime;
      seekingRef.current = false;

      if (autoplay) {
        await v.play().catch(() => {});
      } else {
        v.pause();
      }

      suppressVideoEventsRef.current = false;
    },
    [isEpisodeVideo]
  );

  const playAd = useCallback(async (adId: string, autoplay: boolean) => {
    const v = videoRef.current;
    const src = adSrcByIdFromCatalog(adsCatalogRef.current, adId);
    if (!v || !src) return false;

    suppressVideoEventsRef.current = true;
    seekingRef.current = true;
    v.src = src;
    await new Promise<void>((res) => {
      const done = () => {
        v.removeEventListener("loadedmetadata", done);
        res();
      };
      v.addEventListener("loadedmetadata", done);
      v.load();
    });
    v.currentTime = 0;
    seekingRef.current = false;

    if (autoplay) {
      await v.play().catch(() => {});
    } else {
      v.pause();
    }

    suppressVideoEventsRef.current = false;
    return true;
  }, []);

  const goToTimeline = useCallback(
    async (t: number, autoplay: boolean) => {
      const clamped = Math.max(0, Math.min(t, totalDuration || t));
      const seg = findSegmentAt(clamped);
      if (!seg) return;

      setTimelineTime(clamped);
      timelineTimeRef.current = clamped;

      if (seg.type === "episode") {
        const epTime = seg.episodeStart + (clamped - seg.timelineStart);
        await playEpisode(epTime, autoplay);
        return;
      }

      const marker = markersRef.current.find((m) => m.id === seg.markerId);
      const adId =
        seg.adId ||
        (marker ? resolveAdForMarker(marker, { forPlayback: true }) : null);
      if (adId) await playAd(adId, autoplay);
    },
    [findSegmentAt, playAd, playEpisode, totalDuration]
  );

  const seek = useCallback(
    (t: number) => {
      void goToTimeline(t, playingRef.current);
    },
    [goToTimeline]
  );

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    if (playingRef.current) {
      suppressVideoEventsRef.current = true;
      v.pause();
      suppressVideoEventsRef.current = false;
      setPlayingState(false);
      return;
    }

    setPlayingState(true);
    void goToTimeline(timelineTimeRef.current, true);
  }, [goToTimeline, setPlayingState]);

  const skip = useCallback(
    (delta: number) => {
      seek(timelineTimeRef.current + delta);
    },
    [seek]
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => {
      if (suppressVideoEventsRef.current || seekingRef.current) return;
      setPlayingState(true);
    };

    const onPause = () => {
      if (suppressVideoEventsRef.current || seekingRef.current) return;
      setPlayingState(false);
    };

    const onLoaded = () => {
      if (isEpisodeVideo(v) && Number.isFinite(v.duration)) {
        setEpisodeDuration(v.duration);
      }
    };

    const onTimeUpdate = () => {
      if (seekingRef.current || suppressVideoEventsRef.current) return;

      const segs = segmentsRef.current;
      const t = timelineTimeRef.current;
      const seg = findSegmentAt(t, segs);
      if (!seg) return;

      if (seg.type === "episode" && isEpisodeVideo(v)) {
        const epOffset = v.currentTime - seg.episodeStart;
        const newT = seg.timelineStart + epOffset;
        if (Math.abs(newT - t) > 0.05) {
          setTimelineTime(newT);
          timelineTimeRef.current = newT;
        }

        const atMarker =
          epOffset >= seg.episodeEnd - seg.episodeStart - 0.2 ||
          newT >= seg.timelineEnd - 0.15;
        if (atMarker && playingRef.current) {
          const adSeg = segs.find(
            (s) =>
              s.type === "ad" &&
              Math.abs(s.timelineStart - seg.timelineEnd) < 0.05
          );
          if (adSeg) {
            void goToTimeline(adSeg.timelineStart, true);
          }
        }
        return;
      }

      if (seg.type === "ad" && !isEpisodeVideo(v)) {
        const newT = seg.timelineStart + v.currentTime;
        if (Math.abs(newT - t) > 0.02) {
          setTimelineTime(newT);
          timelineTimeRef.current = newT;
        }
      }
    };

    const onEnded = () => {
      if (!playingRef.current || seekingRef.current) return;

      const segs = segmentsRef.current;
      const t = timelineTimeRef.current;
      const seg = findSegmentAt(t, segs);
      if (!seg) return;

      if (seg.type === "ad") {
        const nextT = seg.timelineEnd;
        const next = findSegmentAt(nextT, segs);
        if (next) {
          void goToTimeline(nextT, true);
        } else {
          setPlayingState(false);
        }
        return;
      }

      if (seg.type === "episode") {
        const nextAd = segs.find(
          (s) =>
            s.type === "ad" &&
            Math.abs(s.timelineStart - seg.timelineEnd) < 0.05
        );
        if (nextAd) {
          void goToTimeline(nextAd.timelineStart, true);
        } else if (t >= (totalDuration || 0) - 0.25) {
          setPlayingState(false);
        }
      }
    };

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, [findSegmentAt, goToTimeline, isEpisodeVideo, setPlayingState, totalDuration]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !episodeSrc) return;

    suppressVideoEventsRef.current = true;
    seekingRef.current = true;
    v.pause();
    setPlayingState(false);
    setTimelineTime(0);
    timelineTimeRef.current = 0;
    v.src = episodeSrc;
    v.load();

    const onMeta = () => {
      if (Number.isFinite(v.duration)) setEpisodeDuration(v.duration);
      seekingRef.current = false;
      suppressVideoEventsRef.current = false;
      v.removeEventListener("loadedmetadata", onMeta);
    };
    v.addEventListener("loadedmetadata", onMeta);
  }, [episodeSrc, setPlayingState]);

  return {
    videoRef,
    episodeDuration,
    totalDuration,
    timelineTime,
    playing,
    segments,
    seek,
    togglePlay,
    skip,
  };
}
