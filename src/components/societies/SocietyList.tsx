"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { SocietyWithCount } from "@/lib/queries";
import { societyAbbr, specialtyColor } from "@/lib/society";

// ─── Society Card ─────────────────────────────────────────────────────────────

function SocietyCard({ s }: { s: SocietyWithCount }) {
  const abbr = societyAbbr(s.name);
  const color = specialtyColor(s.specialty);

  return (
    <Link
      href={`/societies/${s.slug}`}
      style={{
        textDecoration: "none",
        display: "flex",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          maxWidth: "100%",
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 12,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          overflow: "hidden",
          color: "inherit",
          minHeight: 142,
        }}
      >
        {/* Header: 영어 이니셜 박스 + 진료과 칩 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: abbr.length > 4 ? 9 : abbr.length > 3 ? 10 : 11,
              letterSpacing: 0.3,
              flexShrink: 0,
            }}
          >
            {abbr}
          </div>
          {s.specialty && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 18,
                padding: "0 6px",
                background: "var(--bm-primary-subtle)",
                color: "var(--bm-primary)",
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 600,
                flexShrink: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.specialty}
            </span>
          )}
        </div>

        {/* 학회명 */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--bm-text-primary)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            flex: 1,
          }}
        >
          {s.name}
        </div>

        {/* 하단 row */}
        <div
          style={{
            paddingTop: 10,
            borderTop: "1px solid var(--bm-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--bm-text-tertiary)",
                marginBottom: 2,
              }}
            >
              예정 학술대회
            </div>
            {s.conference_count > 0 ? (
              <span
                className="mono-num"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--bm-primary)",
                }}
              >
                예정 {s.conference_count}건
              </span>
            ) : (
              <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>
                없음
              </span>
            )}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ color: "var(--bm-text-tertiary)", flexShrink: 0 }}
          >
            <path d="M5 2l4 5-4 5" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ─── SocietyList (main export) ────────────────────────────────────────────────

type Sort = "count" | "name";

export function SocietyList({ societies }: { societies: SocietyWithCount[] }) {
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("count");

  const specialties = useMemo(
    () =>
      [...new Set(societies.filter((s) => s.specialty).map((s) => s.specialty!))]
        .sort((a, b) => a.localeCompare(b, "ko")),
    [societies],
  );

  const filtered = useMemo(() => {
    const base = specialty
      ? societies.filter((s) => s.specialty === specialty)
      : societies;
    if (sort === "count")
      return [...base].sort(
        (a, b) => b.conference_count - a.conference_count,
      );
    return [...base].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [societies, specialty, sort]);

  const withConf = filtered.filter((s) => s.conference_count > 0);
  const withoutConf = filtered.filter((s) => s.conference_count === 0);

  return (
    <div>
      {/* ── 컨트롤 바 ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        {/* 진료과 탭 (가로 스크롤) */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            flexWrap: "nowrap",
            paddingBottom: 4,
            WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
            msOverflowStyle: "none",
            maxWidth: "100%",
            minWidth: 0,
            flex: 1,
          }}
        >
          <TabBtn
            label="전체"
            count={societies.length}
            active={!specialty}
            onClick={() => setSpecialty(null)}
          />
          {specialties.map((sp) => {
            const cnt = societies.filter((s) => s.specialty === sp).length;
            return (
              <TabBtn
                key={sp}
                label={sp}
                count={cnt}
                active={specialty === sp}
                onClick={() => setSpecialty(sp)}
              />
            );
          })}
        </div>

        {/* 정렬 */}
        <div
          style={{
            display: "flex",
            border: "1px solid var(--bm-border)",
            borderRadius: 6,
            overflow: "hidden",
            flexShrink: 0,
            height: 32,
          }}
        >
          {(
            [
              { v: "count", label: "학술대회순" },
              { v: "name", label: "가나다순" },
            ] as { v: Sort; label: string }[]
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setSort(o.v)}
              style={{
                padding: "0 12px",
                fontSize: 12,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                background: sort === o.v ? "var(--bm-primary)" : "var(--bm-bg)",
                color: sort === o.v ? "#fff" : "var(--bm-text-secondary)",
                transition: "all .12s",
                fontFamily: "inherit",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 카드 그리드 — v3: minmax(0,1fr) + 인라인 grid (캐시 회피) ── */}
      {withConf.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 8,
            width: "100%",
            maxWidth: "100%",
            marginBottom: withoutConf.length > 0 ? 24 : 0,
          }}
          className="bm-society-grid-v3"
        >
          {withConf.map((s) => (
            <SocietyCard key={s.id} s={s} />
          ))}
        </div>
      )}

      {/* ── 예정 일정 없는 학회 ─────────────────────────────────────────── */}
      {withoutConf.length > 0 && (
        <>
          {withConf.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
                color: "var(--bm-text-tertiary)",
                fontSize: 12,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--bm-border)",
                }}
              />
              <span>현재 예정 일정 없는 학회</span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "var(--bm-border)",
                }}
              />
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 8,
              width: "100%",
              maxWidth: "100%",
              opacity: 0.65,
            }}
            className="bm-society-grid-v3"
          >
            {withoutConf.map((s) => (
              <SocietyCard key={s.id} s={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TabBtn ───────────────────────────────────────────────────────────────────

function TabBtn({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        height: 32,
        padding: "0 12px",
        border: active
          ? "1.5px solid var(--bm-primary)"
          : "1px solid var(--bm-border)",
        borderRadius: 999,
        background: active ? "var(--bm-primary)" : "var(--bm-bg)",
        color: active ? "#fff" : "var(--bm-text-secondary)",
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all .12s",
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: active
            ? "rgba(255,255,255,0.8)"
            : "var(--bm-text-tertiary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {count}
      </span>
    </button>
  );
}
