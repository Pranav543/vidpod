"use client";

import { mediaUrl } from "@/lib/ads";
import { pickBestAbAd } from "@/lib/marker-config";
import type { AdPerformance } from "@/lib/marker-config";
import type { Ad, AdMarker } from "@/lib/types";
import { ChevronRight, X } from "lucide-react";

type Props = {
  open: boolean;
  marker: AdMarker;
  ads: Ad[];
  performance: Record<string, AdPerformance>;
  onClose: () => void;
  onNewTest: () => void;
};

export function AbTestResultsModal({
  open,
  marker,
  ads,
  performance,
  onClose,
  onNewTest,
}: Props) {
  if (!open || marker.mode !== "ab") return null;

  const pool = marker.adIds ?? [];
  const ranked = [...pool].sort((a, b) => {
    const ctrA = performance[a]?.ctr ?? 0;
    const ctrB = performance[b]?.ctr ?? 0;
    return ctrB - ctrA;
  });

  const winnerId = pickBestAbAd(pool, performance);

  return (
    <div
      data-modal
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pb-4 pt-5">
          <div>
            <h2 className="text-[17px] font-semibold text-[#111827]">A/B test results</h2>
            <p className="mt-0.5 text-[13px] text-[#6b7280]">
              {pool.length} ad{pool.length === 1 ? "" : "s"} tested
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9ca3af] hover:bg-[#f3f4f6]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="space-y-2.5 px-4 pb-4">
          {ranked.map((adId, i) => {
            const ad = ads.find((a) => a.id === adId);
            const rank = i + 1;
            const isWinner = adId === winnerId;
            const mins = ad ? Math.floor(ad.duration / 60) : 0;
            const secs = ad ? ad.duration % 60 : 0;
            const brand = ad?.name.split(" ")[0] ?? "Ad";
            return (
              <li
                key={adId}
                className={`flex gap-3 rounded-xl border p-3 ${
                  isWinner
                    ? "border-[#6ee7b7] bg-[#ecfdf5]/40"
                    : "border-[#e5e7eb] bg-white"
                }`}
              >
                <div className="h-[52px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-[#f3f4f6]">
                  {ad ? (
                    <video
                      className="h-full w-full object-cover"
                      src={mediaUrl(ad.filename)}
                      muted
                      preload="metadata"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#111827]">
                    {ad?.name ?? adId}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#9ca3af]">
                    13/03/24 · {mins}m {secs}s
                  </p>
                  <div className="mt-1 flex items-center gap-0.5 text-[11px] text-[#6b7280]">
                    <span>{brand}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>Pod 3</span>
                  </div>
                </div>
                <span
                  className={`flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-md px-1.5 text-[11px] font-bold ${
                    isWinner
                      ? "bg-[#d1fae5] text-[#047857]"
                      : "border border-[#e5e7eb] bg-white text-[#6b7280]"
                  }`}
                >
                  #{rank}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end gap-2 border-t border-[#f3f4f6] px-6 py-4">
          <button
            type="button"
            onClick={() => {
              onNewTest();
              onClose();
            }}
            className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            New test
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#111827] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1f2937]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
