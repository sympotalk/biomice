"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { runCrawlerAction } from "./actions";

type AdapterInfo = {
  key: string;
  label: string;
  priority: string;
  specialty: string;
};

type CrawlResult = {
  source: string;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export function CrawlerActions({ adapters }: { adapters: AdapterInfo[] }) {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, CrawlResult | null>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function trigger(sourceKey: string | null, dryRun: boolean) {
    setGlobalError(null);
    const label = sourceKey ?? "ALL";
    setRunning(`${label}-${dryRun ? "dry" : "live"}`);

    startTransition(async () => {
      try {
        const data = await runCrawlerAction(sourceKey, dryRun);

        if (!data.ok) {
          setGlobalError(data.error);
          return;
        }

        const updated: Record<string, CrawlResult | null> = { ...results };
        if (data.result) {
          updated[data.result.source] = data.result;
        } else if (data.results) {
          for (const r of data.results) {
            updated[r.source] = r;
          }
        }
        setResults(updated);
      } catch (e) {
        setGlobalError((e as Error).message);
      } finally {
        setRunning(null);
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 인증 안내 (토큰 입력 카드는 제거됨) */}
      <section
        style={{
          background: "var(--bm-success-subtle)",
          border: "1px solid var(--bm-success)",
          borderRadius: 8,
          padding: 14,
          fontSize: 12,
          color: "var(--bm-text-primary)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--bm-success)" }}>
          ✓ 관리자 세션으로 실행
        </strong>{" "}
        — 이 페이지의 모든 버튼은 server action으로 호출되며, 현재 로그인된
        관리자 권한으로 직접 실행됩니다. CRAWLER_TOKEN 입력 불필요.
        <br />
        <span style={{ color: "var(--bm-text-tertiary)" }}>
          (Cloudflare Cron Trigger는 별도로 CRAWLER_TOKEN secret을 사용해
          /api/cron/intl을 호출합니다)
        </span>
      </section>

      {/* 글로벌 에러 */}
      {globalError && (
        <section
          style={{
            background: "var(--bm-danger-subtle)",
            border: "1px solid var(--bm-danger)",
            borderRadius: 8,
            padding: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "var(--bm-danger)",
                fontWeight: 600,
              }}
            >
              ⚠️ {globalError}
            </div>
            <button
              type="button"
              onClick={() => setGlobalError(null)}
              style={{
                fontSize: 11,
                color: "var(--bm-danger)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </section>
      )}

      {/* 전체 실행 */}
      <section
        style={{
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 8,
          padding: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
            모든 어댑터 일괄 실행
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              color: "var(--bm-text-secondary)",
            }}
          >
            등록된 {adapters.length}개 어댑터를 순차 실행합니다 (어댑터 간 2초
            대기). 약 {adapters.length * 5}초 소요.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => trigger(null, true)}
            disabled={running !== null}
          >
            {running === "ALL-dry" ? "검증 중..." : "Dry-run (검증만)"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (!confirm("실제 DB에 upsert합니다. 진행할까요?")) return;
              trigger(null, false);
            }}
            disabled={running !== null}
          >
            {running === "ALL-live" ? "실행 중..." : "전체 실행 (live)"}
          </Button>
        </div>
      </section>

      {/* 어댑터별 카드 */}
      <section
        style={{
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>
          어댑터별 실행 ({adapters.length}개)
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {adapters.map((a) => {
            const result = results[a.key];
            const isRunning = running?.startsWith(a.key);
            return (
              <div
                key={a.key}
                style={{
                  border: "1px solid var(--bm-border)",
                  borderRadius: 6,
                  padding: 14,
                  background: "var(--bm-bg-muted)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <div
                    className="mono-num"
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--bm-text-primary)",
                    }}
                  >
                    {a.key.toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 3,
                      background:
                        a.priority === "P0"
                          ? "var(--bm-danger-subtle)"
                          : a.priority === "P1"
                          ? "var(--bm-primary-subtle)"
                          : "var(--bm-bg)",
                      color:
                        a.priority === "P0"
                          ? "var(--bm-danger)"
                          : a.priority === "P1"
                          ? "var(--bm-primary)"
                          : "var(--bm-text-secondary)",
                    }}
                  >
                    {a.priority}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--bm-text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  {a.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--bm-text-tertiary)",
                    marginBottom: 10,
                  }}
                >
                  {a.specialty}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => trigger(a.key, true)}
                    disabled={running !== null}
                    style={{
                      flex: 1,
                      height: 28,
                      fontSize: 11,
                      fontWeight: 600,
                      border: "1px solid var(--bm-border)",
                      borderRadius: 4,
                      background: "var(--bm-bg)",
                      color: "var(--bm-text-secondary)",
                      cursor: running ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {isRunning && running?.endsWith("-dry") ? "..." : "Dry"}
                  </button>
                  <button
                    type="button"
                    onClick={() => trigger(a.key, false)}
                    disabled={running !== null}
                    style={{
                      flex: 1,
                      height: 28,
                      fontSize: 11,
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 4,
                      background: "var(--bm-primary)",
                      color: "#fff",
                      cursor: running ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {isRunning && running?.endsWith("-live") ? "..." : "실행"}
                  </button>
                </div>

                {result && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 10px",
                      background: "var(--bm-bg)",
                      border: "1px solid var(--bm-border)",
                      borderRadius: 4,
                      fontSize: 11,
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      className="mono-num"
                      style={{ fontWeight: 700, marginBottom: 2 }}
                    >
                      fetched: {result.fetched} · inserted: {result.inserted}
                      {" · "}updated: {result.updated} · skipped: {result.skipped}
                    </div>
                    {result.errors.length > 0 && (
                      <div
                        style={{
                          marginTop: 4,
                          color: "var(--bm-danger)",
                          fontSize: 10,
                          maxHeight: 60,
                          overflowY: "auto",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {result.errors.slice(0, 3).join("\n")}
                        {result.errors.length > 3 &&
                          ` (+${result.errors.length - 3} more)`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 사용 가이드 */}
      <section
        style={{
          background: "var(--bm-bg-muted)",
          border: "1px dashed var(--bm-border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3 style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700 }}>
          참고
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            fontSize: 12,
            color: "var(--bm-text-secondary)",
            lineHeight: 1.7,
          }}
        >
          <li>
            <strong>Dry-run</strong>: 학회 사이트에서 fetch + parse만 수행, DB
            쓰기 없음. selector 검증 용도.
          </li>
          <li>
            <strong>실행 (live)</strong>: 결과를 DB에 upsert
            (source_type+source_id UNIQUE 키로 중복 방지).
          </li>
          <li>
            학회 사이트의 HTML 구조가 자주 바뀌므로, fetched 수가 0이면 어댑터
            selector 점검 필요. 코드: <code>src/lib/crawler/intl/sources/{`{key}`}.ts</code>
          </li>
          <li>
            자동화 스케줄: 매주 일요일 18:00 UTC (KST 월요일 03:00) — Cloudflare
            Cron Trigger가 모든 P0/P1 어댑터를 순차 실행합니다.
          </li>
        </ul>
      </section>
    </div>
  );
}
