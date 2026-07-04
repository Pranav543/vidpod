import { safeMediaPath } from "@/lib/media";
import fs from "fs";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ path: string[] }> };

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
};

function parseRange(
  rangeHeader: string,
  fileSize: number
): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return null;

  const start = match[1] ? parseInt(match[1], 10) : 0;
  let end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  if (start >= fileSize) return null;
  end = Math.min(end, fileSize - 1);
  if (start > end) return null;

  return { start, end };
}

function streamFile(
  filePath: string,
  start: number,
  end: number
): ReadableStream<Uint8Array> {
  const stream = fs.createReadStream(filePath, { start, end });
  return new ReadableStream({
    start(controller) {
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      stream.on("data", (chunk) => {
        if (closed) return;
        try {
          const bytes =
            typeof chunk === "string"
              ? new TextEncoder().encode(chunk)
              : new Uint8Array(chunk);
          controller.enqueue(bytes);
        } catch {
          closed = true;
          stream.destroy();
        }
      });
      stream.on("end", close);
      stream.on("error", (err) => {
        if (!closed) controller.error(err);
        stream.destroy();
      });
    },
    cancel() {
      stream.destroy();
    },
  });
}

export async function GET(request: Request, { params }: Params) {
  const { path: segments } = await params;
  const relativePath = segments.map(decodeURIComponent).join("/");
  const filePath = safeMediaPath(relativePath);
  if (!filePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const rangeHeader = request.headers.get("range");

  if (rangeHeader) {
    const range = parseRange(rangeHeader, fileSize);
    if (range) {
      const { start, end } = range;
      const chunkSize = end - start + 1;
      return new NextResponse(streamFile(filePath, start, end), {
        status: 206,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          ...CACHE_HEADERS,
        },
      });
    }
  }

  return new NextResponse(streamFile(filePath, 0, fileSize - 1), {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      ...CACHE_HEADERS,
    },
  });
}
