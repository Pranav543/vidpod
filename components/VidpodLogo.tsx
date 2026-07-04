import { IconVidpodLogo } from "./icons";

export function VidpodLogo({
  size = "md",
  muted = false,
}: {
  size?: "sm" | "md";
  muted?: boolean;
}) {
  const text = size === "sm" ? "text-[13px]" : "text-[15px]";
  const iconPx = size === "sm" ? 18 : 24;
  const color = muted ? "text-[#9ca3af]" : "text-[#111827]";
  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      <IconVidpodLogo size={iconPx} />
      <span className={`${text} font-semibold tracking-tight`}>Vidpod</span>
    </div>
  );
}
