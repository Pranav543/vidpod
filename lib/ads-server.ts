import adsJson from "@/data/ads.json";
import { listAdsFromDb, syncDefaultAds, upsertAd } from "./db";
import { listAdFiles, mediaUrl, safeMediaPath } from "./media";
import type { Ad } from "./types";

function seedFromJson(): Ad[] {
  const catalog = adsJson as Ad[];
  syncDefaultAds(catalog);
  return catalog;
}

export function getAdsCatalog(): Ad[] {
  seedFromJson();
  const fromDb = listAdsFromDb();
  if (fromDb.length > 0) {
    return fromDb.map((r) => ({
      id: r.id,
      name: r.name,
      filename: r.filename,
      duration: r.duration,
    }));
  }

  const files = listAdFiles();
  return files.map((filename, i) => ({
    id: `ad-${i + 1}`,
    name: filename.replace(".mp4", "").replace(/-/g, " "),
    filename,
    duration: 15,
  }));
}

export function getAdByIdServer(id: string): Ad | undefined {
  return getAdsCatalog().find((a) => a.id === id);
}

export function adSrcServer(ad: Ad): string {
  return mediaUrl(ad.filename);
}

export function registerUploadedAd(filename: string, name?: string): Ad {
  const base = filename.replace(/\.[^.]+$/, "");
  const id = `upload-${base}-${Date.now()}`;
  const ad: Ad = {
    id,
    name: name ?? base,
    filename,
    duration: 15,
  };
  upsertAd(ad.id, ad.name, ad.filename, ad.duration);
  return ad;
}

export function adFileExists(filename: string): boolean {
  return safeMediaPath(filename) !== null;
}
