"use client";

import type { AdMarker } from "@/lib/types";
import { sortMarkersByTime } from "@/lib/marker-reorder";
import { IconPlus, IconSparkles, figmaIconProps } from "./icons";
import { ExportButton } from "./ExportButton";
import { MarkerRow } from "./MarkerRow";
import { useCallback, useMemo, useRef, useState } from "react";

type MarkerPanelProps = {
  markers: AdMarker[];
  selectedId: string | null;
  episodeReady: boolean;
  episodeDuration: number;
  onSelect: (id: string) => void;
  onCreateMarker: () => void;
  onAutoPlace: () => void;
  onEdit: (id: string) => void;
  onTimeChange: (id: string, startTime: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onViewAbResults: (id: string) => void;
  onDelete: (id: string) => void;
};

function resolveDropIndex(listEl: HTMLElement | null, clientY: number): number | null {
  const rows = listEl?.querySelectorAll<HTMLElement>("[data-marker-row]");
  if (!rows?.length) return null;

  for (let i = 0; i < rows.length; i += 1) {
    const rect = rows[i].getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    if (clientY < mid) return i;
  }

  return rows.length - 1;
}

export function MarkerPanel({
  markers,
  selectedId,
  episodeReady,
  episodeDuration,
  onSelect,
  onCreateMarker,
  onAutoPlace,
  onEdit,
  onTimeChange,
  onReorder,
  onViewAbResults,
  onDelete,
}: MarkerPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; fromIndex: number } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const sortedMarkers = useMemo(() => sortMarkersByTime(markers), [markers]);

  const canExport =
    episodeReady && markers.some((m) => (m.adIds?.length ?? 0) > 0);

  const handleDragHandlePointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const fromIndex = sortedMarkers.findIndex((m) => m.id === id);
      if (fromIndex < 0) return;

      const handle = e.currentTarget as HTMLElement;
      handle.setPointerCapture(e.pointerId);
      dragRef.current = { id, fromIndex };
      setDraggingId(id);
      setDropIndex(fromIndex);
      onSelect(id);

      const onMove = (ev: PointerEvent) => {
        if (!dragRef.current) return;
        setDropIndex(resolveDropIndex(listRef.current, ev.clientY));
      };

      const endDrag = (ev: PointerEvent) => {
        const drag = dragRef.current;
        dragRef.current = null;
        setDraggingId(null);
        setDropIndex(null);

        try {
          handle.releasePointerCapture(ev.pointerId);
        } catch {
          /* ok */
        }

        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", endDrag);
        window.removeEventListener("pointercancel", endDrag);

        if (!drag) return;

        const toIndex = resolveDropIndex(listRef.current, ev.clientY);
        if (toIndex !== null && toIndex !== drag.fromIndex) {
          onReorder(drag.fromIndex, toIndex);
        }
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
    },
    [onReorder, onSelect, sortedMarkers]
  );

  return (
    <div className="flex h-full min-h-0 w-[min(360px,32%)] min-w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex shrink-0 items-center justify-between px-4 py-2.5">
        <h2 className="text-[13px] font-semibold text-[#111827]">Ad markers</h2>
        <span className="text-[11px] text-[#9ca3af]">
          {markers.length} marker{markers.length === 1 ? "" : "s"}
        </span>
      </div>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-2"
      >
        {sortedMarkers.length === 0 && (
          <p className="py-10 text-center text-sm text-[#9ca3af]">
            {episodeReady
              ? "No markers yet. Create one at the playhead."
              : "Load a video to add markers."}
          </p>
        )}
        {sortedMarkers.map((m, i) => (
          <MarkerRow
            key={m.id}
            index={i + 1}
            marker={m}
            selected={m.id === selectedId}
            episodeDuration={episodeDuration}
            isDragging={draggingId === m.id}
            isDropTarget={dropIndex === i && draggingId !== null && draggingId !== m.id}
            onSelect={() => onSelect(m.id)}
            onEdit={() => onEdit(m.id)}
            onTimeChange={(startTime) => onTimeChange(m.id, startTime)}
            onDragHandlePointerDown={(e) => handleDragHandlePointerDown(m.id, e)}
            onViewAbResults={() => onViewAbResults(m.id)}
            showAbResults={m.mode === "ab" && (m.adIds?.length ?? 0) >= 2}
            onDelete={() => onDelete(m.id)}
          />
        ))}
      </div>

      <div className="flex shrink-0 flex-col gap-1.5 border-t border-[#f3f4f6] p-2.5">
        <button
          type="button"
          onClick={onCreateMarker}
          disabled={!episodeReady}
          className="flex h-9 w-full items-center justify-center gap-1 rounded-md bg-[#111827] text-[13px] font-medium text-white transition hover:bg-[#1f2937] disabled:opacity-40"
        >
          Create ad marker
          <IconPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={onAutoPlace}
          disabled={!episodeReady}
          className="flex h-9 w-full items-center justify-center gap-1 rounded-md border border-[#e5e7eb] bg-white text-[13px] font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:opacity-40"
        >
          Automatically place
          <IconSparkles {...figmaIconProps({ size: 14, className: "text-[#9ca3af]" })} />
        </button>
        <ExportButton
          disabled={!canExport}
          disabledReason={
            !episodeReady
              ? "Load the main video first"
              : !markers.some((m) => (m.adIds?.length ?? 0) > 0)
                ? "Assign ads to at least one marker"
                : undefined
          }
        />
      </div>
    </div>
  );
}
