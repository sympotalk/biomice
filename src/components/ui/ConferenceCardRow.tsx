"use client";

import Link from "next/link";
import { CalendarIcon, PinIcon } from "./Icon";
import { FavoriteHeart } from "./FavoriteHeart";

export type ConferenceCardRowProps = {
  id: number;
  title: string;
  society: string;
  startDate: string; // "2026.05.14"
  endDate?: string | null;
  venue?: string | null;
  city?: string | null;
  specialty?: string | null;
  dDay?: number | null;
  featured?: boolean;
  registrationOpen?: boolean;
  favorite?: boolean;
  logoText?: string;
  logoColor?: string;
  /** "international" 또는 "domestic". international일 때 국기 배지 표시. */
  conferenceType?: string | null;
  /** ISO 국가 코드 (US, ES, IT, KR 등). */
  countryCode?: string | null;
  /** KMA 등 인정 평점 (예: 6.0) */
  cmeCredits?: number | null;
  /** 국내 평점 (cme_credits_kr) */
  cmeCreditsKr?: number | null;
  /** 대한의학회(KAMS) 국내개최 국제학술대회 인정 여부 */
  kamsCertified?: boolean;
  /** 연관 국내 학회명 (KAMS 인정 또는 admin 매뉴얼 입력) */
  relatedKoreanSociety?: string | null;
  /** Deprecated: 이미지 로고 사용 안 함 — 영문 약자 박스로 통일. */
  logoUrl?: string;
};

const COUNTRY_FLAG: Record<string, string> = {
  KR: "🇰🇷",
  US: "🇺🇸",
  ES: "🇪🇸",
  IT: "🇮🇹",
  GB: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
  JP: "🇯🇵",
  CN: "🇨🇳",
  CH: "🇨🇭",
  AT: "🇦🇹",
  NL: "🇳🇱",
  CA: "🇨🇦",
  AU: "🇦🇺",
  SG: "🇸🇬",
};

/**
 * 가로형 학술대회 카드 (모바일 우선).
 * 좌측 48px 로고 + 우측 4줄(배지 / 제목 / 날짜 / 장소).
 * 한 화면에 5~7장 보이게 디자인됨.
 */
