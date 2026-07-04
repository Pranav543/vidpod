import { describe, expect, it } from "vitest";
import { DEFAULT_EPISODE } from "./default-episode";
import { apiMediaUrl, mediaUrl, staticMediaUrl } from "./media-url";
import { mediaUrl as serverMediaUrl, safeMediaPath } from "./media";
import path from "path";

describe("media", () => {
  it("rejects path traversal", () => {
    expect(safeMediaPath("../package.json")).toBeNull();
    expect(safeMediaPath("podcast/../package.json")).toBeNull();
  });

  it("finds default episode video", () => {
    const p = safeMediaPath(DEFAULT_EPISODE);
    expect(p).not.toBeNull();
  });

  it("finds ads sample video", () => {
    const p = safeMediaPath("ads/sample-ad-1.mp4");
    expect(p).not.toBeNull();
  });

  it("builds static CDN url for client", () => {
    expect(mediaUrl(DEFAULT_EPISODE)).toBe(staticMediaUrl(DEFAULT_EPISODE));
    expect(staticMediaUrl("ads/sample-ad-1.mp4")).toBe(
      "/media/ads/sample-ad-1.mp4"
    );
    expect(apiMediaUrl("podcast/upload.mp4")).toBe(
      "/api/media/podcast/upload.mp4"
    );
  });

  it("server mediaUrl prefers CDN when public copy exists", () => {
    const url = serverMediaUrl(DEFAULT_EPISODE);
    expect(
      url === staticMediaUrl(DEFAULT_EPISODE) ||
        url === apiMediaUrl(DEFAULT_EPISODE)
    ).toBe(true);
  });

  it("resolves bundled media from public or data", () => {
    const resolved = safeMediaPath(DEFAULT_EPISODE);
    expect(resolved).not.toBeNull();
    const fromData = path.join(process.cwd(), "data", "podcast", path.basename(DEFAULT_EPISODE));
    const fromPublic = path.join(
      process.cwd(),
      "public",
      "media",
      "podcast",
      path.basename(DEFAULT_EPISODE)
    );
    expect(resolved === fromData || resolved === fromPublic).toBe(true);
  });
});
