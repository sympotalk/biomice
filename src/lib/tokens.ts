// biomice design tokens — TypeScript source of truth
// Mirrors the CSS variables in src/app/globals.css so
// components can reference them programmatically.

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  input: 4,
  button: 6,
  card: 8,
  pill: 999,
} as const;

/** Use anywhere we need the CSS-var string. */
export const cssVar = {
  primary: "var(--bm-primary)",
  primaryHover: "var(--bm-primary-hover)",
  primaryActive: "var(--bm-primary-active)",
  primarySubtle: "var(--bm-primary-subtle)",
  primarySubtleHover: "var(--bm-primary-subtle-hover)",
  bg: "var(--bm-bg)",
  bgMuted: "var(--bm-bg-muted)",
  surface: "var(--bm-surface)",
  surfaceHover: "var(--bm-surface-hover)",
  textPrimary: "var(--bm-text-primary)",
  textSecondary: "var(--bm-text-secondary)",
  textTertiary: "var(--bm-text-tertiary)",
  textInverse: "var(--bm-text-inverse)",
  accent: "var(--bm-accent)",
  accentSubtle: "var(--bm-accent-subtle)",
  accentBorder: "var(--bm-accent-border)",
  border: "var(--bm-border)",
  borderStrong: "var(--bm-border-strong)",
  success: "var(--bm-success)",
  successSubtle: "var(--bm-success-subtle)",
  danger: "var(--bm-danger)",
  dangerSubtle: "var(--bm-danger-subtle)",
  warning: "var(--bm-warning)",
  warningSubtle: "var(--bm-warning-subtle)",
  favorite: "var(--bm-favorite)",
} as const;

export const specialties = [
  "내과",
  "외과",
  "소아청소년과",
  "산부인과",
  "정형외과",
  "피부과",
  "안과",
  "이비인후과",
  "신경과",
  "정신의학",
  "가정의학",
  "영상의학",
  "마취통증의학",
  "심장내과",
  "소화기내과",
  "호흡기내과",
  "신장내과",
  "내분비내과",
  "혈액종양내과",
  "류마티스내과",
] as const;

export type Specialty = (typeof specialties)[number];
