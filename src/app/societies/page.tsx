import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { listSocieties } from "@/lib/queries";
import { SocietyList } from "@/components/societies/SocietyList";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "학회 목록 · BioMICE",
  description: "BioMICE에 등록된 국내 의학 학회 목록입니다.",
};

export default async function SocietiesPage() {
  const societies = await listSocieties();
  const withConf = societies.filter((s) => s.conference_count > 0).length;

  return (
    <>
      <Header />

      {/* ── Hero bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid var(--bm-border)",
          background: "var(--bm-bg)",
          padding: "28px 24px 24px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 800,
              letterSpacing: -0.6,
              color: "var(--bm-text-primary)",
            }}
          >
            학회 목록
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--bm-text-secondary)" }}>
            총{" "}
            <strong style={{ color: "var(--bm-text-primary)" }}>{societies.length}</strong>개 학회
            ·{" "}
            <strong style={{ color: "var(--bm-primary)" }}>{withConf}</strong>개 학회에서 학술대회
            예정
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px 72px" }}>
        <SocietyList societies={societies} />
      </main>

      <Footer />
    </>
  );
}
