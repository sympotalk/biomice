"use client";

import { useTransition } from "react";
import { toggleBannerActive, deleteBanner } from "./actions";

export function BannerActions({ id, isActive }: { id: number; isActive: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => toggleBannerActive(id, isActive))}
        style={{
          fontSize: 11,
          padding: "4px 10px",
          borderRadius: 4,
          border: "1px solid var(--bm-border)",
          background: "var(--bm-bg)",
          color: "var(--bm-text-primary)",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.5 : 1,
          fontWeight: 500,
        }}
      >
        {isActive ? "비활성화" : "활성화"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("배너를 삭제하시겠습니까?")) return;
          startTransition(() => deleteBanner(id));
        }}
        style={{
          fontSize: 11,
          padding: "4px 10px",
          borderRadius: 4,
          border: "1px solid var(--bm-danger, #d92b3a)",
          background: "transparent",
          color: "var(--bm-danger, #d92b3a)",
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.5 : 1,
          fontWeight: 500,
        }}
      >
        삭제
      </button>
    </div>
  );
}
