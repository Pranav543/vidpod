import { describe, expect, it } from "vitest";
import { apiMediaUrl, mediaUrl, staticMediaUrl } from "./media-url";
import { mediaUrl as serverMediaUrl, safeMediaPath } from "./media";
import path from "path";

describe("media", () => {
  it("rejects path traversal", () => {
    expect(safeMediaPath("../package.json")).toBeNull();
    expect(safeMediaPath("podcast/../package.json")).toBeNull();
  });

  it("finds podcast main-video", () => {
    const p = safeMediaPath("podcast/main-video.mp4");
    expect(p).not.toBeNull();
    expect(p).toBe(path.join(process.cwd(), "data", "podcast", "main-video.mp4"));
  });

  it("finds ads sample video", () => {
    const p = safeMediaPath("ads/sample-ad-1.mp4");
    expect(p).not.toBeNull();
  });

  it("builds static CDN url for client", () => {
    expect(mediaUrl("podcast/main-video.mp4")).toBe(
      "/media/podcast/main-video.mp4"
    );
    expect(staticMediaUrl("ads/sample-ad-1.mp4")).toBe(
      "/media/ads/sample-ad-1.mp4"
    );
    expect(apiMediaUrl("podcast/upload.mp4")).toBe(
      "/api/media/podcast/upload.mp4"
    );
  });

  it("server mediaUrl prefers CDN when public copy exists", () => {
    const url = serverMediaUrl("podcast/main-video.mp4");
    expect(url === "/media/podcast/main-video.mp4" || url === "/api/media/podcast/main-video.mp4").toBe(
      true
    );
  });
});
