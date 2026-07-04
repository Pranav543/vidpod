/** Client-safe media URL helpers (no filesystem access). */

export function staticMediaUrl(relativePath: string): string {
  const encoded = relativePath
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
  return `/media/${encoded}`;
}

export function apiMediaUrl(relativePath: string): string {
  const encoded = relativePath
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
  return `/api/media/${encoded}`;
}

/** Default for client components — bundled media is served from the CDN path. */
export function mediaUrl(relativePath: string): string {
  return staticMediaUrl(relativePath);
}
