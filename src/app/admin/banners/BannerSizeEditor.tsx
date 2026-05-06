"use client";

import { useState, useTransition } from "react";
import { updateBannerSize } from "./actions";

export function BannerSizeEditor({
  id,
  initialWidth,
  initialHeight,
}: {
  id: number;
  initialWidth: number;
  initialHeight: number;
}) {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = width !== initialWidth || height !== initialHeight;

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateBannerSize(id, width, height);
      if (!res.ok) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  const inputStyle: React.CSSProperties = {
    width: 56,
    height: 26,
    padding: "0 6px",
    border: "1px solid var(--bm-border)",
    borderRadius: 4,
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    textAlign: "right",
    outline: "none",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: "var(--bm-text-tertiary)",
        whiteSpace: "nowrap",
      }}
    >
      <input
        type="number"
        value={width}
        min={60}
        max={400}
        step={10}
        onChange={(e) => setWidth(Number(e.target.value))}
        disabled={pending}
        aria-label="너비 (px)"
        style={inputStyle}
      />
      <span>×</span>
      <input
        type="number"
        value={height}
        min={60}
        max={800}
        step={10}
        onChange={(e) => setHeight(Number(e.target.value))}
        disabled={pending}
        aria-label="높이 (px)"
        style={inputStyle}
      />
      <button
        type="button"
        onClick={save}
        disabled={!isDirty || pending}
        style={{
          height: 26,
          padding: "0 8px",
          border: "none",
          borderRadius: 4,
          background: isDirty ? "var(--bm-primary)" : "var(--bm-bg-muted)",
          color: isDirty ? "#fff" : "var(--bm-text-tertiary)",
          fontSize: 10,
          fontWeight: 600,
          cursor: isDirty && !pending ? "pointer" : "default",
          fontFamily: "inherit",
        }}
      >
        {pending ? "..." : saved ? "✓" : "저장"}
      </button>
      {error && (
        <span style={{ color: "var(--bm-danger)", fontSize: 10 }}>
          {error}
        </span>
      )}
    </div>
  );
}
