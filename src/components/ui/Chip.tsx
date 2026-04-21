"use client";

import { useState } from "react";
import { radius } from "@/lib/tokens";

type Props = {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
};

export function SpecialtyChip({ label, count, active, onClick }: Props) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 34,
        padding: "0 14px",
        borderRadius: radius.pill,
        cursor: "pointer",
        border: `1px solid ${active ? "var(--bm-primary)" : "var(--bm-border)"}`,
        background: active
          ? "var(--bm-primary)"
          : hov
          ? "var(--bm-bg-muted)"
          : "var(--bm-bg)",
        color: active ? "#fff" : "var(--bm-text-primary)",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        transition: "all .14s",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {label}
      {count != null && (
        <span
          className="mono-num"
          style={{
            fontSize: 12,
            opacity: active ? 0.85 : 0.55,
            fontWeight: 500,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
