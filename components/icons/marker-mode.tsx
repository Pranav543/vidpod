import type { SVGProps } from "react";

type MarkerModeIconProps = SVGProps<SVGSVGElement> & { size?: number };

function MarkerModeIcon({
  size = 20,
  className,
  children,
  ...props
}: MarkerModeIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Figma — dashed circle (Auto) */
export function IconMarkerAuto({ size = 20, className, ...props }: MarkerModeIconProps) {
  return (
    <MarkerModeIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="8" strokeDasharray="3.5 3.5" />
    </MarkerModeIcon>
  );
}

/** Figma — crosshair / target (Static) */
export function IconMarkerStatic({ size = 20, className, ...props }: MarkerModeIconProps) {
  return (
    <MarkerModeIcon size={size} className={className} {...props}>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 3.5v2.5" />
      <path d="M12 18v2.5" />
      <path d="M3.5 12h2.5" />
      <path d="M18 12h2.5" />
    </MarkerModeIcon>
  );
}

/** Figma — two test tubes (A/B test) */
export function IconMarkerAbTest({ size = 20, className, ...props }: MarkerModeIconProps) {
  return (
    <MarkerModeIcon size={size} className={className} {...props}>
      <path d="M8 5v13a2 2 0 0 0 4 0V5" />
      <path d="M12 5v13a2 2 0 0 0 4 0V5" />
      <path d="M6.5 5h11" />
      <path d="M7.5 9.5h3" />
      <path d="M13.5 9.5h3" />
    </MarkerModeIcon>
  );
}
