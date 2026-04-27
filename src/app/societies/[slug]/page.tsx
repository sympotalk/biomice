import { notFound } from "next/navigation";
import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { ConferenceGrid } from "@/components/home/ConferenceGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExternalIcon } from "@/components/ui/Icon";
import { DDayBadge } from "@/components/ui/Badge";
import {
  getSocietyBySlug,
  getSocietyConferences,
  getMyBookmarkIds,
} from "@/lib/queries";
import { computeDDay } from "@/lib/dates";
import { societyAbbr, specialtyColor } from "@/lib/society";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const society = await getSocietyBySlug(slug);
  if (!society) return { title: "학회 정보를 찾을 수 없습니다" };
  return {
    title: `${society.name} · biomice`,
    description: society.description ?? `${society.name}의 학술대회 일정을 확인하세요.`,
  };
}

export default async function SocietyDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [society, bookmarkedIds] = await Promise.all([
    getSocietyBySlug(slug),
    getMyBookmarkIds(),
  ]);

  if (!society) notFound();

  const [upcomingConfs, pastConfs] = await Promise.all([
    getSocietyConferences(society.id, "upcoming"),
    getSocietyConferences(society.id, "all"),
  ]);
  const past = pastConfs.filter(
    (c) => !upcomingConfs.find((u) => u.id === c.id),
  ).reverse();

  const nextConf = upcomingConfs[0];

  return (
    <>
      <Header />
      <main
        className="bm-main"
        style={{ paddingTop: 24, paddingBottom: 64 }}
      >
        {/* Breadcrumb */}
        <nav
          style={{
            fontSize: 12,
            color: "var(--bm-text-tertiary)",
            marginBottom: 20,
            display: "flex",
            gap: 6,
          }}
        >
          <Link href="/" style={{ color: "var(--bm-text-tertiary)", textDecoration: "none" }}>홈</Link>
          <span>/</span>
          <Link href="/societies" style={{ color: "var(--bm-text-tertiary)", textDecoration: "none" }}>학회</Link>
          <span>/</span>
          <span>{society.name}</span>
        </nav>

        {/* 학회 헤더 카드 */}
        <section
          style={{
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 12,
            padding: "20px",
            marginBottom: 24,
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* 아바타 (영문 약자 박스) */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 14,
              background: specialtyColor(society.specialty),
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: societyAbbr(society.name).length > 4 ? 14 : 16,
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              letterSpacing: 0.5,
              flexShrink: 0,
            }}
          >
            {societyAbbr(society.name)}
          </div>

          <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(20px,3vw,28px)",
                  fontWeight: 700,
                  letterSpacing: -0.4,
                  color: "var(--bm-text-primary)",
                }}
              >
                {society.name}
              </h1>
              {society.is_verified && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#0d9488",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  인증 학회
                </span>
              )}
            </div>

            {society.specialty && (
              <span
                style={{
                  display: "inline-block",
                  fontSize: 12,
                  color: "var(--bm-primary)",
                  background: "var(--bm-primary-subtle)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  marginBottom: 12,
                }}
              >
                {society.specialty}
              </span>
            )}

            {society.description && (
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--bm-text-secondary)",
                }}
              >
                {society.description}
              </p>
            )}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {society.website_url && (
                <a href={society.website_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" iconRight={<ExternalIcon />}>
                    학회 홈페이지
                  </Button>
                </a>
              )}
              {nextConf && (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--bm-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  다음 학술대회까지
                  <DDayBadge days={computeDDay(nextConf.start_date)} />
                </div>
              )}
            </div>
          </div>

          {/* 통계 */}
          <div
            style={{
              display: "flex",
              gap: 24,
              padding: "16px 20px",
              background: "var(--bm-bg)",
              border: "1px solid var(--bm-border)",
              borderRadius: 8,
              flexShrink: 0,
            }}
          >
            <StatBox label="예정 학술대회" value={upcomingConfs.length} />
            <StatBox label="전체 학술대회" value={pastConfs.length} />
          </div>
        </section>

        {/* 예정 학술대회 */}
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              margin: "0 0 20px",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: -0.3,
              color: "var(--bm-text-primary)",
            }}
          >
            예정 학술대회
          </h2>
          {upcomingConfs.length > 0 ? (
            <ConferenceGrid conferences={upcomingConfs} bookmarkedIds={bookmarkedIds} />
          ) : (
            <EmptyState
              title="예정된 학술대회가 없습니다"
              description="새로운 학술대회 일정이 등록되면 여기에 표시됩니다."
            />
          )}
        </section>

        {/* 지난 학술대회 */}
        {past.length > 0 && (
          <section>
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: -0.3,
                color: "var(--bm-text-secondary)",
              }}
            >
              지난 학술대회
            </h2>
            <ConferenceGrid conferences={past.slice(0, 6)} bookmarkedIds={bookmarkedIds} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--bm-text-primary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--bm-text-tertiary)", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
