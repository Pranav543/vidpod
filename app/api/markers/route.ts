import { createMarker, listMarkers } from "@/lib/db";
import { adIdsForMode } from "@/lib/marker-config";
import type { AdMarker, AdMode, CreateMarkerBody } from "@/lib/types";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

function normalizeMarker(m: AdMarker): AdMarker {
  return { ...m, adIds: adIdsForMode(m.mode) };
}

function seedDemoMarkersIfEmpty() {
  if (listMarkers().length > 0) return;
  const demos: { startTime: number; mode: AdMode }[] = [
    { startTime: 30, mode: "static" },
    { startTime: 90, mode: "auto" },
    { startTime: 150, mode: "ab" },
  ];
  for (const d of demos) {
    createMarker(randomUUID(), d.startTime, d.mode, adIdsForMode(d.mode));
  }
}

export async function GET() {
  seedDemoMarkersIfEmpty();
  return NextResponse.json(listMarkers().map(normalizeMarker));
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateMarkerBody;
  const startTime = Number(body.startTime);
  if (!Number.isFinite(startTime) || startTime < 0) {
    return NextResponse.json({ error: "Invalid startTime" }, { status: 400 });
  }

  const mode = (body.mode ?? "static") as AdMode;
  const adIds = adIdsForMode(mode);
  const id = typeof body.id === "string" && body.id.length > 0 ? body.id : randomUUID();
  const marker = createMarker(id, startTime, mode, adIds);
  return NextResponse.json(marker, { status: 201 });
}
