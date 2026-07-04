import fs from "fs";
import path from "path";
import { DEFAULT_EPISODE } from "./default-episode";
import { apiMediaUrl, staticMediaUrl } from "./media-url";

export { DEFAULT_EPISODE };

/** Server-side: CDN for bundled files in public/media, API route for runtime uploads. */
export function mediaUrl(relativePath: string): string {
  const parts = relativePath.split("/");
  if (parts.length === 2) {
    const publicFile = path.join(process.cwd(), "public", "media", ...parts);
    if (fs.existsSync(publicFile)) {
      return staticMediaUrl(relativePath);
    }
  }
  return apiMediaUrl(relativePath);
}

export const DATA_DIR = path.join(process.cwd(), "data");
export const PODCAST_DIR = path.join(DATA_DIR, "podcast");
export const ADS_DIR = path.join(DATA_DIR, "ads");
export const PUBLIC_MEDIA_DIR = path.join(process.cwd(), "public", "media");

const ALLOWED = new Set([".mp4", ".webm", ".mov"]);

function ensureDirs() {
  for (const dir of [DATA_DIR, PODCAST_DIR, ADS_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function publicMediaPath(relativePath: string): string | null {
  const parts = relativePath.split("/");
  if (parts.length !== 2) return null;
  const full = path.join(PUBLIC_MEDIA_DIR, ...parts);
  const root = path.join(PUBLIC_MEDIA_DIR, parts[0]);
  if (!full.startsWith(root)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

/** Relative media key, e.g. `podcast/main-video.mp4` or `ads/sample-ad-1.mp4` */
export function safeMediaPath(relativePath: string): string | null {
  ensureDirs();
  const normalized = path.normalize(relativePath).replace(/\\/g, "/");
  if (normalized.includes("..")) return null;

  const parts = normalized.split("/");
  if (parts.length !== 2) return null;

  const [folder, file] = parts;
  if (folder !== "podcast" && folder !== "ads") return null;

  const base = path.basename(file);
  if (base !== file || base.includes("..")) return null;
  const ext = path.extname(base).toLowerCase();
  if (!ALLOWED.has(ext)) return null;

  const fromPublic = publicMediaPath(normalized);
  if (fromPublic) return fromPublic;

  const root = folder === "podcast" ? PODCAST_DIR : ADS_DIR;
  const full = path.join(root, base);
  if (!full.startsWith(root)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

function listVideosInDir(
  dir: string,
  folder: "podcast" | "ads"
): { filename: string; name: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => ALLOWED.has(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => ({
      filename: `${folder}/${f}`,
      name: f.replace(/\.[^.]+$/, "").replace(/-/g, " "),
    }));
}

export function listPodcastVideos(): { filename: string; name: string }[] {
  ensureDirs();
  const seen = new Map<string, { filename: string; name: string }>();
  for (const item of [
    ...listVideosInDir(path.join(PUBLIC_MEDIA_DIR, "podcast"), "podcast"),
    ...listVideosInDir(PODCAST_DIR, "podcast"),
  ]) {
    seen.set(item.filename, item);
  }
  return [...seen.values()].sort((a, b) => a.filename.localeCompare(b.filename));
}

export function listAdVideoFiles(): string[] {
  ensureDirs();
  const seen = new Set<string>();
  for (const dir of [path.join(PUBLIC_MEDIA_DIR, "ads"), ADS_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (ALLOWED.has(path.extname(f).toLowerCase())) seen.add(f);
    }
  }
  return [...seen].sort();
}

export function savePodcastUpload(originalName: string, bytes: Buffer): string {
  ensureDirs();
  const base = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = base.endsWith(".mp4") ? base : `${base}.mp4`;
  const rel = `podcast/${filename}`;
  fs.writeFileSync(path.join(PODCAST_DIR, filename), bytes);
  return rel;
}
