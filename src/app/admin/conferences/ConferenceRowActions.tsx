"use client";

import { useTransition } from "react";
import { toggleFeatured, softDeleteConference, restoreConference } from "./actions";

export function ConferenceRowActions({
  id,
  isFeatured,
  isDeleted,
}: {
  id: number;
  isFeatured: boolean;
  isDeleted: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const btnBase: React.CSSProperties = {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 4,
    cursor: pending ? "default" : "pointer",
    opacity: pending ? 0.5 : 1,
    fontWeight: 500,
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {!isDeleted && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => toggleFeatured(id, isFeatured))}
          style={{
            ...btnBase,
            border: `1px solid ${isFeatured ? "var(--bm-accent-border)" : "var(--bm-border)"}`,
            background: isFeatured ? "var(--bm-accent-subtle)" : "var(--bm-bg)",
            color: isFeatured ? "var(--bm-accent)" : "var(--bm-text-primary)",
          }}
        >
          {isFeatured ? "★ Featured" : "☆ 피처링"}
        </button>
      )}
      {isDeleted ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => restoreConference(id))}
          style={{
            ...btnBase,
            border: "1px solid var(--bm-border)",
            background: "var(--bm-bg)",
            color: "var(--bm-text-primary)",
          }}
        >
          복원
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("학술대회를 숨기겠습니까?")) return;
            startTransition(() => softDeleteConference(id));
          }}
          style={{
            ...btnBase,
            border: "1px solid var(--bm-danger, #d92b3a)",
            background: "transparent",
            color: "var(--bm-danger, #d92b3a)",
          }}
        >
          숨김
        </button>
      )}
    </div>
  );
}
