"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  categories: { category: string; count: number }[];
  cities: { city: string; count: number }[];
  currentCategory?: string;
  currentCity?: string;
  currentDate?: string;
};

const DATE_PRESETS = [
  { label: "이번 달", value: "this-month" },
  { label: "다음 달", value: "next-month" },
  { label: "3개월", value: "3-months" },
  { label: "6개월", value: "6-months" },
];

export function ListSidebar({
  categories,
  cities,
  currentCategory,
  currentCity,
  currentDate,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [specialtyQ, setSpecialtyQ] = useState("");

  const hasFilters = currentCategory || currentCity || currentDate;

  const go = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page");
    router.push(`/conferences${params.size ? `?${params.toString()}` : ""}`);
  };

  const reset = () => go({ category: undefined, city: undefined, date: undefined, q: undefined });

  const filtered = categories.filter(
    (c) => !specialtyQ || c.category.includes(specialtyQ)
  );

  return (
    <aside
      style={{
        width: 300,
        flexShrink: 0,
        position: "sticky",
        top: 88,
        maxHeight: "calc(100vh - 108px)",
        overflowY: "auto",
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 8,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--bm-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "var(--bm-surface)",
          zIndex: 1,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>필터</h3>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--bm-text-secondary)",
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            모두 초기화
          </button>
        )}
      </div>

      {/* 진료과 */}
      <FilterSection
        title="진료과"
        count={currentCategory ? 1 : 0}
      >
        <div style={{ marginBottom: 10 }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={specialtyQ}
              onChange={(e) => setSpecialtyQ(e.target.value)}
              placeholder="진료과 검색"
              style={{
                width: "100%",
                height: 32,
                padding: "0 10px 0 30px",
                borderRadius: 4,
                border: "1px solid var(--bm-border)",
                background: "var(--bm-bg)",
                fontSize: 12,
                color: "var(--bm-text-primary)",
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              stroke="var(--bm-text-tertiary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="5.5" cy="5.5" r="4" />
              <path d="M9 9l2.5 2.5" />
            </svg>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {/* 전체 option */}
          <SidebarCheckRow
            label="전체"
            checked={!currentCategory}
            count={categories.reduce((s, c) => s + c.count, 0)}
            onClick={() => go({ category: undefined })}
          />
          {filtered.map((c) => (
            <SidebarCheckRow
              key={c.category}
              label={c.category}
              checked={currentCategory === c.category}
              count={c.count}
              onClick={() =>
                go({
                  category: currentCategory === c.category ? undefined : c.category,
                })
              }
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--bm-text-tertiary)", padding: "8px 6px" }}>
              결과 없음
            </div>
          )}
        </div>
      </FilterSection>

      {/* 개최 도시 */}
      {cities.length > 0 && (
        <FilterSection title="개최 도시">
          <select
            value={currentCity ?? ""}
            onChange={(e) => go({ city: e.target.value || undefined })}
            style={{
              width: "100%",
              height: 36,
              padding: "0 10px",
              borderRadius: 4,
              border: "1px solid var(--bm-border)",
              background: "var(--bm-bg)",
              color: "var(--bm-text-primary)",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="">전국 (전체)</option>
            {cities.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.count})
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* 기간 */}
      <FilterSection title="기간">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => go({ date: undefined })}
            style={presetBtn(!currentDate)}
          >
            전체
          </button>
          {DATE_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() =>
                go({ date: currentDate === p.value ? undefined : p.value })
              }
              style={presetBtn(currentDate === p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}

// ─── FilterSection ────────────────────────────────────────────────────────────

function FilterSection({
  title,
  count = 0,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: "1px solid var(--bm-border)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "14px 20px",
          border: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          color: "var(--bm-text-primary)",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {title}
          {count > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                background: "var(--bm-primary)",
                color: "#fff",
                borderRadius: 9,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {count}
            </span>
          )}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: "var(--bm-text-tertiary)",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform .15s",
            flexShrink: 0,
          }}
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open && <div style={{ padding: "0 20px 16px" }}>{children}</div>}
    </div>
  );
}

// ─── SidebarCheckRow ──────────────────────────────────────────────────────────

function SidebarCheckRow({
  label,
  checked,
  count,
  onClick,
}: {
  label: string;
  checked: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 6px",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 13,
        color: "var(--bm-text-primary)",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "var(--bm-bg-muted)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "transparent")
      }
    >
      <span
        onClick={onClick}
        role="checkbox"
        aria-checked={checked}
        style={{
          width: 16,
          height: 16,
          borderRadius: 3,
          flexShrink: 0,
          border: `1.5px solid ${checked ? "var(--bm-primary)" : "var(--bm-border)"}`,
          background: checked ? "var(--bm-primary)" : "var(--bm-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all .12s",
        }}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 5l2 2 4-4" />
          </svg>
        )}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      <span
        className="mono-num"
        style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}
      >
        {count.toLocaleString()}
      </span>
    </label>
  );
}

// ─── preset button style ──────────────────────────────────────────────────────

function presetBtn(active: boolean): React.CSSProperties {
  return {
    height: 28,
    padding: "0 12px",
    border: active ? "1.5px solid var(--bm-primary)" : "1px solid var(--bm-border)",
    borderRadius: 999,
    background: active ? "var(--bm-primary-subtle)" : "var(--bm-bg)",
    color: active ? "var(--bm-primary)" : "var(--bm-text-secondary)",
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    transition: "all .12s",
  };
}
