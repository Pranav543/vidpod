import fs from "fs";
import path from "path";

export const DATA_DIR = path.join(process.cwd(), "data");
export const DEFAULT_EPISODE = "main-video.mp4";

const ALLOWED = new Set([".mp4", ".webm", ".mov"]);

export function safeMediaPath(filename: string): string | null {
  const base = path.basename(filename);
  if (base !== filename || base.includes("..")) return null;
  const ext = path.extname(base).toLowerCase();
  if (!ALLOWED.has(ext)) return null;
  const full = path.join(DATA_DIR, base);
  if (!full.startsWith(DATA_DIR)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

export function mediaUrl(filename: string): string {
  return `/api/media/${encodeURIComponent(filename)}`;
}

export function listAdFiles(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("sample-ad-") && f.endsWith(".mp4"))
    .sort();
}

export function listEpisodeFiles(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".mp4") && !f.startsWith("sample-ad-"))
    .sort();
}
