import type { AdMode } from "./types";

/** Mockup: Auto = green, Static = blue, A/B = orange */
export const MODE_COLORS: Record<
  AdMode,
  { badge: string; track: string; border: string; text: string; icon: string }
> = {
  auto: {
    badge: "bg-[#dcfce7]",
    track: "bg-[#86efac]/90",
    border: "border-[#22c55e]",
    text: "text-[#166534]",
    icon: "A",
  },
  static: {
    badge: "bg-[#dbeafe]",
    track: "bg-[#93c5fd]/90",
    border: "border-[#3b82f6]",
    text: "text-[#1e40af]",
    icon: "S",
  },
  ab: {
    badge: "bg-[#ffedd5]",
    track: "bg-[#fdba74]/90",
    border: "border-[#f97316]",
    text: "text-[#9a3412]",
    icon: "A/B",
  },
};

export function generateWaveformBars(count: number, seed = 42): number[] {
  let s = seed;
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 0) % 2147483647;
    const r = (s % 1000) / 1000;
    bars.push(0.12 + r * 0.88);
  }
  return bars;
}
