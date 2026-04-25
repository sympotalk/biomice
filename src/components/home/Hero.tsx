"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchIcon } from "@/components/ui/Icon";

type Props = {
  totalUpcoming?: number;
  topSpecialties?: string[];
};

export function Hero({ totalUpcoming = 0, topSpecialties = [] }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = () => {
    const url = q.trim()
      ? `/conferences?q=${encodeURIComponent(q.trim())}`
      : "/conferences";
    router.push(url);
  };

  return (
    <section
      className="bm-hero"
      style={{
        position: "relative",
        background: "linear-gradient(180deg, #F5F9FC 0%, var(--bm-bg) 100%)",
        borderBottom: "1px solid var(--bm-border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.4,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at top right, rgba(26,111,170,0.08), transparent 60%), radial-gradient(ellipse at bottom left, rgba(180,106,26,0.05), transparent 55%)",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          className="bm-hero-pill"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            background: "var(--bm-primary-subtle)",
            color: "var(--bm-primary)",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: 3,
              background: "var(--bm-primary)",
            }}
          />
          KAMS 자동 연동 · 매일 업데이트
        </div>

        <h1
          className="bm-hero-h1"
          style={{
            margin: 0,
            fontSize: "clamp(22px, 5vw, 44px)",
            fontWeight: 800,
            letterSpacing: -0.6,
            lineHeight: 1.25,
            color: "var(--bm-text-primary)",
          }}
        >
          국내 의학 학술대회를
          <br />한 곳에서
        </h1>
        <p
          style={{
            margin: "10px 0 18px",
            fontSize: "clamp(13px, 2vw, 17px)",
            color: "var(--bm-text-secondary)",
            lineHeight: 1.55,
          }}
        >
          대한의학회 등록 학술대회{" "}
          <strong
            className="mono-num"
            style={{ color: "var(--bm-primary)", fontWeight: 700 }}
          >
            {totalUpcoming}건
          </strong>
          을 한눈에
        </p>

        {/* 검색바 — 모바일에서 절대 잘리지 않도록 */}
        <div className="bm-hero-search-wrap">
          <div
            className="bm-hero-search"
            style={{
              display: "flex",
              alignItems: "center",
              padding: 4,
              background: "var(--bm-bg)",
              borderRadius: 8,
              border: "1.5px solid var(--bm-border)",
              boxShadow: "0 4px 12px rgba(26,40,60,0.05)",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 10px",
              }}
            >
              <SearchIcon
                width={16}
                height={16}
                style={{ color: "var(--bm-text-tertiary)", flexShrink: 0 }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="학회·키워드 검색"
                style={{
                  flex: 1,
                  minWidth: 0,
                  width: "100%",
                  height: 40,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                  fontFamily: "inherit",
                  color: "var(--bm-text-primary)",
                }}
              />
            </div>
            <button
              onClick={submit}
              type="button"
              style={{
                flexShrink: 0,
                height: 40,
                padding: "0 14px",
                border: "none",
                borderRadius: 6,
                background: "var(--bm-primary)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              검색
            </button>
          </div>
        </div>

        {/* 진료과 칩 — 모바일은 가로 스크롤, 데스크톱은 wrap */}
        {topSpecialties.length > 0 && (
          <div className="bm-hero-chips">
            <div className="bm-hero-chips-inner">
              <Chip
                label="전체"
                onClick={() => router.push("/conferences")}
              />
              {topSpecialties.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onClick={() =>
                    router.push(`/conferences?category=${encodeURIComponent(s)}`)
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        height: 32,
        padding: "0 14px",
        borderRadius: 999,
        border: "1px solid var(--bm-border)",
        background: "var(--bm-bg)",
        color: "var(--bm-text-secondary)",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
