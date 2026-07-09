import type { SVGProps } from "react";

type NavIconProps = SVGProps<SVGSVGElement> & { size?: number };

function NavIcon({
  size = 17,
  className,
  children,
  ...props
}: NavIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
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

/** Figma sidebar — house outline */
export function IconNavDashboard(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M2.75 7.25 8.5 2.75l5.75 4.5" />
      <path d="M4.25 6.5V13.75h8.5V6.5" />
      <path d="M7 13.75V10.25h3.25V13.75" />
    </NavIcon>
  );
}

/** Figma sidebar — three ascending bars */
export function IconNavAnalytics(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M3.5 11.75V8" />
      <path d="M8.5 11.75V5.25" />
      <path d="M13.5 11.75V3.25" />
    </NavIcon>
  );
}

/** Figma sidebar — circle with dollar sign */
export function IconNavAds(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="M8.5 5.75v6.5" />
      <path d="M7 6.75h2c.8 0 1.45.55 1.45 1.25S9.8 9.25 9 9.25H7.75" />
      <path d="M7 10.25h2.25c.8 0 1.45.55 1.45 1.25s-.65 1.25-1.45 1.25H7.75" />
    </NavIcon>
  );
}

/** Figma sidebar — TV with antennas */
export function IconNavChannels({ size = 17, className, ...props }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M10.5 21.5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-1H10v1z" />
      <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" />
      <path d="m12 2 2 5h-4l2-5z" />
    </svg>
  );
}

/** Figma sidebar — tray with downward arrow */
export function IconNavImport(props: NavIconProps) {
  return (
    <NavIcon {...props}>
      <path d="M3.25 10.25h10.5" />
      <path d="M5.25 10.25V12.25c0 .55.45 1 1 1h4.5c.55 0 1-.45 1-1v-2" />
      <path d="M8.5 3.75v6.5" />
      <path d="M6.25 7.25 8.5 9.5l2.25-2.25" />
    </NavIcon>
  );
}

/** Figma sidebar — gear outline */
export function IconNavSettings({ size = 17, className, ...props }: NavIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
