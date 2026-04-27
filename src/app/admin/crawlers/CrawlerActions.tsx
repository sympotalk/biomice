"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

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

const TOKEN_STORAGE_KEY = "bm-crawler-token";

export function CrawlerActions({ adapters }: { adapters: AdapterInfo[] }) {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, CrawlResult | null>>({});
  const [token, setToken] = useState("");
  const [tokenStored, setTokenStored] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<string | null>(null);
  const [authError, setAuthError] = useState<{
    code: string;
    reason: string;
  } | null>(null);

  // 페이지 로드 시 localStorage에서 자동 로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (saved) {
      setToken(saved);
      setTokenStored(true);
    }
  }, []);

  function saveToken() {
    if (!token.trim()) {
      setTokenStatus("토큰이 비어있습니다");
      return;
    }
    // 명시적 trim — wrangler secret put 시 stdin 줄바꿈 사고 방지
    const cleaned = token.trim();
    if (cleaned !== token) {
      setToken(cleaned);
    }
    window.localStorage.setItem(TOKEN_STORAGE_KEY, cleaned);
    setTokenStored(true);
    setTokenStatus("✓ 저장됨");
    setTimeout(() => setTokenStatus(null), 2000);
  }

  function clearToken() {
    if (!confirm("저장된 토큰을 삭제할까요?")) return;
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken("");
    setTokenStored(false);
    setTokenStatus("✓ 삭제됨");
    setTimeout(() => setTokenStatus(null), 2000);
  }

  async function trigger(sourceKey: string | null, dryRun: boolean) {
    setAuthError(null);
    const label = sourceKey ?? "ALL";
    setRunning(`${label}-${dryRun ? "dry" : "live"}`);
    try {
      const params = new URLSearchParams();
      if (token.trim()) params.set("token", token.trim());
      if (sourceKey) params.set("source", sourceKey);
      if (dryRun) params.set("dryRun", "1");

      const res = await fetch(`/api/cron/intl?${params.toString()}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 && data.code) {
          // 진단 메시지를 UI에 표시
          setAuthError({ code: data.code, reason: data.reason });
        } else {
          alert(`실패: ${data.error ?? res.statusText}`);
        }
        return;
      }

      const updated: Record<string, CrawlResult | null> = { ...results };
      if (data.result) {
        updated[data.result.source] = data.result;
      } else if (data.results) {
        for (const r of data.results as CrawlResult[]) {
          updated[r.source] = r;
        }
      }
      setResults(updated);
    } catch (e) {
      alert(`에러: ${(e as Error).message}`);
    } finally {
      setRunning(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Token input — 저장/삭제 + 표시 토글 */}
      <section
        style={{
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
            CRAWLER_TOKEN
          </h3>
          {tokenStored && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--bm-success)",
                background: "var(--bm-success-subtle)",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              ✓ 브라우저에 저장됨
            </span>
          )}
        </div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12,
            color: "var(--bm-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          /api/cron/intl 엔드포인트 호출용 토큰. <strong>저장</strong>을 누르면
          이 브라우저의 localStorage에만 보관되며 (다른 사용자/기기에는 전송
          안 됨), 다음 방문 시 자동으로 입력됩니다. 앞뒤 공백은 자동으로
          제거됩니다.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type={showToken ? "text" : "password"}
            placeholder="Cloudflare에 등록한 CRAWLER_TOKEN"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveToken();
            }}
            style={{
              flex: 1,
              minWidth: 280,
              maxWidth: 480,
              height: 36,
              padding: "0 12px",
              border: "1px solid var(--bm-border)",
              borderRadius: 6,
              fontSize: 13,
              fontFamily: "var(--font-mono)",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShowToken((v) => !v)}
            style={{
              height: 36,
              padding: "0 12px",
              border: "1px solid var(--bm-border)",
              borderRadius: 6,
              background: "var(--bm-bg)",
              fontSize: 12,
              fontFamily: "inherit",
              cursor: "pointer",
              color: "var(--bm-text-secondary)",
            }}
          >
            {showToken ? "숨김" : "보이기"}
          </button>
          <Button variant="primary" size="sm" onClick={saveToken}>
            저장
          </Button>
          {tokenStored && (
            <Button variant="outline" size="sm" onClick={clearToken}>
              삭제
            </Button>
          )}
          {tokenStatus && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: tokenStatus.startsWith("✓")
                  ? "var(--bm-success)"
                  : "var(--bm-danger)",
              }}
            >
              {tokenStatus}
            </span>
          )}
        </div>
      </section>

      {/* Auth 진단 패널 — 401 응답 발생 시만 표시 */}
      {authError && (
        <section
          style={{
            background: "var(--bm-danger-subtle)",
            border: "1px solid var(--bm-danger)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: "var(--bm-danger)",
              }}
            >
              ⚠️ 인증 실패 ({authError.code})
            </h3>
            <button
              type="button"
              onClick={() => setAuthError(null)}
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
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 12,
              color: "var(--bm-text-primary)",
              lineHeight: 1.6,
            }}
          >
            {authError.reason}
          </p>
          {authError.code === "no-env" && (
            <pre
              style={{
                margin: 0,
                padding: 10,
                background: "var(--bm-bg)",
                border: "1px solid var(--bm-border)",
                borderRadius: 4,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--bm-text-secondary)",
                whiteSpace: "pre-wrap",
              }}
            >
              {`# 로컬에서 새 토큰 등록:\nnpx wrangler secret put CRAWLER_TOKEN\n# (프롬프트에서 토큰 값 붙여넣기)\n\n# 또는 Cloudflare 대시보드에서:\n#   Workers & Pages > biomice > Settings > Variables > Secret > Add\n#   변수명: CRAWLER_TOKEN\n\n# 등록 후 30초~1분 대기 후 다시 시도`}
            </pre>
          )}
          {authError.code === "mismatch" && (
            <ul
              style={{
                margin: "8px 0 0",
                paddingLeft: 18,
                fontSize: 11,
                color: "var(--bm-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              <li>
                Cloudflare 대시보드에서 CRAWLER_TOKEN을 다시 확인 (Workers &
                Pages → biomice → Settings → Variables)
              </li>
              <li>토큰의 앞뒤 공백/줄바꿈 — 서버는 이미 trim 처리했지만 등록 시 줄바꿈이 들어갔을 수 있음</li>
              <li>방금 새 토큰으로 변경했다면 Worker 재배포 또는 1분 대기 (반영 지연)</li>
            </ul>
          )}
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
                          : "var(--bm-bg)",
                      color:
                        a.priority === "P0"
                          ? "var(--bm-danger)"
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
            cURL: <code>POST /api/cron/intl?token=$CRAWLER_TOKEN&source=esmo</code>
          </li>
        </ul>
      </section>
    </div>
  );
}
