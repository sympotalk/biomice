import { notFound } from "next/navigation";
import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { AdBanner } from "@/components/ui/AdBanner";
import {
  DDayBadge,
  FeaturedBadge,
  RegistrationOpenBadge,
} from "@/components/ui/Badge";
import { ExternalIcon } from "@/components/ui/Icon";
import { getConference, getBannerForSlot, getMyBookmarkIds } from "@/lib/queries";
import { FavoriteHeart } from "@/components/ui/FavoriteHeart";
import { StickyDetailCTA } from "@/components/conferences/StickyDetailCTA";
import {
  computeDDay,
  formatKoreanDate,
  isRegistrationOpen,
} from "@/lib/dates";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const conf = await getConference(Number(id));
  if (!conf) return { title: "학술대회 정보를 찾을 수 없습니다" };
  return {
    title: `${conf.event_name} · BioMICE`,
    description: `${conf.society_name} · ${formatKoreanDate(conf.start_date)}${
      conf.venue ? ` · ${conf.venue}` : ""
    }`,
  };
}

export default async function ConferenceDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  const [conf, sideBanner, bookmarkedIds] = await Promise.all([
    getConference(numId),
    getBannerForSlot("detail_bottom"),
    getMyBookmarkIds(),
  ]);
  if (!conf) notFound();

  const isBookmarked = bookmarkedIds.has(numId);
  const dd = computeDDay(conf.start_date);
  const regOpen = isRegistrationOpen(conf.start_date, conf.registration_url);

  return (
    <>
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="bm-detail-hero"
        style={{
          background: conf.is_featured
            ? "linear-gradient(180deg, var(--bm-accent-subtle) 0%, var(--bm-bg) 100%)"
            : "linear-gradient(180deg, #F5F9FC 0%, var(--bm-bg) 100%)",
          borderBottom: "1px solid var(--bm-border)",
          padding: "24px 0 32px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          {/* Breadcrumb */}
          <nav
            style={{
              fontSize: 12,
              color: "var(--bm-text-tertiary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ color: "var(--bm-text-tertiary)", textDecoration: "none" }}>
              홈
            </Link>
            <span style={{ opacity: 0.5 }}>/</span>
            <Link href="/conferences" style={{ color: "var(--bm-text-tertiary)", textDecoration: "none" }}>
              학술대회
            </Link>
            {conf.category && (
              <>
                <span style={{ opacity: 0.5 }}>/</span>
                <Link
                  href={`/conferences?category=${encodeURIComponent(conf.category)}`}
                  style={{ color: "var(--bm-text-tertiary)", textDecoration: "none" }}
                >
                  {conf.category}
                </Link>
              </>
            )}
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: "var(--bm-text-primary)", fontWeight: 600 }}>
              {conf.event_name}
            </span>
          </nav>

          {/* Title row */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badges */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {conf.is_featured && <FeaturedBadge variant="featured" />}
                {regOpen && <RegistrationOpenBadge />}
                <DDayBadge days={dd} />
                {conf.category && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      height: 24,
                      padding: "0 10px",
                      background: "var(--bm-primary-subtle)",
                      color: "var(--bm-primary)",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {conf.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(22px, 4vw, 34px)",
                  fontWeight: 800,
                  letterSpacing: -0.8,
                  lineHeight: 1.2,
                  color: "var(--bm-text-primary)",
                }}
              >
                {conf.event_name}
              </h1>

              {/* Society */}
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                {conf.society_url ? (
                  <a
                    href={conf.society_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--bm-primary)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {conf.society_name}
                    <ExternalIcon style={{ display: "inline-block" }} />
                  </a>
                ) : (
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--bm-text-primary)",
                    }}
                  >
                    {conf.society_name}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons (top-right) */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <FavoriteHeart active={isBookmarked} conferenceId={conf.id} size={40} />
              {conf.detail_url && (
                <a href={conf.detail_url} target="_blank" rel="noopener noreferrer">
                  <button
                    type="button"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      border: "1px solid var(--bm-border)",
                      background: "var(--bm-bg)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--bm-text-secondary)",
                    }}
                    aria-label="공유"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="4" cy="8" r="2" />
                      <circle cx="12" cy="4" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 7l4-2M6 9l4 2" />
                    </svg>
                  </button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2-column body ────────────────────────────────────────────────── */}
      <div
        className="bm-detail-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 24px 64px",
        }}
      >
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* 일정 정보 */}
          <div
            style={{
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-border)",
              borderRadius: 8,
              padding: 20,
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>일정 정보</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                rowGap: 12,
                columnGap: 16,
                fontSize: 13,
              }}
            >
              <div style={{ color: "var(--bm-text-tertiary)" }}>개최일</div>
              <div className="mono-num" style={{ color: "var(--bm-text-primary)", fontWeight: 500 }}>
                {formatKoreanDate(conf.start_date)}
                {conf.end_date ? ` – ${formatKoreanDate(conf.end_date)}` : ""}
              </div>
              {conf.venue && (
                <>
                  <div style={{ color: "var(--bm-text-tertiary)" }}>장소</div>
                  <div style={{ color: "var(--bm-text-primary)" }}>
                    {conf.venue}
                    {conf.city && (
                      <div style={{ fontSize: 12, color: "var(--bm-text-secondary)", marginTop: 2 }}>
                        {conf.city}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 행사 개요 */}
          {conf.description && (
            <div
              style={{
                background: "var(--bm-surface)",
                border: "1px solid var(--bm-border)",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>행사 개요</h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--bm-text-secondary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {conf.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────────── */}
        <aside
          style={{
            position: "sticky",
            top: 88,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >

          {/* CTA card */}
          <div
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
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 12, color: "var(--bm-text-tertiary)" }}>
                {dd !== null && dd <= 7 && dd >= 0 ? "사전등록 임박" : "개최일"}
              </div>
              <DDayBadge days={dd} />
            </div>

            <div
              className="mono-num"
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "var(--bm-text-primary)",
                letterSpacing: -0.4,
                lineHeight: 1,
              }}
            >
              {formatKoreanDate(conf.start_date)}
            </div>
            {conf.end_date && (
              <div style={{ fontSize: 12, color: "var(--bm-text-secondary)", marginTop: 4 }}>
                ~ {formatKoreanDate(conf.end_date)}
              </div>
            )}
            {conf.venue && (
              <div style={{ fontSize: 12, color: "var(--bm-text-tertiary)", marginTop: 6 }}>
                {conf.venue}
              </div>
            )}

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {conf.registration_url && (
                <a
                  href={conf.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block" }}
                >
                  <Button variant="primary" size="lg" iconRight={<ExternalIcon />} fullWidth>
                    사전등록 하러 가기
                  </Button>
                </a>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <a href={`/api/ics/${conf.id}`} download style={{ display: "block" }}>
                  <Button variant="outline" size="sm" fullWidth>
                    캘린더 추가
                  </Button>
                </a>
                <div
                  style={{
                    height: 32,
                    border: "1px solid var(--bm-border)",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FavoriteHeart active={isBookmarked} conferenceId={conf.id} size={30} />
                </div>
              </div>
            </div>

            {conf.registration_url && (
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 11,
                  color: "var(--bm-text-tertiary)",
                  lineHeight: 1.5,
                }}
              >
                외부 링크로 이동합니다. BioMICE는 등록 처리에 관여하지 않습니다.
              </p>
            )}
          </div>

          {/* 외부 링크 */}
          {(conf.detail_url || conf.society_url) && (
            <div
              style={{
                background: "var(--bm-surface)",
                border: "1px solid var(--bm-border)",
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--bm-text-secondary)",
                  marginBottom: 10,
                }}
              >
                외부 링크
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {conf.detail_url && (
                  <a
                    href={conf.detail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block" }}
                  >
                    <Button variant="outline" size="sm" iconRight={<ExternalIcon />} fullWidth>
                      KAMS 공식 정보
                    </Button>
                  </a>
                )}
                {conf.society_url && (
                  <a
                    href={conf.society_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block" }}
                  >
                    <Button variant="ghost" size="sm" iconRight={<ExternalIcon />} fullWidth>
                      학회 홈페이지
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Side banner */}
          {sideBanner && (
            <AdBanner
              size="square"
              sponsor={sideBanner.advertiser_name ?? undefined}
              title={sideBanner.title ?? "Advertisement"}
              cta="자세히 보기"
              href={sideBanner.link_url}
            />
          )}
        </aside>
      </div>

      <Footer />

      {/* 모바일 하단 고정 CTA */}
      <StickyDetailCTA
        conferenceId={conf.id}
        isBookmarked={isBookmarked}
        registrationUrl={conf.registration_url}
      />
    </>
  );
}
