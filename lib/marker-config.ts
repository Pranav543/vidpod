import performanceData from "@/data/ad-performance.json";
import type { AdMode } from "./types";

/** Hardcoded ad pools per mode — markers use these automatically */
export const MODE_AD_POOL: Record<AdMode, string[]> = {
  static: ["ad-1"],
  auto: ["ad-1", "ad-2", "ad-3", "ad-4"],
  ab: ["ad-1", "ad-2", "ad-3", "ad-4"],
};

export type AdPerformance = {
  ctr: number;
  completions: number;
  label: string;
};

export const AD_PERFORMANCE = performanceData as Record<string, AdPerformance>;

export function adIdsForMode(mode: AdMode): string[] {
  return [...MODE_AD_POOL[mode]];
}

/** A/B: pick ad with highest CTR from pool */
export function pickBestAbAd(pool: string[]): string {
  let best = pool[0];
  let bestCtr = -1;
  for (const id of pool) {
    const ctr = AD_PERFORMANCE[id]?.ctr ?? 0;
    if (ctr > bestCtr) {
      bestCtr = ctr;
      best = id;
    }
  }
  return best;
}

/** Auto: random from pool */
export function pickRandomAutoAd(pool: string[], random: () => number = Math.random): string {
  const i = Math.floor(random() * pool.length);
  return pool[i];
}

/** Stable preview pick for timeline UI (auto mode) */
export function pickAutoAdPreview(markerId: string, pool: string[]): string {
  let hash = 0;
  for (let i = 0; i < markerId.length; i++) hash += markerId.charCodeAt(i);
  return pool[hash % pool.length];
}

export function resolveAdForMarker(
  marker: { id: string; mode: AdMode; adIds?: string[] },
  options?: { random?: () => number; forPlayback?: boolean }
): string | null {
  const pool =
    marker.adIds && marker.adIds.length > 0 ? marker.adIds : adIdsForMode(marker.mode);

  if (pool.length === 0) return null;

  switch (marker.mode) {
    case "static":
      return pool[0];
    case "auto":
      if (options?.forPlayback) {
        return pickRandomAutoAd(pool, options.random);
      }
      return pickAutoAdPreview(marker.id, pool);
    case "ab":
      return pickBestAbAd(pool);
    default:
      return pool[0];
  }
}
