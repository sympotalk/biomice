import type { ReactNode } from "react";
import Link from "next/link";

export function AuthShell({ children, width = 480 }: { children: ReactNode; width?: number }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bm-bg-muted)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 심플 헤더 — 로고만 */}
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid var(--bm-border)",
          background: "var(--bm-bg)",
          flexShrink: 0,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--bm-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            b
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--bm-text-primary)",
              fontFamily: "var(--font-mono)",
              letterSpacing: -0.4,
            }}
          >
            biomice
          </span>
        </Link>
      </header>

      {/* 콘텐츠 */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div style={{ width, maxWidth: "100%" }}>{children}</div>
      </main>

      {/* 푸터 */}
      <footer
        style={{
          padding: 24,
          textAlign: "center",
          fontSize: 12,
          color: "var(--bm-text-tertiary)",
          flexShrink: 0,
        }}
      >
        © 2026 biomice · 데이터 출처: 대한의학회 (KAMS)
      </footer>
    </div>
  );
}
