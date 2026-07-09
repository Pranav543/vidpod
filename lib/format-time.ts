/** HH:MM:SS for marker rows and timeline ruler */
export function formatTimecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Parse HH:MM:SS, MM:SS, or raw seconds from marker time inputs. */
export function parseTimecode(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.length === 2) {
    const m = Number(parts[0]);
    const s = Number(parts[1]);
    if (!Number.isFinite(m) || !Number.isFinite(s) || m < 0 || s < 0 || s >= 60) {
      return null;
    }
    return m * 60 + s;
  }

  if (parts.length === 3) {
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const s = Number(parts[2]);
    if (
      !Number.isFinite(h) ||
      !Number.isFinite(m) ||
      !Number.isFinite(s) ||
      h < 0 ||
      m < 0 ||
      s < 0 ||
      m >= 60 ||
      s >= 60
    ) {
      return null;
    }
    return h * 3600 + m * 60 + s;
  }

  return null;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
