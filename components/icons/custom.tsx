import type { SVGProps } from "react";

/** Figma mockup logo — play triangle with folded corners (node 1:1803). */
const LOGO_PATH =
  "M75.5205 64C71.5013 61.6559 69.0595 60.2318 65.3769 58.084C64.6307 57.6488 64.4043 56.6743 64.8834 55.9555L75.5205 40L86.1575 55.9555C86.6366 56.6743 86.4113 57.6481 85.6651 58.0833L75.5205 64ZM75.5205 40V64";

type CustomIconProps = SVGProps<SVGSVGElement> & { size?: number };

export function IconVidpodLogo({ size = 24, className, ...props }: CustomIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="64 40 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d={LOGO_PATH} />
    </svg>
  );
}
