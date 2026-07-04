export function mediaUrl(relativePath: string): string {
  const encoded = relativePath
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
  return `/api/media/${encoded}`;
}
