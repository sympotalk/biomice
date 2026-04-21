import type { ReactNode } from "react";
import { FlameIcon } from "./Icon";

export function DDayBadge({
  days,
  size = "md",
}: {
  days: number;
  size?: "sm" | "md";
}) {
  const urgent = days >= 0 && days <= 7;
  const passed = days < 0;
  const label =
    days === 0 ? "D-DAY" : days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
  const bg = passed
    ? "var(--bm-bg-muted)"
    : urgent
    ? "var(--bm-danger-subtle)"
    : "var(--bm-primary-subtle)";
  const color = passed
    ? "var(--bm-text-tertiary)"
    : urgent
    ? "var(--bm-danger)"
    : "var(--bm-primary)";
  const h = size === "sm" ? 20 : 24;
  return (
    <span
      className="mono-num"
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: h,
        padding: "0 8px",
        background: bg,
        color,
        borderRadius: 4,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 600,
        letterSpacing: 0.2,
        animation: urgent && !passed ? "bm-pulse 2s ease-in-out infinite" : undefined,
      }}
    >
      {label}
    </span>
  );
}

type FeaturedVariant = "featured" | "sponsor" | "new";

export function FeaturedBadge({ variant = "featured" }: { variant?: FeaturedVariant }) {
  const map: Record<
    FeaturedVariant,
    { bg: string; color: string; border: string; label: string; icon: ReactNode | null }
  > = {
    featured: {
      bg: "var(--bm-accent-subtle)",
      color: "var(--bm-accent)",
      border: "var(--bm-accent-border)",
      label: "Featured",
      icon: <FlameIcon />,
    },
    sponsor: {
      bg: "var(--bm-accent-subtle)",
      color: "var(--bm-accent)",
      border: "var(--bm-accent-border)",
      label: "스폰서",
      icon: null,
    },
    new: {
      bg: "var(--bm-success-subtle)",
      color: "var(--bm-success)",
      border: "transparent",
      label: "NEW",
      icon: null,
    },
  };
  const v = map[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 22,
        padding: "0 8px",
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      {v.icon}
      {v.label}
    </span>
  );
}

export function RegistrationOpenBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 8px",
        background: "var(--bm-primary-subtle)",
        color: "var(--bm-primary)",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      사전등록 중
    </span>
  );
}
