"use client";

import { type ButtonHTMLAttributes, type ReactNode, useState } from "react";
import { radius } from "@/lib/tokens";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
};

const SIZES: Record<Size, { h: number; px: number; fs: number }> = {
  sm: { h: 32, px: 12, fs: 13 },
  md: { h: 40, px: 16, fs: 14 },
  lg: { h: 48, px: 20, fs: 15 },
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  iconRight,
  fullWidth,
  disabled,
  ...rest
}: ButtonProps) {
  const [hov, setHov] = useState(false);
  const [act, setAct] = useState(false);
  const s = SIZES[size];

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: s.h,
    padding: `0 ${s.px}px`,
    borderRadius: radius.button,
    fontSize: s.fs,
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    transition: "all .14s",
    whiteSpace: "nowrap",
    width: fullWidth ? "100%" : undefined,
    opacity: disabled ? 0.5 : 1,
    lineHeight: 1,
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      background: act
        ? "var(--bm-primary-active)"
        : hov
        ? "var(--bm-primary-hover)"
        : "var(--bm-primary)",
      color: "#fff",
    },
    secondary: {
      background: hov
        ? "var(--bm-primary-subtle-hover)"
        : "var(--bm-primary-subtle)",
      color: "var(--bm-primary)",
    },
    outline: {
      background: hov ? "var(--bm-bg-muted)" : "transparent",
      color: "var(--bm-text-primary)",
      border: "1px solid var(--bm-border)",
    },
    ghost: {
      background: hov ? "var(--bm-bg-muted)" : "transparent",
      color: "var(--bm-text-secondary)",
    },
    danger: {
      background: hov ? "#B03535" : "var(--bm-danger)",
      color: "#fff",
    },
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => {
        setHov(false);
        setAct(false);
      }}
      onMouseDown={() => setAct(true)}
      onMouseUp={() => setAct(false)}
      style={{ ...base, ...variants[variant] }}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
