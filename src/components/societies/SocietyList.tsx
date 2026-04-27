"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { SocietyWithCount } from "@/lib/queries";
import { societyAbbr, specialtyColor } from "@/lib/society";

// ─── Society Card (가로형 row — 항상 1열 stack) ─────────────────────────────

function SocietyCard({ s }: { s: SocietyWithCount }) {
  const abbr = societyAbbr(s.name);
  const color = specialtyColor(s.specialty);
  const isLong = abbr.length > 4;

  return (
    <Link
      href={`/societies/${s.slug}`}
      style={{
        display: "block",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        textDecoration: "none",
        color: "inherit",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 12,
          padding: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          overflow: "hidden",
        }}
      >
        {/* 영문 약자 박스 */}
        <div
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: 8,
            background: color,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            fontSize: isLong ? 10 : 12,
            letterSpacing: 0.3,
          }}
        >
          {abbr}
        </div>

        {/* 가운데: 진료과 칩 + 학회명 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {s.specialty && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                alignSelf: "flex-start",
                height: 18,
                padding: "0 6px",
                background: "var(--bm-primary-subtle)",
                color: "var(--bm-primary)",
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 600,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.specialty}
            </span>
          )}
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--bm-text-primary)",
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {s.name}
          </div>
        </div>

        {/* 우측: 카운트 + chevron */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {s.conference_count > 0 ? (
            <span
              className="mono-num"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                background: "var(--bm-primary)",
                padding: "3px 8px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              {s.conference_count}건
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                color: "var(--bm-text-tertiary)",
                whiteSpace: "nowrap",
              }}
            >
              없음
            </span>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ color: "var(--bm-text-tertiary)" }}
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
    <div style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
      {/* ── 컨트롤 바 ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          maxWidth: "100%",
          minWidth: 0,
        }}
      >
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

      {/* ── 카드 stack — 1열 강제 (모바일 안정성 우선) ────────────────────── */}
      {withConf.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            marginBottom: withoutConf.length > 0 ? 24 : 0,
          }}
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
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              opacity: 0.65,
            }}
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
