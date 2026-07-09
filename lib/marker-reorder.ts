import type { AdMarker } from "./types";

export function sortMarkersByTime(markers: AdMarker[]): AdMarker[] {
  return [...markers].sort((a, b) => a.startTime - b.startTime);
}

/** Reorder list position while keeping the same set of timeline time slots. */
export function reorderMarkersRedistributingTimes(
  markers: AdMarker[],
  fromIndex: number,
  toIndex: number
): AdMarker[] {
  const sorted = sortMarkersByTime(markers);
  if (
    fromIndex < 0 ||
    fromIndex >= sorted.length ||
    toIndex < 0 ||
    toIndex >= sorted.length ||
    fromIndex === toIndex
  ) {
    return sorted;
  }

  const times = sorted.map((m) => m.startTime);
  const order = [...sorted];
  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);

  return order.map((marker, index) => ({
    ...marker,
    startTime: times[index],
  }));
}

export function markersWithChangedTimes(
  before: AdMarker[],
  after: AdMarker[]
): AdMarker[] {
  const beforeById = new Map(before.map((m) => [m.id, m]));
  return after.filter((m) => {
    const prev = beforeById.get(m.id);
    return prev && Math.abs(prev.startTime - m.startTime) >= 0.05;
  });
}
