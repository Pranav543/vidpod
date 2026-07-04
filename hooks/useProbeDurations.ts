"use client";

import { mediaUrl } from "@/lib/ads";
import type { Ad } from "@/lib/types";
import { useEffect, useState } from "react";

function probe(url: string): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      resolve(Number.isFinite(v.duration) ? v.duration : 15);
      v.remove();
    };
    v.onerror = () => {
      resolve(15);
      v.remove();
    };
    v.src = url;
  });
}

function needsDurationProbe(ad: Ad): boolean {
  return !ad.duration || ad.duration <= 0;
}

export function useProbeDurations(ads: Ad[], episodeUrl: string | null) {
  const [catalog, setCatalog] = useState<Ad[]>(ads);

  useEffect(() => {
    setCatalog(ads);
  }, [ads]);

  useEffect(() => {
    const missing = ads.filter(needsDurationProbe);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      const probed = new Map<string, number>();
      await Promise.all(
        missing.map(async (ad) => {
          const d = await probe(mediaUrl(ad.filename));
          probed.set(ad.id, Math.max(1, Math.round(d)));
        })
      );
      if (cancelled) return;
      setCatalog(
        ads.map((ad) =>
          probed.has(ad.id)
            ? { ...ad, duration: probed.get(ad.id)! }
            : ad
        )
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [ads]);

  // Episode duration comes from the main player via loadedmetadata.
  void episodeUrl;

  return { catalog };
}
