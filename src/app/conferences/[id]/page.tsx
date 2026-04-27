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
import { societyAbbr, specialtyColor, resolveSpecialty } from "@/lib/society";
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

      {/* ── 3-column body (데스크톱) ────────────────────────────────────── */}
      <div className="bm-detail-grid">
        {/* ── 좌측 메타 (학회 정보 + 지도 + 태그) ───────────────────────── */}
        <aside
          className="bm-detail-meta"
          style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}
        >
          {/* 학회 카드 */}
          <div
            style={{
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-border)",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: specialtyColor(resolveSpecialty(conf.society_name, null)),
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 800,
                  fontSize: societyAbbr(conf.society_name).length >= 5 ? 10 : societyAbbr(conf.society_name).length === 4 ? 12 : 14,
                  letterSpacing: 0.3,
                  flexShrink: 0,
                }}
              >
                {societyAbbr(conf.society_name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--bm-text-tertiary)",
                    marginBottom: 2,
                  }}
                >
                  주최 학회
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--bm-text-primary)",
                    lineHeight: 1.35,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {conf.society_name}
                </div>
              </div>
            </div>
            {(conf.category || resolveSpecialty(conf.society_name, conf.category)) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {[
                  resolveSpecialty(conf.society_name, conf.category),
                  conf.category && conf.category !== resolveSpecialty(conf.society_name, null)
                    ? conf.category
                    : null,
                ]
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag as string}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 20,
                        padding: "0 8px",
                        background: "var(--bm-primary-subtle)",
                        color: "var(--bm-primary)",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
            {conf.society_url && (
              <a
                href={conf.society_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--bm-primary)",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                학회 홈페이지
                <ExternalIcon width={11} height={11} />
              </a>
            )}
          </div>

          {/* CME 평점 / 마감 정보 */}
          {(conf.cme_credits ||
            conf.registration_deadline ||
            conf.early_bird_deadline ||
            conf.abstract_deadline) && (
            <div
              style={{
                background: "var(--bm-surface)",
                border: "1px solid var(--bm-border)",
                borderRadius: 8,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--bm-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                인정 점수 / 마감일
              </h3>
              {conf.cme_credits && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    background: "var(--bm-success-subtle)",
                    borderRadius: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--bm-text-secondary)",
                    }}
                  >
                    KMA 평점
                  </span>
                  <span
                    className="mono-num"
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--bm-success)",
                    }}
                  >
                    {conf.cme_credits} 점
                  </span>
                </div>
              )}
              {conf.abstract_deadline && (
                <DeadlineRow
                  label="초록 마감"
                  date={conf.abstract_deadline}
                />
              )}
              {conf.early_bird_deadline && (
                <DeadlineRow
                  label="얼리버드"
                  date={conf.early_bird_deadline}
                />
              )}
              {conf.registration_deadline && (
                <DeadlineRow
                  label="사전등록 마감"
                  date={conf.registration_deadline}
                  emphasize
                />
              )}
            </div>
          )}

          {/* 위치 / 지도 */}
          {conf.venue && (
            <div
              style={{
                background: "var(--bm-surface)",
                border: "1px solid var(--bm-border)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* 지도 placeholder — Google Maps embed (API key 불필요한 형식) */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${conf.venue} ${conf.city ?? ""}`.trim(),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  height: 120,
                  background:
                    "linear-gradient(135deg, var(--bm-bg-muted) 0%, var(--bm-primary-subtle) 100%)",
                  position: "relative",
                  textDecoration: "none",
                }}
                aria-label="지도에서 보기"
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="none"
                    stroke="var(--bm-primary)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 4c-5.5 0-10 4-10 9 0 7 10 19 10 19s10-12 10-19c0-5-4.5-9-10-9z" />
                    <circle cx="18" cy="13" r="3" />
                  </svg>
                </div>
                <span
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 10,
                    fontSize: 10,
                    color: "var(--bm-primary)",
                    fontWeight: 600,
                    background: "rgba(255,255,255,0.9)",
                    padding: "3px 8px",
                    borderRadius: 999,
                  }}
                >
                  지도 보기 →
                </span>
              </a>
              <div style={{ padding: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--bm-text-tertiary)",
                    marginBottom: 4,
                  }}
                >
                  개최 장소
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--bm-text-primary)",
                    lineHeight: 1.4,
                    wordBreak: "keep-all",
                    overflowWrap: "anywhere",
                  }}
                >
                  {conf.venue}
                </div>
                {conf.city && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--bm-text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {conf.city}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ── 중앙 콘텐츠 ─────────────────────────────────────────────────── */}
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

          {/* CTA card — 마감 임박일 때 강조 (D-7 이하 + 사전등록 가능) */}
          <div
            style={{
              position: "relative",
              background: "var(--bm-surface)",
              border:
                dd !== null && dd <= 7 && dd >= 0 && conf.registration_url
                  ? "2px solid var(--bm-danger)"
                  : "1px solid var(--bm-border)",
              borderRadius: 8,
              padding: 20,
              boxShadow:
                dd !== null && dd <= 7 && dd >= 0 && conf.registration_url
                  ? "0 4px 16px rgba(199, 62, 62, 0.15)"
                  : undefined,
            }}
          >
            {dd !== null && dd <= 7 && dd >= 0 && conf.registration_url && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: 16,
                  height: 22,
                  padding: "0 10px",
                  background: "var(--bm-danger)",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  animation: "bm-pulse 2s ease-in-out infinite",
                }}
              >
                🔥 사전등록 임박
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 12, color: "var(--bm-text-tertiary)" }}>
                {dd !== null && dd <= 7 && dd >= 0 ? "마감 D-7 이내" : "개최일"}
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
        dDay={dd}
      />
    </>
  );
}

function DeadlineRow({
  label,
  date,
  emphasize,
}: {
  label: string;
  date: string;
  emphasize?: boolean;
}) {
  const deadline = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil(
    (deadline.getTime() - today.getTime()) / 86400000,
  );
  const isPast = daysLeft < 0;
  const isUrgent = !isPast && daysLeft <= 7;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        opacity: isPast ? 0.5 : 1,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: emphasize
            ? "var(--bm-text-primary)"
            : "var(--bm-text-secondary)",
          fontWeight: emphasize ? 600 : 400,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          className="mono-num"
          style={{
            fontSize: 12,
            color: "var(--bm-text-primary)",
            fontWeight: emphasize ? 700 : 500,
          }}
        >
          {formatKoreanDate(date)}
        </span>
        {!isPast && (
          <span
            className="mono-num"
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: 3,
              background: isUrgent
                ? "var(--bm-danger-subtle)"
                : "var(--bm-bg-muted)",
              color: isUrgent
                ? "var(--bm-danger)"
                : "var(--bm-text-secondary)",
            }}
          >
            {daysLeft === 0 ? "D-DAY" : `D-${daysLeft}`}
          </span>
        )}
      </div>
    </div>
  );
}
