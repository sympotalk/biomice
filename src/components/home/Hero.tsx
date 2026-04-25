"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SpecialtyChip } from "@/components/ui/Chip";
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
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            background: "var(--bm-bg)",
            border: "1px solid var(--bm-border)",
            borderRadius: 999,
            fontSize: 12,
            color: "var(--bm-text-secondary)",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: 3,
              background: "var(--bm-success)",
            }}
          />
          대한의학회(KAMS) 데이터 연동 · 매일 자동 업데이트
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(22px, 5vw, 44px)",
            fontWeight: 800,
            letterSpacing: -0.8,
            lineHeight: 1.25,
            color: "var(--bm-text-primary)",
          }}
        >
          국내 의학 학술대회를
          <br />한 곳에서
        </h1>
        <p
          style={{
            margin: "12px 0 24px",
            fontSize: "clamp(13px, 2vw, 17px)",
            color: "var(--bm-text-secondary)",
            lineHeight: 1.5,
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

        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            className="bm-hero-search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "0 6px 0 14px",
              background: "var(--bm-bg)",
              borderRadius: 12,
              border: "1.5px solid var(--bm-border)",
              boxShadow:
                "0 8px 24px rgba(26,40,60,0.08), 0 2px 4px rgba(26,40,60,0.04)",
            }}
          >
            <SearchIcon
              width={20}
              height={20}
              style={{ color: "var(--bm-text-tertiary)" }}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="학회명, 학술대회명, 키워드 검색"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 16,
                fontFamily: "inherit",
                color: "var(--bm-text-primary)",
              }}
            />
            <Button variant="primary" size="lg" onClick={submit}>
              검색
            </Button>
          </div>
        </div>

        {topSpecialties.length > 0 && (
          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <SpecialtyChip
              label="전체"
              onClick={() => router.push("/conferences")}
            />
            {topSpecialties.map((s) => (
              <SpecialtyChip
                key={s}
                label={s}
                onClick={() =>
                  router.push(`/conferences?category=${encodeURIComponent(s)}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
