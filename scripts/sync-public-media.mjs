#!/usr/bin/env node
/**
 * Copy bundled podcast/ad videos into public/media for CDN static serving on Vercel.
 * User uploads stay in data/ and are served via /api/media at runtime.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = [
  { from: path.join(root, "data", "podcast"), to: path.join(root, "public", "media", "podcast") },
  { from: path.join(root, "data", "ads"), to: path.join(root, "public", "media", "ads") },
];

const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);

function copyDir(from, to) {
  if (!fs.existsSync(from)) return 0;
  fs.mkdirSync(to, { recursive: true });
  let count = 0;
  for (const name of fs.readdirSync(from)) {
    const ext = path.extname(name).toLowerCase();
    if (!VIDEO_EXT.has(ext)) continue;
    fs.copyFileSync(path.join(from, name), path.join(to, name));
    count += 1;
  }
  return count;
}

let total = 0;
for (const { from, to } of sources) {
  total += copyDir(from, to);
}
console.log(`[sync-public-media] synced ${total} video(s) to public/media/`);
