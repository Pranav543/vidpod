"use client";

import { AD_PERFORMANCE } from "@/lib/marker-config";
import { resolveAdForMarker } from "@/lib/marker-config";
import { MODE_COLORS } from "@/lib/playback";
import type { Ad, AdMarker, AdMode } from "@/lib/types";
import { Trash2 } from "lucide-react";

const MODES: AdMode[] = ["static", "auto", "ab"];
const MODE_LABELS: Record<AdMode, string> = {
  static: "Static",
  auto: "Auto",
  ab: "A/B",
};

type MarkerRowProps = {
  adsCatalog: Ad[];
  marker: AdMarker;
  selected: boolean;
  onSelect: () => void;
  onModeCycle: () => void;
  onDelete: () => void;
};

export function MarkerRow({
  adsCatalog,
  marker,
  selected,
  onSelect,
  onModeCycle,
  onDelete,
}: MarkerRowProps) {
  const colors = MODE_COLORS[marker.mode];
  const resolvedId = resolveAdForMarker(marker);
  const adName =
    adsCatalog.find((a) => a.id === resolvedId)?.name ??
    AD_PERFORMANCE[resolvedId ?? ""]?.label ??
    resolvedId;

  const modeHint =
    marker.mode === "static"
      ? "Always same ad"
      : marker.mode === "auto"
        ? "Random ad each play"
        : "Best CTR (A/B winner)";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-all ${
        selected
          ? "border-zinc-400 bg-zinc-50 shadow-sm"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onModeCycle();
        }}
        title={`${MODE_LABELS[marker.mode]} — click to change`}
        className={`shrink-0 rounded-md px-3 py-1 text-xs font-semibold ${colors.badge} ${colors.text}`}
      >
        {MODE_LABELS[marker.mode]}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-800">{adName}</p>
        <p className="text-xs text-zinc-500">{modeHint}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="rounded p-1.5 text-red-800/70 hover:bg-red-50"
        aria-label="Delete marker"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function cycleMode(mode: AdMode): AdMode {
  const i = MODES.indexOf(mode);
  return MODES[(i + 1) % MODES.length];
}