export function ConferenceCardRow({
  id,
  title,
  society,
  startDate,
  endDate,
  venue,
  city,
  specialty,
  dDay,
  featured,
  favorite,
  logoText,
  logoColor,
  conferenceType,
  countryCode,
  cmeCredits,
  cmeCreditsKr,
  kamsCertified,
}: ConferenceCardRowProps) {
  const isPast = dDay != null && dDay < 0;
  const isIntl = conferenceType === "international";
  const flag = countryCode ? COUNTRY_FLAG[countryCode] : null;
  const cmePoint = cmeCreditsKr ?? cmeCredits;

  // D-day 칩 스타일
  let dBg = "var(--bm-bg-muted)";
  let dFg = "var(--bm-text-secondary)";
  let dLabel = "";
  let dPulse = false;
  if (dDay != null) {
    if (isPast) {
      dBg = "var(--bm-bg-muted)";
      dFg = "var(--bm-text-tertiary)";
      dLabel = "종료";
    } else if (dDay === 0) {
      dBg = "var(--bm-danger)";
      dFg = "#fff";
      dLabel = "D-DAY";
      dPulse = true;
    } else if (dDay <= 6) {
      dBg = "var(--bm-accent-subtle)";
      dFg = "var(--bm-accent)";
      dLabel = `D-${dDay}`;
      dPulse = true;
    } else if (dDay <= 29) {
      dBg = "var(--bm-primary-subtle)";
      dFg = "var(--bm-primary)";
      dLabel = `D-${dDay}`;
    } else {
      dBg = "var(--bm-bg-muted)";
      dFg = "var(--bm-text-secondary)";
      dLabel = `D-${dDay}`;
    }
  }

  // endDate 짧게 표시 ("2026.05.14 – 05.16")
  const dateLine = endDate
    ? `${startDate} – ${endDate.slice(5)}`
    : startDate;

  const venueLine = [venue, city].filter(Boolean).join(" · ");

  // 영문 약자 (KAIM, KSCVS 등) 또는 한글 fallback. 길이에 따라 폰트 자동 축소.
  const initials = logoText || society.slice(0, 2);
  const isEnglish = /^[A-Z0-9-]+$/.test(initials);
  const initialFontSize = isEnglish
    ? initials.length >= 5
      ? 9
      : initials.length === 4
      ? 11
      : 13
    : 13;

  return (
    <Link
      href={`/conferences/${id}`}
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        gap: 12,
        padding: 12,
        background: featured ? "var(--bm-accent-subtle)" : "var(--bm-surface)",
        border: `1px solid ${featured ? "var(--bm-accent-border)" : "var(--bm-border)"}`,
        borderRadius: 8,
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
        filter: isPast ? "grayscale(0.6)" : "none",
        opacity: isPast ? 0.7 : 1,
        transition: "border-color .12s, box-shadow .12s",
        boxSizing: "border-box",
      }}
    >
      {featured && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: "var(--bm-accent)",
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          }}
        />
      )}

      {/* 좌측 로고 48px */}
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: 8,
          background: logoColor || "var(--bm-primary)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontWeight: 800,
          fontSize: initialFontSize,
          letterSpacing: 0.3,
          overflow: "hidden",
        }}
      >
        {initials}
      </div>

      {/* 우측 정보 */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {/* 1줄: 배지 + 즐겨찾기 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
            minWidth: 0,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {isIntl && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                height: 18,
                padding: "0 6px",
                background: "var(--bm-accent-subtle)",
                color: "var(--bm-accent)",
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 700,
                border: "1px solid var(--bm-accent-border)",
                flexShrink: 0,
              }}
            >
              {flag ? flag : "🌐"} 국제
            </span>
          )}
          {kamsCertified && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                height: 18,
                padding: "0 6px",
                background: "var(--bm-primary)",
                color: "#fff",
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}
              title="대한의학회 국내개최 국제학술대회 인정"
            >
              ✓ KAMS 인정
            </span>
          )}
          {specialty && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 18,
                padding: "0 6px",
                background: "var(--bm-primary-subtle)",
                color: "var(--bm-primary)",
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              {specialty}
            </span>
          )}
          {cmePoint != null && cmePoint > 0 && (
            <span
              className="mono-num"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                height: 18,
                padding: "0 6px",
                background: "var(--bm-success-subtle)",
                color: "var(--bm-success)",
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}
              aria-label="국내 평점"
            >
              평점 {cmePoint}
            </span>
          )}
          {dDay != null && (
            <span
              className="mono-num"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 18,
                padding: "0 6px",
                background: dBg,
                color: dFg,
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.3,
                animation: dPulse ? "bm-pulse 2s ease-in-out infinite" : undefined,
              }}
            >
              {dLabel}
            </span>
          )}
          {featured && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 18,
                padding: "0 6px",
                background: "var(--bm-accent)",
                color: "#fff",
                borderRadius: 3,
                fontSize: 9,
                fontWeight: 700,
              }}
              aria-label="Featured"
            >
              🔥
            </span>
          )}
          <span style={{ flex: 1 }} />
          <div
            style={{ flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <FavoriteHeart active={favorite} conferenceId={id} size={28} />
          </div>
        </div>

        {/* 2줄: 제목 (1줄 ellipsis) */}
        <div
          style={{
            display: "block",
            width: "100%",
            maxWidth: "100%",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--bm-text-primary)",
            lineHeight: 1.35,
            letterSpacing: -0.1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>

        {/* 3줄: 날짜 */}
        <div
          className="mono-num"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: "var(--bm-text-secondary)",
            marginTop: 4,
          }}
        >
          <CalendarIcon
            width={11}
            height={11}
            style={{ color: "var(--bm-text-tertiary)", flexShrink: 0 }}
          />
          {dateLine}
        </div>

        {/* 4줄: 장소 */}
        {venueLine && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "var(--bm-text-secondary)",
              marginTop: 2,
            }}
          >
            <PinIcon
              width={11}
              height={11}
              style={{ color: "var(--bm-text-tertiary)", flexShrink: 0 }}
            />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {venueLine}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
