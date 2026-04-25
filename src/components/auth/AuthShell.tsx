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
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="바이오마이스 BioMICE" height={30} style={{ display: "block" }} />
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
        © 2026 BioMICE · 데이터 출처: 대한의학회 (KAMS)
      </footer>
    </div>
  );
}
