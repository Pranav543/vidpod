"use client";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  FastForward,
  Pause,
  Play,
  Rewind,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { RefObject } from "react";

type VideoPlayerProps = {
  episodeVideoRef: RefObject<HTMLVideoElement | null>;
  adVideoRef: RefObject<HTMLVideoElement | null>;
  showingAd: boolean;
  playing: boolean;
  episodeReady: boolean;
  episodeLoading?: boolean;
  inAd: boolean;
  onTogglePlay: () => void;
  onSkip: (delta: number) => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
};

export function VideoPlayer({
  episodeVideoRef,
  adVideoRef,
  showingAd,
  playing,
  episodeReady,
  episodeLoading = false,
  inAd,
  onTogglePlay,
  onSkip,
  onJumpToStart,
  onJumpToEnd,
}: VideoPlayerProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-[#f3f4f6]">
        <div className="absolute inset-2 overflow-hidden rounded-md bg-[#1f2937]">
          <video
            ref={episodeVideoRef}
            className={`absolute inset-0 h-full w-full object-cover ${
              showingAd ? "pointer-events-none opacity-0" : ""
            }`}
            muted={showingAd}
            playsInline
            preload="auto"
            loop={false}
            onClick={onTogglePlay}
          />
          <video
            ref={adVideoRef}
            className={`absolute inset-0 h-full w-full object-cover ${
              showingAd ? "" : "pointer-events-none opacity-0"
            }`}
            playsInline
            preload="auto"
            loop={false}
            onClick={onTogglePlay}
          />
          {(!episodeReady || episodeLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[13px] text-white">
              {episodeLoading ? "Loading video…" : "Upload a main video to get started"}
            </div>
          )}
          {inAd && episodeReady && (
            <span className="absolute left-3 top-3 rounded-md bg-[#ea580c]/90 px-2 py-0.5 text-[11px] font-medium text-white">
              Ad break
            </span>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#e5e7eb] bg-white/95 px-2 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <button
              type="button"
              onClick={onJumpToStart}
              disabled={!episodeReady}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
              aria-label="Jump to start"
            >
              <ArrowLeftToLine className="h-3.5 w-3.5" strokeWidth={1.75} />
              Jump to start
            </button>

            <span className="mx-0.5 h-5 w-px bg-[#e5e7eb]" />

            <button
              type="button"
              onClick={() => onSkip(-10)}
              disabled={!episodeReady}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
              aria-label="Back 10 seconds"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="text-[11px] font-semibold">10s</span>
            </button>
            <button
              type="button"
              onClick={() => onSkip(-30)}
              disabled={!episodeReady}
              className="rounded-full p-1.5 text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
              aria-label="Rewind"
            >
              <Rewind className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              disabled={!episodeReady}
              className="mx-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] bg-white shadow-sm hover:bg-[#f9fafb] disabled:opacity-40"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="h-4 w-4" fill="currentColor" />
              ) : (
                <Play className="h-4 w-4 pl-0.5" fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onSkip(30)}
              disabled={!episodeReady}
              className="rounded-full p-1.5 text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
              aria-label="Fast forward"
            >
              <FastForward className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => onSkip(10)}
              disabled={!episodeReady}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
              aria-label="Forward 10 seconds"
            >
              <span className="text-[11px] font-semibold">10s</span>
              <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>

            <span className="mx-0.5 h-5 w-px bg-[#e5e7eb]" />

            <button
              type="button"
              onClick={onJumpToEnd}
              disabled={!episodeReady}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
            >
              Jump to end
              <ArrowRightToLine className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
