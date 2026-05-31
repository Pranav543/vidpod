import type { AdMarker } from "./types";

/** Reconcile server markers with local state after undo/redo */
export async function syncMarkersToServer(desired: AdMarker[]): Promise<void> {
  const res = await fetch("/api/markers");
  if (!res.ok) return;
  const remote = (await res.json()) as AdMarker[];
  const desiredIds = new Set(desired.map((m) => m.id));
  const remoteIds = new Set(remote.map((m) => m.id));

  for (const r of remote) {
    if (!desiredIds.has(r.id)) {
      await fetch(`/api/markers/${r.id}`, { method: "DELETE" });
    }
  }

  for (const m of desired) {
    if (remoteIds.has(m.id)) {
      await fetch(`/api/markers/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: m.startTime,
          mode: m.mode,
          adIds: m.adIds,
        }),
      });
    } else {
      await fetch("/api/markers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: m.id,
          startTime: m.startTime,
          mode: m.mode,
          adIds: m.adIds,
        }),
      });
    }
  }
}
