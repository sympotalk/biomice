"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { SocietyWithCount } from "@/lib/queries";

// ─── Logo (이미지 사용 안 함 — 학회명에서 추출한 한글 이니셜만) ──────────────

function SocietyLogo({ name }: { name: string }) {
  // "대한XX학회" → "XX", "한국XX협회" → "XX" 등
  const initials = name
    .replace(/^대한/, "")
    .replace(/^한국/, "")
    .replace(/학회$/, "")
    .replace(/협회$/, "")
    .slice(0, 2);

  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        background: "var(--bm-primary-subtle)",
        color: "var(--bm-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 800,
        flexShrink: 0,
        letterSpacing: -0.3,
      }}
    >
      {initials || name.slice(0, 2)}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function SocietyCard({ s }: { s: SocietyWithCount }) {
  const [hov, setHov] = useState(false);

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
        className="bm-society-card"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          flex: 1,
          minWidth: 0,
          background: "var(--bm-surface)",
          border: `1px solid ${hov ? "var(--bm-primary)" : "var(--bm-border)"}`,
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          transition: "all .15s",
          boxShadow: hov
            ? "0 6px 20px rgba(26,111,170,0.10)"
            : "0 1px 3px rgba(0,0,0,0.03)",
          transform: hov ? "translateY(-3px)" : "none",
          cursor: "pointer",
        }}
      >
        {/* Top: logo + name */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginBottom: 12,
            minWidth: 0,
          }}
        >
          <SocietyLogo name={s.name} />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              maxWidth: "100%",
              overflow: "hidden",
              paddingTop: 2,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--bm-text-primary)",
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                marginBottom: 6,
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {s.name}
            </div>
            {s.specialty && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 18,
                  padding: "0 6px",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--bm-primary)",
                  background: "var(--bm-primary-subtle)",
                  borderRadius: 3,
                }}
              >
                {s.specialty}
              </span>
            )}
          </div>
        </div>

        {/* Bottom: conference count */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid var(--bm-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 12, color: "var(--bm-text-tertiary)" }}>
            예정 학술대회
          </span>
          {s.conference_count > 0 ? (
            <span
              className="mono-num"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--bm-primary)",
              }}
            >
              예정 {s.conference_count}건
            </span>
          ) : (
            <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>없음</span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ color: "var(--bm-text-tertiary)" }}
          >
            <path d="M4 2l4 4-4 4" />
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
    [societies]
  );

  const filtered = useMemo(() => {
    const base = specialty ? societies.filter((s) => s.specialty === specialty) : societies;
    if (sort === "count") return [...base].sort((a, b) => b.conference_count - a.conference_count);
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
          marginBottom: 24,
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
            height: 34,
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
                padding: "0 14px",
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

      {/* ── 카드 그리드 (예정 있는 학회) ─────────────────────────────────── */}
      {withConf.length > 0 && (
        <div className="bm-society-grid" style={{ marginBottom: withoutConf.length > 0 ? 32 : 0 }}>
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
                marginBottom: 16,
                color: "var(--bm-text-tertiary)",
                fontSize: 12,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "var(--bm-border)" }} />
              <span>현재 예정 일정 없는 학회</span>
              <div style={{ flex: 1, height: 1, background: "var(--bm-border)" }} />
            </div>
          )}
          <div className="bm-society-grid" style={{ opacity: 0.65 }}>
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
        height: 34,
        padding: "0 13px",
        border: active ? "1.5px solid var(--bm-primary)" : "1px solid var(--bm-border)",
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
          color: active ? "rgba(255,255,255,0.8)" : "var(--bm-text-tertiary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {count}
      </span>
    </button>
  );
}
