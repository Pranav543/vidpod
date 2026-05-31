import type { Ad } from "./types";

/** Client-safe helpers — pass catalog from API responses */
export function adSrcFromCatalog(ad: Ad): string {
  return `/api/media/${encodeURIComponent(ad.filename)}`;
}

export function adSrcByIdFromCatalog(catalog: Ad[], id: string): string | null {
  const ad = catalog.find((a) => a.id === id);
  return ad ? adSrcFromCatalog(ad) : null;
}

export function adDurationFromCatalog(catalog: Ad[], id: string): number {
  return catalog.find((a) => a.id === id)?.duration ?? 15;
}

export function getAdByIdFromCatalog(catalog: Ad[], id: string): Ad | undefined {
  return catalog.find((a) => a.id === id);
}
