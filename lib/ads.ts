import { mediaUrl } from "./media-url";
import type { Ad } from "./types";

export { mediaUrl };

/** Client-safe helpers — pass catalog from API responses */
export function adSrcFromCatalog(ad: Ad): string {
  return mediaUrl(ad.filename);
}

export function adSrcByIdFromCatalog(catalog: Ad[], id: string): string | null {
  const ad = catalog.find((a) => a.id === id);
  return ad ? adSrcFromCatalog(ad) : null;
}
