import { getEpisodeFilename, setEpisodeFilename } from "@/lib/db";
import { DATA_DIR, DEFAULT_EPISODE, mediaUrl, safeMediaPath } from "@/lib/media";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const MAIN_FILE = DEFAULT_EPISODE;

export async function GET() {
  const stored = getEpisodeFilename();
  if (stored !== MAIN_FILE) setEpisodeFilename(MAIN_FILE);
  const exists = safeMediaPath(MAIN_FILE) !== null;
  return NextResponse.json({
    filename: MAIN_FILE,
    url: mediaUrl(MAIN_FILE),
    exists,
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const dest = path.join(DATA_DIR, MAIN_FILE);
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await file.arrayBuffer()));
    setEpisodeFilename(MAIN_FILE);
    return NextResponse.json({
      filename: MAIN_FILE,
      url: mediaUrl(MAIN_FILE),
      exists: true,
    });
  }

  return NextResponse.json({ error: "Upload a video file" }, { status: 400 });
}
