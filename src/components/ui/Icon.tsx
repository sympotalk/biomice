import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export const SearchIcon = (p: IconProps) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}>
    <circle cx="7" cy="7" r="5" />
    <path d="M11 11l3 3" />
  </svg>
);

export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" {...p}>
    <path d="M12 20.5s-7.5-4.5-9.5-9.3C1.2 7.6 3.5 4 7 4c2 0 3.8 1.2 5 3 1.2-1.8 3-3 5-3 3.5 0 5.8 3.6 4.5 7.2C19.5 16 12 20.5 12 20.5z" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6h12M5.5 1.5v3M10.5 1.5v3" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M8 14.5V9M8 9c-2.5 0-4.5-2-4.5-4.5S5.5.5 8 .5s4.5 2 4.5 4.5S10.5 9 8 9z" />
    <circle cx="8" cy="4.5" r="1.3" />
  </svg>
);

export const FlameIcon = (p: IconProps) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" {...p}>
    <path d="M8 1c-.3 2.5-2 3.5-3 5-1 1.5-1.5 3-1.5 4.5C3.5 13 5.5 15 8 15s4.5-2 4.5-4.5c0-1-.3-2-1-3-.5 1.2-1.2 1.5-1.5 1.2.5-2.5-.5-5.7-2-7.7z" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M10 3l-5 5 5 5" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6 3l5 5-5 5" />
  </svg>
);

export const ExternalIcon = (p: IconProps) => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M9 2h5v5M14 2l-7 7M12 9v4.5H2.5V4H7" />
  </svg>
);

export const EmptyIcon = (p: IconProps) => (
  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="12" y="14" width="40" height="38" rx="3" />
    <path d="M20 24h24M20 32h16M20 40h20" />
    <circle cx="48" cy="48" r="8" fill="var(--bm-bg)" />
    <path d="M45 48h6M48 45v6" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
