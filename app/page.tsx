"use client";

import { Header } from "@/components/Header";
import { MarkerPanel } from "@/components/MarkerPanel";
import { Sidebar } from "@/components/Sidebar";
import { Timeline } from "@/components/Timeline";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useProbeDurations } from "@/hooks/useProbeDurations";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useVidpodPlayer } from "@/hooks/useVidpodPlayer";
import { adIdsForMode } from "@/lib/marker-config";
import {
  buildTimeline,
  episodeMarkerToTimeline,
  getPlayheadLabels,
} from "@/lib/playback";
import { syncMarkersToServer } from "@/lib/sync-markers";
import type { Ad, AdMarker, AdMode } from "@/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

const MODES: AdMode[] = ["static", "auto", "ab"];

export default function VidpodPage() {
  const {
    value: markers,
    set: setMarkers,
    undo: undoHistory,
    redo: redoHistory,
    canUndo,
    canRedo,
    reset: resetMarkers,
  } = useUndoRedo<AdMarker[]>([]);

  const markersRef = useRef(markers);
  markersRef.current = markers;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodeUrl, setEpisodeUrl] = useState<string | null>(null);
  const [episodeFilename, setEpisodeFilename] = useState("main-video.mp4");
  const [ads, setAds] = useState<Ad[]>([]);

  const loadedRef = useRef(false);
  const { catalog: adsCatalog } = useProbeDurations(ads, episodeUrl);
  const player = useVidpodPlayer(markers, episodeUrl ?? "", adsCatalog);

  const playhead = useMemo(
    () =>
      getPlayheadLabels(
        player.timelineTime,
        player.episodeDuration,
        player.segments
      ),
    [player.timelineTime, player.episodeDuration, player.segments]
  );

  const loadEpisode = useCallback(async () => {
    const res = await fetch("/api/episode");
    if (!res.ok) throw new Error("Failed to load episode");
    const data = await res.json();
    setEpisodeFilename(data.filename);
    setEpisodeUrl(data.url);
  }, []);

  const loadAds = useCallback(async () => {
    const res = await fetch("/api/ads");
    if (!res.ok) throw new Error("Failed to load ads");
    setAds(await res.json());
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    Promise.all([
      fetch("/api/markers").then((r) => {
        if (!r.ok) throw new Error("Failed to load markers");
        return r.json() as Promise<AdMarker[]>;
      }),
      loadEpisode(),
      loadAds(),
    ])
      .then(([markerData]) => {
        resetMarkers(markerData);
        if (markerData[0]) setSelectedId(markerData[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Load failed"))
      .finally(() => setLoading(false));
  }, [loadEpisode, loadAds, resetMarkers]);

  const persistMarker = useCallback(async (marker: AdMarker) => {
    const res = await fetch(`/api/markers/${marker.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startTime: marker.startTime,
        mode: marker.mode,
        adIds: marker.adIds,
      }),
    });
    if (!res.ok) throw new Error("Failed to save marker");
  }, []);

  const updateMarkers = useCallback(
    (updater: (prev: AdMarker[]) => AdMarker[], recordHistory = true) => {
      setMarkers((prev) => updater(prev), recordHistory);
    },
    [setMarkers]
  );

  const undo = useCallback(() => {
    flushSync(() => undoHistory());
    void syncMarkersToServer(markersRef.current);
  }, [undoHistory]);

  const redo = useCallback(() => {
    flushSync(() => redoHistory());
    void syncMarkersToServer(markersRef.current);
  }, [redoHistory]);

  const handleUploadEpisode = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/episode", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    setEpisodeFilename(data.filename);
    setEpisodeUrl(data.url);
  };

  const episodeTimeAtPlayhead = useCallback(() => {
    const { segments } = buildTimeline(
      markers,
      player.episodeDuration || 1,
      adsCatalog
    );
    for (const seg of segments) {
      if (
        seg.type === "episode" &&
        player.timelineTime >= seg.timelineStart &&
        player.timelineTime < seg.timelineEnd
      ) {
        return seg.episodeStart + (player.timelineTime - seg.timelineStart);
      }
    }
    return Math.min(player.timelineTime, player.episodeDuration || 0);
  }, [markers, player.episodeDuration, player.timelineTime, adsCatalog]);

  const createMarkerAt = async (startTime: number, mode: AdMode) => {
    const res = await fetch("/api/markers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime, mode, adIds: adIdsForMode(mode) }),
    });
    if (!res.ok) return;
    const created = (await res.json()) as AdMarker;
    const nextMarkers = [...markers, created].sort((a, b) => a.startTime - b.startTime);
    updateMarkers(() => nextMarkers);
    setSelectedId(created.id);
    const { segments } = buildTimeline(
      nextMarkers,
      player.episodeDuration || 1,
      adsCatalog
    );
    const tl = episodeMarkerToTimeline(created.startTime, segments);
    player.seek(tl);
  };

  const handleAddMarker = () => {
    void createMarkerAt(episodeTimeAtPlayhead(), "static");
  };

  const handleRandomMarker = () => {
    const dur = player.episodeDuration || 120;
    const startTime = Math.max(5, Math.random() * Math.max(dur - 15, 10));
    const mode = MODES[Math.floor(Math.random() * MODES.length)];
    void createMarkerAt(startTime, mode);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/markers/${id}`, { method: "DELETE" });
    updateMarkers((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSelectMarker = useCallback(
    (id: string) => {
      setSelectedId(id);
      const marker = markers.find((m) => m.id === id);
      if (!marker) return;
      const { segments } = buildTimeline(
        markers,
        player.episodeDuration || 1,
        adsCatalog
      );
      player.seek(episodeMarkerToTimeline(marker.startTime, segments));
    },
    [markers, player, adsCatalog]
  );

  const handleMarkerMove = async (id: string, startTime: number) => {
    let updated: AdMarker | undefined;
    updateMarkers((prev) => {
      const next = prev
        .map((m) => (m.id === id ? { ...m, startTime } : m))
        .sort((a, b) => a.startTime - b.startTime);
      updated = next.find((m) => m.id === id);
      return next;
    });
    if (updated) {
      await persistMarker(updated);
      const nextMarkers = markers
        .map((m) => (m.id === id ? { ...m, startTime } : m))
        .sort((a, b) => a.startTime - b.startTime);
      const { segments } = buildTimeline(
        nextMarkers,
        player.episodeDuration || 1,
        adsCatalog
      );
      player.seek(episodeMarkerToTimeline(startTime, segments));
    }
  };

  const handleModeChange = async (id: string, mode: AdMode) => {
    const adIds = adIdsForMode(mode);
    let updated: AdMarker | undefined;
    updateMarkers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, mode, adIds } : m));
      updated = next.find((m) => m.id === id);
      return next;
    });
    if (updated) await persistMarker(updated);
  };

  useKeyboardShortcuts({
    onSpace: player.togglePlay,
    onUndo: undo,
    onRedo: redo,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-red-600">
        <p>{error}</p>
        <button
          type="button"
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <Header />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          playing={player.playing}
          episodeFilename={episodeFilename}
          onTogglePlay={player.togglePlay}
          onUploadEpisode={handleUploadEpisode}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-4 p-6">
          <div className="flex min-h-0 flex-1 gap-4">
            <MarkerPanel
              adsCatalog={adsCatalog}
              markers={markers}
              selectedId={selectedId}
              onSelect={handleSelectMarker}
              onAdd={handleAddMarker}
              onRandomMarker={handleRandomMarker}
              onDelete={handleDelete}
              onModeChange={handleModeChange}
            />
            <VideoPlayer
              videoRef={player.videoRef}
              playing={player.playing}
              episodeTime={playhead.episodeTime}
              episodeDuration={player.episodeDuration}
              timelineTime={player.timelineTime}
              totalDuration={player.totalDuration}
              inAd={playhead.inAd}
              onTogglePlay={player.togglePlay}
              onSkip={player.skip}
              onSeek={player.seek}
            />
          </div>

          <Timeline
            markers={markers}
            adsCatalog={adsCatalog}
            episodeDuration={player.episodeDuration}
            timelineTime={player.timelineTime}
            selectedId={selectedId}
            pixelsPerSecond={pixelsPerSecond}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onZoom={setPixelsPerSecond}
            onSeek={player.seek}
            onSelect={setSelectedId}
            onMarkerMove={handleMarkerMove}
          />
        </main>
      </div>
    </div>
  );
}
