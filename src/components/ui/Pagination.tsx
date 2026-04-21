"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icon";

type Props = {
  current?: number;
  total: number;
  onChange?: (page: number) => void;
};

function PageButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  label?: string;
  children: ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minWidth: 36,
        height: 36,
        padding: "0 10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        background: active
          ? "var(--bm-primary)"
          : hov && !disabled
          ? "var(--bm-bg-muted)"
          : "transparent",
        color: active
          ? "#fff"
          : disabled
          ? "var(--bm-text-tertiary)"
          : "var(--bm-text-primary)",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        fontFamily: "var(--font-mono)",
        transition: "all .12s",
      }}
    >
      {children}
    </button>
  );
}

export function Pagination({ current = 1, total, onChange }: Props) {
  if (total <= 1) return null;
  const pages: (number | "…")[] = [];
  const range = 2;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - range && i <= current + range)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <PageButton
        disabled={current === 1}
        onClick={() => onChange?.(current - 1)}
        label="이전"
      >
        <ChevronLeftIcon />
      </PageButton>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`e${i}`}
            style={{ color: "var(--bm-text-tertiary)", padding: "0 4px" }}
          >
            …
          </span>
        ) : (
          <PageButton key={p} active={p === current} onClick={() => onChange?.(p)}>
            {p}
          </PageButton>
        ),
      )}
      <PageButton
        disabled={current === total}
        onClick={() => onChange?.(current + 1)}
        label="다음"
      >
        <ChevronRightIcon />
      </PageButton>
    </div>
  );
}
