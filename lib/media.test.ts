import { describe, expect, it } from "vitest";
import { safeMediaPath, mediaUrl } from "./media";
import path from "path";

describe("media", () => {
  it("rejects path traversal", () => {
    expect(safeMediaPath("../package.json")).toBeNull();
    expect(safeMediaPath("..%2Fpackage.json")).toBeNull();
  });

  it("finds main-video in data folder", () => {
    const p = safeMediaPath("main-video.mp4");
    expect(p).not.toBeNull();
    expect(p).toBe(path.join(process.cwd(), "data", "main-video.mp4"));
  });

  it("builds media API url", () => {
    expect(mediaUrl("main-video.mp4")).toBe("/api/media/main-video.mp4");
  });
});
