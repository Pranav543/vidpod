"use client";

import { formatTimecode, parseTimecode } from "@/lib/format-time";
import { MODE_COLORS } from "@/lib/timeline-visual";
import type { AdMarker, AdMode } from "@/lib/types";
import { useEffect, useState } from "react";
import { IconTrash2, figmaIconProps } from "./icons";

const MODE_LABELS: Record<AdMode, string> = {
  static: "Static",
  auto: "Auto",
  ab: "A/B",
};

function RowDragHandle({ onPointerDown }: { onPointerDown: (e: React.PointerEvent) => void }) {
  const dotR = 1.75;
  const gap = 3;
  const cols = 2;
  const rows = 3;
  const w = cols * dotR * 2 + (cols - 1) * gap;
  const h = rows * dotR * 2 + (rows - 1) * gap;
  const dots: { cx: number; cy: number }[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      dots.push({
        cx: dotR + col * (dotR * 2 + gap),
        cy: dotR + row * (dotR * 2 + gap),
      });
    }
  }

  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()}
      className="flex h-8 w-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-sm text-[#9ca3af] transition hover:bg-[#f3f4f6] hover:text-[#6b7280] active:cursor-grabbing"
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="block"
        aria-hidden
      >
        {dots.map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r={dotR} fill="currentColor" />
        ))}
      </svg>
    </button>
  );
}

type MarkerRowProps = {
  index: number;
  marker: AdMarker;
  selected: boolean;
  episodeDuration: number;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onTimeChange: (startTime: number) => void;
  onDragHandlePointerDown: (e: React.PointerEvent) => void;
  onViewAbResults?: () => void;
  onDelete: () => void;
  showAbResults?: boolean;
};

export function MarkerRow({
  index,
  marker,
  selected,
  episodeDuration,
  isDragging = false,
  isDropTarget = false,
  onSelect,
  onEdit,
  onTimeChange,
  onDragHandlePointerDown,
  onViewAbResults,
  onDelete,
  showAbResults,
}: MarkerRowProps) {
  const colors = MODE_COLORS[marker.mode];
  const isAb = marker.mode === "ab";
  const [draft, setDraft] = useState(() => formatTimecode(marker.startTime));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(formatTimecode(marker.startTime));
    }
  }, [marker.startTime, editing]);

  const commitTime = () => {
    const parsed = parseTimecode(draft);
    if (parsed === null) {
      setDraft(formatTimecode(marker.startTime));
      return;
    }

    const max = Math.max(0, episodeDuration);
    const clamped = Math.max(0, Math.min(parsed, max));
    setDraft(formatTimecode(clamped));

    if (Math.abs(clamped - marker.startTime) >= 0.05) {
      onTimeChange(clamped);
    }
  };

  return (
    <div
      data-marker-row
      className={`grid grid-cols-[20px_18px_88px_1fr_auto_32px] items-center gap-2 rounded-lg px-1.5 py-1.5 transition ${
        isDragging
          ? "opacity-40"
          : isDropTarget
            ? "bg-[#f3f4f6] ring-1 ring-[#d1d5db]"
            : selected
              ? "bg-[#f9fafb] ring-1 ring-[#e5e7eb]"
              : "hover:bg-[#fafafa]"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      role="button"
      tabIndex={0}
    >
      <RowDragHandle onPointerDown={onDragHandlePointerDown} />

      <span className="text-center text-[13px] font-medium text-[#9ca3af]">{index}</span>

      <input
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onFocus={(e) => {
          e.stopPropagation();
          setEditing(true);
          e.currentTarget.select();
        }}
        onBlur={() => {
          setEditing(false);
          commitTime();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
          if (e.key === "Escape") {
            setDraft(formatTimecode(marker.startTime));
            setEditing(false);
            e.currentTarget.blur();
          }
        }}
        className="w-full rounded-sm border border-[#e5e7eb] bg-white px-2 py-1.5 text-center text-[13px] tabular-nums text-[#111827] outline-none focus:border-[#9ca3af] focus:ring-1 focus:ring-[#d1d5db]"
        aria-label={`Marker ${index} start time`}
      />

      <span
        className={`inline-flex w-fit rounded-sm px-2.5 py-1 text-[11px] font-semibold ${colors.badge} ${colors.text}`}
      >
        {MODE_LABELS[marker.mode]}
      </span>

      {isAb && showAbResults && onViewAbResults ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewAbResults();
          }}
          className="shrink-0 rounded-sm border border-[#e5e7eb] bg-white px-3 py-1 text-[11px] font-medium text-[#374151] transition hover:bg-[#f9fafb]"
        >
          Results
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="shrink-0 rounded-sm border border-[#e5e7eb] bg-white px-3 py-1 text-[11px] font-medium text-[#374151] transition hover:bg-[#f9fafb]"
        >
          Edit
        </button>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#fef2f2] text-[#dc2626] transition hover:bg-[#fee2e2]"
        aria-label="Delete marker"
      >
        <IconTrash2 {...figmaIconProps({ size: 14 })} />
      </button>
    </div>
  );
}
