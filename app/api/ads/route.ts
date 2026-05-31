import { getAdsCatalog } from "@/lib/ads-server";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(getAdsCatalog());
}
