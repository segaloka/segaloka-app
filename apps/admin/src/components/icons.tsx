import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({
  children,
  ...props
}: IconProps & {
  children: React.ReactNode;
}) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      {children}
    </svg>
  );
}

const stroke = {
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.8
};

export function GridIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect {...stroke} height="7" rx="1.5" width="7" x="3" y="3" />
      <rect {...stroke} height="7" rx="1.5" width="7" x="14" y="3" />
      <rect {...stroke} height="7" rx="1.5" width="7" x="3" y="14" />
      <rect {...stroke} height="7" rx="1.5" width="7" x="14" y="14" />
    </IconBase>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M4 21V6l8-3 8 3v15" />
      <path {...stroke} d="M9 21v-4h6v4" />
      <path {...stroke} d="M8 8h.01M12 8h.01M16 8h.01" />
      <path {...stroke} d="M8 12h.01M12 12h.01M16 12h.01" />
    </IconBase>
  );
}

export function StoreIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M4 10v10h16V10M3 10l2-6h14l2 6" />
      <path {...stroke} d="M3 10c0 1.7 1.2 3 2.7 3S8.5 11.7 8.5 10" />
      <path {...stroke} d="M8.5 10c0 1.7 1.2 3 2.7 3S14 11.7 14 10" />
      <path {...stroke} d="M14 10c0 1.7 1.2 3 2.7 3S19.5 11.7 19.5 10" />
    </IconBase>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle {...stroke} cx="9" cy="7" r="4" />
      <path {...stroke} d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path {...stroke} d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path {...stroke} d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </IconBase>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M6 8h12l1 13H5L6 8Z" />
      <path {...stroke} d="M9 8V6a3 3 0 0 1 6 0v2" />
    </IconBase>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
      <path {...stroke} d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect {...stroke} height="17" rx="2" width="18" x="3" y="4" />
      <path {...stroke} d="M16 2v4M8 2v4M3 10h18" />
    </IconBase>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path {...stroke} d="m3 12 9 5 9-5M3 17l9 5 9-5" />
    </IconBase>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M3 6h15a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2V6Z" />
      <path {...stroke} d="M3 6a3 3 0 0 1 3-3h11v3M16 12h5" />
      <circle cx="16" cy="12" fill="currentColor" r="1" />
    </IconBase>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle {...stroke} cx="12" cy="12" r="9" />
      <path {...stroke} d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </IconBase>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path {...stroke} d="m9 12 2 2 4-4" />
    </IconBase>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </IconBase>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle {...stroke} cx="12" cy="12" r="3" />
      <path {...stroke} d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L14.3 3h-4.6L9.3 6a8 8 0 0 0-1.7 1L5.1 6 3 9.4 5.1 11a7 7 0 0 0 0 2L3 14.6 5.1 18l2.5-1a8 8 0 0 0 1.7 1l.4 3h4.6l.4-3a8 8 0 0 0 1.7-1l2.5 1 2-3.4-2-1.6a7 7 0 0 0 .1-1Z" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle {...stroke} cx="11" cy="11" r="7" />
      <path {...stroke} d="m20 20-4-4" />
    </IconBase>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="m7 10 5 5 5-5" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="m9 6 6 6-6 6" />
    </IconBase>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M7 17 17 7M7 7h10v10" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M5 12h14M13 6l6 6-6 6" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="m5 12 4 4L19 6" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle {...stroke} cx="12" cy="12" r="9" />
      <path {...stroke} d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M4 7h16M4 12h16M4 17h16" />
    </IconBase>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path {...stroke} d="M8 9h8M8 13h5" />
    </IconBase>
  );
}

export function MegaphoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path {...stroke} d="M3 11v2a2 2 0 0 0 2 2h2l3 5h3l-2-5 8-3V6L7 9H5a2 2 0 0 0-2 2Z" />
      <path {...stroke} d="M19 8a4 4 0 0 1 0 4" />
    </IconBase>
  );
}

export function UserRoundIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle {...stroke} cx="12" cy="8" r="4" />
      <path {...stroke} d="M4 21a8 8 0 0 1 16 0" />
    </IconBase>
  );
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect {...stroke} height="17" rx="2" width="16" x="4" y="4" />
      <path {...stroke} d="M9 4V2h6v2M8 12l2.5 2.5L16 9" />
    </IconBase>
  );
}
