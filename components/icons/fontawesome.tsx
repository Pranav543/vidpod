import { config } from "@fortawesome/fontawesome-svg-core";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircle,
  faCircleDot,
  faCircleQuestion,
  faFolder,
  faHouse,
  faLightbulb,
  faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import {
  faArchive,
  faArrowRotateLeft,
  faArrowRotateRight,
  faBackward,
  faBackwardStep,
  faBullseye,
  faChartColumn,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleDollarToSlot,
  faDownload,
  faFlask,
  faForward,
  faForwardStep,
  faGear,
  faMagnifyingGlass,
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faPause,
  faPlay,
  faPlus,
  faSpinner,
  faUsers,
  faWandMagicSparkles,
  faWaveSquare,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { ComponentProps, ReactElement } from "react";

config.autoAddCss = false;

export type VidpodIconProps = {
  className?: string;
  size?: number;
  /** Ignored — kept for compatibility with prior icon API. */
  strokeWidth?: number;
  solid?: boolean;
  spin?: boolean;
  "aria-hidden"?: boolean;
};

export type VidpodIconComponent = (props: VidpodIconProps) => ReactElement;

function iconStyle(size?: number) {
  if (!size) return undefined;
  return { width: size, height: size, fontSize: size } as const;
}

function createIcon(regular: IconDefinition | undefined, solid: IconDefinition): VidpodIconComponent {
  return function VidpodIcon({
    className,
    size,
    solid: useSolid = false,
    spin,
    "aria-hidden": ariaHidden = true,
  }) {
    const icon = useSolid || !regular ? solid : regular;
    const props: ComponentProps<typeof FontAwesomeIcon> = {
      icon,
      className,
      style: iconStyle(size),
      spin,
      "aria-hidden": ariaHidden,
    };
    return <FontAwesomeIcon {...props} />;
  };
}

/** Regular outline by default; `solid: true` (or `active` via figmaIconProps) for heavier weight. */
export function figmaIconProps(options?: {
  active?: boolean;
  size?: number;
  className?: string;
}) {
  return {
    className: options?.className,
    size: options?.size ?? 17,
    solid: options?.active ?? false,
  };
}

export const IconArchive = createIcon(undefined, faArchive);
export const IconBell = createIcon(faBell, faBell);
export const IconChartColumn = createIcon(undefined, faChartColumn);
export const IconCheck = createIcon(undefined, faCheck);
export const IconChevronDown = createIcon(undefined, faChevronDown);
export const IconChevronLeft = createIcon(undefined, faChevronLeft);
export const IconChevronRight = createIcon(undefined, faChevronRight);
export const IconCircle = createIcon(faCircle, faCircle);
export const IconCircleDashed = createIcon(faCircleDot, faCircleDot);
export const IconCircleDollarSign = createIcon(undefined, faCircleDollarToSlot);
export const IconCircleHelp = createIcon(faCircleQuestion, faCircleQuestion);
export const IconDownload = createIcon(undefined, faDownload);
export const IconFlaskConical = createIcon(undefined, faFlask);
export const IconFolder = createIcon(faFolder, faFolder);
export const IconHome = createIcon(faHouse, faHouse);
export const IconLightbulb = createIcon(faLightbulb, faLightbulb);
export const IconLoader2 = createIcon(undefined, faSpinner);
export const IconPlus = createIcon(undefined, faPlus);
export const IconSearch = createIcon(undefined, faMagnifyingGlass);
export const IconSettings = createIcon(undefined, faGear);
export const IconSparkles = createIcon(undefined, faWandMagicSparkles);
export const IconTarget = createIcon(undefined, faBullseye);
export const IconTrash2 = createIcon(faTrashCan, faTrashCan);
export const IconUsers = createIcon(undefined, faUsers);
export const IconWaves = createIcon(undefined, faWaveSquare);
export const IconX = createIcon(undefined, faXmark);

export const IconFastForward = createIcon(undefined, faForward);
export const IconRewind = createIcon(undefined, faBackward);
export const IconJumpToStart = createIcon(undefined, faBackwardStep);
export const IconJumpToEnd = createIcon(undefined, faForwardStep);
export const IconPlay = createIcon(undefined, faPlay);
export const IconPause = createIcon(undefined, faPause);
export const IconUndo = createIcon(undefined, faArrowRotateLeft);
export const IconRedo = createIcon(undefined, faArrowRotateRight);
export const IconZoomIn = createIcon(undefined, faMagnifyingGlassPlus);
export const IconZoomOut = createIcon(undefined, faMagnifyingGlassMinus);

export const IconSkip10Back = createIcon(undefined, faArrowRotateLeft);
export const IconSkip10Forward = createIcon(undefined, faArrowRotateRight);

export { IconVidpodLogo } from "./custom";

/** @deprecated Use VidpodIconComponent */
export type VidpodLucideIcon = VidpodIconComponent;
