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
import {
  CalendarIcon,
  ExternalIcon,
  PinIcon,
} from "@/components/ui/Icon";
import { getConference, getBannerForSlot, getMyBookmarkIds } from "@/lib/queries";
import { FavoriteHeart } from "@/components/ui/FavoriteHeart";
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
    title: `${conf.event_name} · biomice`,
    description: `${conf.society_name} · ${formatKoreanDate(conf.start_date)}${
      conf.venue ? ` · ${conf.venue}` : ""
    }`,
  };
}

export default async function ConferenceDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  const [conf, bottomBanner, bookmarkedIds] = await Promise.all([
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
      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "32px 20px 64px",
        }}
      >
        {/* Breadcrumb */}
        <nav
          style={{
            fontSize: 12,
            color: "var(--bm-text-tertiary)",
            marginBottom: 16,
            display: "flex",
            gap: 6,
          }}
        >
          <Link
            href="/"
            style={{ color: "var(--bm-text-tertiary)", textDecoration: "none" }}
          >
            홈
          </Link>
          <span>/</span>
          <Link
            href="/conferences"
            style={{ color: "var(--bm-text-tertiary)", textDecoration: "none" }}
          >
            학술대회
          </Link>
          {conf.category && (
            <>
              <span>/</span>
              <Link
                href={`/conferences?category=${encodeURIComponent(conf.category)}`}
                style={{
                  color: "var(--bm-text-tertiary)",
                  textDecoration: "none",
                }}
              >
                {conf.category}
              </Link>
            </>
          )}
        </nav>

        {/* Header card */}
        <section
          style={{
            position: "relative",
            background: conf.is_featured
              ? "linear-gradient(135deg, var(--bm-accent-subtle) 0%, var(--bm-bg) 80%)"
              : "var(--bm-surface)",
            border: `1px solid ${
              conf.is_featured ? "var(--bm-accent-border)" : "var(--bm-border)"
            }`,
            borderRadius: 12,
            padding: 32,
            marginBottom: 24,
          }}
        >
          <div style={{ position: "absolute", top: 20, right: 20 }}>
            <FavoriteHeart active={isBookmarked} conferenceId={conf.id} size={40} />
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 12,
              flexWrap: "wrap",
              paddingRight: 48,
            }}
          >
            {conf.is_featured && <FeaturedBadge variant="featured" />}
            {regOpen && <RegistrationOpenBadge />}
            <DDayBadge days={dd} />
            {conf.category && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--bm-primary)",
                  background: "var(--bm-primary-subtle)",
                  padding: "2px 8px",
                  borderRadius: 3,
                }}
              >
                {conf.category}
              </span>
            )}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: 700,
              letterSpacing: -0.5,
              lineHeight: 1.3,
              color: "var(--bm-text-primary)",
            }}
          >
            {conf.event_name}
          </h1>

          <div
            style={{
              marginTop: 12,
              fontSize: 14,
              color: "var(--bm-text-secondary)",
            }}
          >
            {conf.society_url ? (
              <a
                href={conf.society_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--bm-primary)", textDecoration: "none" }}
              >
                {conf.society_name}
                <ExternalIcon
                  style={{ display: "inline-block", marginLeft: 4 }}
                />
              </a>
            ) : (
              conf.society_name
            )}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              padding: 16,
              background: "var(--bm-bg)",
              border: "1px solid var(--bm-border)",
              borderRadius: 8,
            }}
          >
            <InfoRow
              icon={<CalendarIcon style={{ color: "var(--bm-primary)" }} />}
              label="일정"
              value={
                <span className="mono-num">
                  {formatKoreanDate(conf.start_date)}
                  {conf.end_date ? ` – ${formatKoreanDate(conf.end_date)}` : ""}
                </span>
              }
            />
            {conf.venue && (
              <InfoRow
                icon={<PinIcon style={{ color: "var(--bm-primary)" }} />}
                label="장소"
                value={`${conf.venue}${conf.city ? ` · ${conf.city}` : ""}`}
              />
            )}
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {conf.registration_url && (
              <a
                href={conf.registration_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="lg" iconRight={<ExternalIcon />}>
                  사전등록 바로가기
                </Button>
              </a>
            )}
            {conf.detail_url && (
              <a
                href={conf.detail_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg" iconRight={<ExternalIcon />}>
                  KAMS 공식 정보
                </Button>
              </a>
            )}
            <a href={`/api/ics/${conf.id}`} download>
              <Button variant="outline" size="lg">
                .ics 캘린더 추가
              </Button>
            </a>
            {conf.society_url && (
              <a
                href={conf.society_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="lg" iconRight={<ExternalIcon />}>
                  학회 홈페이지
                </Button>
              </a>
            )}
          </div>
        </section>

        {/* Description */}
        {conf.description && (
          <section
            style={{
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-border)",
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                fontSize: 16,
                fontWeight: 600,
                color: "var(--bm-text-primary)",
              }}
            >
              학술대회 소개
            </h2>
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
          </section>
        )}

        {/* Bottom banner */}
        {bottomBanner && (
          <div style={{ marginTop: 32 }}>
            <AdBanner
              size="wide"
              sponsor={bottomBanner.advertiser_name ?? undefined}
              title={bottomBanner.title ?? "Advertisement"}
              cta="자세히 보기"
              href={bottomBanner.link_url}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ marginTop: 2 }}>{icon}</div>
      <div>
        <div
          style={{
            fontSize: 11,
            color: "var(--bm-text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--bm-text-primary)",
            fontWeight: 500,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
