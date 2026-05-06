"use client";

import { useState, useTransition } from "react";
import { crawlHospitalAction } from "./actions";
import type { CrawlHospitalResult } from "./actions";

type HospitalMeta = {
  code: string;
  name: string;
  region: string;
  hasAdapter: boolean;
  doctorCount: number | null;
  lastCrawledAt: string | null;
};

type Props = {
  hospitals: HospitalMeta[];
};

const REGION_ORDER = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "기타"];

export function HospitalCrawlerPanel({ hospitals }: Props) {
  const [results, setResults] = useState<Record<string, CrawlHospitalResult>>({});
  const [running, setRunning] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [filterRegion, setFilterRegion] = useState<string>("전체");
  const [onlyAdapted, setOnlyAdapted] = useState(false);

  const regions = ["전체", ...REGION_ORDER];

  const filtered = hospitals.filter((h) => {
    if (filterRegion !== "전체" && h.region !== filterRegion) return false;
    if (onlyAdapted && !h.hasAdapter) return false;
    return true;
  });

  const handleCrawl = (code: string, dryRun: boolean) => {
    setRunning((prev) => new Set(prev).add(code));
    startTransition(async () => {
      const result = await crawlHospitalAction(code, dryRun);
      setResults((prev) => ({ ...prev, [code]: result }));
      setRunning((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    });
  };

  const adaptedCount = hospitals.filter((h) => h.hasAdapter).length;
  const crawledCount = hospitals.filter((h) => h.doctorCount && h.doctorCount > 0).length;

  return (
    <div>
      {/* 요약 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <StatBox label="전체 병원" value={String(hospitals.length)} />
        <StatBox label="어댑터 구현" value={String(adaptedCount)} accent />
        <StatBox label="크롤 완료" value={String(crawledCount)} />
        <StatBox label="총 의사" value={String(hospitals.reduce((s, h) => s + (h.doctorCount ?? 0), 0))} />
      </div>

      {/* 필터 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRegion(r)}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                border: filterRegion === r ? "none" : "1px solid var(--bm-border)",
                background: filterRegion === r ? "var(--bm-primary)" : "var(--bm-surface)",
                color: filterRegion === r ? "#fff" : "var(--bm-text-secondary)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={onlyAdapted}
            onChange={(e) => setOnlyAdapted(e.target.checked)}
          />
          어댑터 구현된 병원만
        </label>
      </div>

      {/* 병원 테이블 */}
      <div
        style={{
          border: "1px solid var(--bm-border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--bm-bg-muted)" }}>
              <th style={thStyle}>병원</th>
              <th style={thStyle}>지역</th>
              <th style={thStyle}>어댑터</th>
              <th style={thStyle}>의사 수</th>
              <th style={thStyle}>최근 크롤</th>
              <th style={thStyle}>액션</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => {
              const res = results[h.code];
              const isRunning = running.has(h.code);
              return (
                <tr
                  key={h.code}
                  style={{
                    background: i % 2 === 0 ? "var(--bm-surface)" : "var(--bm-bg-muted, #fafafa)",
                    borderTop: "1px solid var(--bm-border)",
                  }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600 }}>{h.name}</span>
                    <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)", marginLeft: 6 }}>
                      {h.code}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "var(--bm-text-secondary)" }}>{h.region}</td>
                  <td style={tdStyle}>
                    {h.hasAdapter ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "#E8F9EE",
                          color: "#2D9D5A",
                        }}
                      >
                        구현됨
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>
                        미구현
                      </span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "var(--font-mono)", textAlign: "right" }}>
                    {h.doctorCount != null ? `${h.doctorCount.toLocaleString()}명` : "—"}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--bm-text-secondary)", fontSize: 11 }}>
                    {h.lastCrawledAt
                      ? new Date(h.lastCrawledAt).toLocaleDateString("ko-KR")
                      : "—"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {h.hasAdapter && (
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <ActionButton
                          label="dry-run"
                          onClick={() => handleCrawl(h.code, true)}
                          disabled={isRunning || isPending}
                          ghost
                        />
                        <ActionButton
                          label={isRunning ? "실행 중…" : "크롤"}
                          onClick={() => handleCrawl(h.code, false)}
                          disabled={isRunning || isPending}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 결과 로그 */}
      {Object.keys(results).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700 }}>크롤 결과</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.values(results)
              .slice()
              .reverse()
              .map((r) => (
                <ResultRow key={`${r.code}-${r.durationMs}`} result={r} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ result: r }: { result: CrawlHospitalResult }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: `1px solid ${r.ok ? "var(--bm-border)" : "#FCA5A5"}`,
        background: r.ok ? "var(--bm-surface)" : "#FEF2F2",
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700 }}>{r.hospitalName}</span>
        {r.ok ? (
          <>
            <Tag color="#2D9D5A" bg="#E8F9EE">
              +{r.inserted}건 신규
            </Tag>
            {r.updated > 0 && (
              <Tag color="#1A73E8" bg="#E8F4FD">
                ~{r.updated}건 갱신
              </Tag>
            )}
            {r.skipped > 0 && (
              <Tag color="#888" bg="#F0F0F0">
                {r.skipped}건 스킵
              </Tag>
            )}
            <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>
              {(r.durationMs / 1000).toFixed(1)}s
            </span>
          </>
        ) : (
          <span style={{ color: "#E05151", fontSize: 12 }}>{r.error}</span>
        )}
      </div>
    </div>
  );
}

function Tag({
  color,
  bg,
  children,
}: {
  color: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 999,
        background: bg,
        color,
      }}
    >
      {children}
    </span>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "var(--bm-bg-muted)",
        borderRadius: 8,
        border: "1px solid var(--bm-border)",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: accent ? "var(--bm-primary)" : "var(--bm-text-primary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--bm-text-tertiary)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  ghost,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  ghost?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "4px 10px",
        borderRadius: 6,
        border: ghost ? "1px solid var(--bm-border)" : "none",
        background: ghost ? "var(--bm-surface)" : "var(--bm-primary)",
        color: ghost ? "var(--bm-text-secondary)" : "#fff",
        fontSize: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--bm-text-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "middle",
};
