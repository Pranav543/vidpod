"use client";

import {
  IconFastForward,
  IconJumpToEnd,
  IconJumpToStart,
  IconPause,
  IconPlay,
  IconRewind,
  IconSkip10Back,
  IconSkip10Forward,
} from "./icons";
import { type ReactNode, RefObject } from "react";

type VideoPlayerProps = {
  episodeVideoRef: RefObject<HTMLVideoElement | null>;
  adVideoRef: RefObject<HTMLVideoElement | null>;
  episodeSrc?: string;
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

const LABEL = "text-[13px] font-normal leading-none text-[#666666]";
const ICON_DARK = "text-[#1a1a1a]";
const ICON_MUTED = "text-[#666666]";

function CircleJumpButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#e0e0e0] bg-white ${ICON_DARK} transition hover:bg-[#fafafa] disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function VideoControls({
  disabled,
  playing,
  onJumpToStart,
  onJumpToEnd,
  onSkip,
  onTogglePlay,
}: {
  disabled: boolean;
  playing: boolean;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  onSkip: (delta: number) => void;
  onTogglePlay: () => void;
}) {
  return (
    <div className="mt-4 flex h-12 w-full shrink-0 items-center justify-between rounded-full border border-[#e0e0e0] bg-white px-6">
      <div className="flex shrink-0 items-center gap-2">
        <CircleJumpButton
          onClick={onJumpToStart}
          disabled={disabled}
          label="Jump to start"
        >
          <IconJumpToStart size={13} solid />
        </CircleJumpButton>
        <span className={`${LABEL} whitespace-nowrap`}>Jump to start</span>
      </div>

      <button
        type="button"
        onClick={() => onSkip(-10)}
        disabled={disabled}
        className={`flex shrink-0 items-center gap-1.5 transition hover:opacity-70 disabled:opacity-40 ${ICON_MUTED}`}
        aria-label="Back 10 seconds"
      >
        <IconSkip10Back size={18} solid />
        <span className={LABEL}>10s</span>
      </button>

      <div className="flex shrink-0 items-center gap-6">
        <button
          type="button"
          onClick={() => onSkip(-30)}
          disabled={disabled}
          className={`flex items-center justify-center transition hover:opacity-70 disabled:opacity-40 ${ICON_DARK}`}
          aria-label="Rewind"
        >
          <IconRewind size={14} solid />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          disabled={disabled}
          className={`flex items-center justify-center transition hover:opacity-70 disabled:opacity-40 ${ICON_DARK}`}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <IconPause size={22} solid /> : <IconPlay size={26} solid />}
        </button>

        <button
          type="button"
          onClick={() => onSkip(30)}
          disabled={disabled}
          className={`flex items-center justify-center transition hover:opacity-70 disabled:opacity-40 ${ICON_DARK}`}
          aria-label="Fast forward"
        >
          <IconFastForward size={14} solid />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSkip(10)}
        disabled={disabled}
        className={`flex shrink-0 items-center gap-1.5 transition hover:opacity-70 disabled:opacity-40 ${ICON_MUTED}`}
        aria-label="Forward 10 seconds"
      >
        <span className={LABEL}>10s</span>
        <IconSkip10Forward size={18} solid />
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <span className={`${LABEL} whitespace-nowrap`}>Jump to end</span>
        <CircleJumpButton onClick={onJumpToEnd} disabled={disabled} label="Jump to end">
          <IconJumpToEnd size={13} solid />
        </CircleJumpButton>
      </div>
    </div>
  );
}

export function VideoPlayer({
  episodeVideoRef,
  adVideoRef,
  episodeSrc,
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
  const disabled = !episodeReady;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-white p-[clamp(12px,1.2vw,20px)] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#111827]">
        <video
          ref={episodeVideoRef}
          src={episodeSrc || undefined}
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
            {episodeLoading ? "Loading video…" : "Upload a main video to get started"}
          </div>
        )}
        {inAd && episodeReady && (
          <span className="absolute left-3 top-3 rounded-md bg-[#ea580c]/90 px-2 py-0.5 text-[11px] font-medium text-white">
            Ad break
          </span>
        )}
      </div>

      <VideoControls
        disabled={disabled}
        playing={playing}
        onJumpToStart={onJumpToStart}
        onJumpToEnd={onJumpToEnd}
        onSkip={onSkip}
        onTogglePlay={onTogglePlay}
      />
    </div>
  );
}
