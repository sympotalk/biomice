"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarIcon, PinIcon } from "./Icon";
import { FavoriteHeart } from "./FavoriteHeart";
import { radius } from "@/lib/tokens";
import { getDepartmentColor } from "@/lib/departments";

export type ConferenceCardProps = {
  id: number;
  title: string;
  society: string;
  startDate: string; // "2026.05.14" formatted
  endDate?: string | null;
  venue?: string | null;
  city?: string | null;
  specialty?: string | null;
  departments?: string[] | null;
  cmeCreditsKr?: number | null;
  dDay?: number | null;
  featured?: boolean;
  registrationOpen?: boolean;
  favorite?: boolean;
  compact?: boolean;
  logoText?: string;
  logoColor?: string;
  /** Deprecated: 이미지 로고 사용 안 함. 영문 약자 박스로 통일. */
  logoUrl?: string;
  href?: string;
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
};

/**
 * 학술대회 카드 — myfair.co 스타일.
 *   - 배경 흰색
 *   - 상단 알약 모양 상태 뱃지 (참가 가능 / 마감 임박 / 잔여 부스 확인 필요)
 *   - 중앙 큰 학회 로고 (84px 약자 박스)
 *   - 제목/날짜/위치 텍스트 큼직하게
 */
export function ConferenceCard({
  id,
  title,
  society,
  startDate,
  endDate,
  venue,
  city,
  specialty,
  departments,
  cmeCreditsKr,
  dDay,
  featured,
  registrationOpen,
  favorite,
  compact,
  logoText,
  logoColor,
  href,
}: ConferenceCardProps) {
  const [hov, setHov] = useState(false);
  const destination = href ?? `/conferences/${id}`;

  // 상단 알약 뱃지: 마감 임박 (D-7 이내) > Featured > 참가 가능 > 일반
  type Pill = { label: string; bg: string; color: string; icon?: string };
  let pill: Pill;
  if (dDay != null && dDay >= 0 && dDay <= 7) {
    pill = {
      label: "마감 임박",
      bg: "var(--bm-danger-subtle)",
      color: "var(--bm-danger)",
      icon: "🔥",
    };
  } else if (featured) {
    pill = {
      label: "주요 행사",
      bg: "var(--bm-accent-subtle)",
      color: "var(--bm-accent)",
      icon: "✦",
    };
  } else if (registrationOpen) {
    pill = {
      label: "참가 가능",
      bg: "var(--bm-success-subtle)",
      color: "var(--bm-success)",
      icon: "✓",
    };
  } else {
    pill = {
      label: "사전 안내",
      bg: "var(--bm-bg-muted)",
      color: "var(--bm-text-secondary)",
    };
  }

  // 로고 폰트 크기 자동
  const initials = logoText || society.slice(0, 2);
  const isEnglish = /^[A-Z0-9-]+$/.test(initials);
  const logoFs = isEnglish
    ? initials.length >= 5
      ? 18
      : initials.length === 4
      ? 22
      : 28
    : 28;

  const dateLine = endDate ? `${startDate} – ${endDate}` : startDate;
  const venueLine = [venue, city].filter(Boolean).join(" · ");

  return (
    <Link
      href={destination}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .18s",
        boxShadow: hov
          ? "0 8px 24px rgba(26,40,60,0.08)"
          : "0 2px 4px rgba(26,40,60,0.04)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Top section — 큰 로고 + 알약 뱃지 + 즐겨찾기 */}
      <div
        style={{
          height: compact ? 140 : 180,
          background: "var(--bm-bg)",
          borderBottom: "1px solid var(--bm-border)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 좌상단 알약 상태 뱃지 */}
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            height: 26,
            padding: "0 12px",
            background: pill.bg,
            color: pill.color,
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {pill.icon && <span>{pill.icon}</span>}
          {pill.label}
        </span>

        {/* 우상단 즐겨찾기 */}
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <FavoriteHeart active={favorite} conferenceId={id} size={36} />
        </div>

        {/* 중앙 큰 로고 박스 */}
        <div
          style={{
            width: compact ? 76 : 92,
            height: compact ? 76 : 92,
            borderRadius: 16,
            background: logoColor || "var(--bm-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 800,
            fontSize: logoFs,
            letterSpacing: 0.5,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {initials}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
        }}
      >
        {/* 진료과 + D-day 작은 칩 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {specialty && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--bm-primary)",
                background: "var(--bm-primary-subtle)",
                padding: "3px 10px",
                borderRadius: 4,
              }}
            >
              {specialty}
            </span>
          )}
          {dDay != null && (
            <span
              className="mono-num"
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 4,
                background: "var(--bm-bg-muted)",
                color: "var(--bm-text-secondary)",
              }}
            >
              {dDay === 0 ? "D-DAY" : dDay > 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`}
            </span>
          )}
          {cmeCreditsKr != null && (
            <span
              className="mono-num"
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 4,
                background: "var(--bm-success-subtle)",
                color: "var(--bm-success)",
              }}
            >
              {cmeCreditsKr}점
            </span>
          )}
        </div>

        {/* 분야 배지 (max 3 + +N) */}
        {departments && departments.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {departments.slice(0, 3).map((dept) => (
              <span
                key={dept}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: getDepartmentColor(dept),
                  color: "#fff",
                }}
              >
                {dept}
              </span>
            ))}
            {departments.length > 3 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--bm-bg-muted)",
                  color: "var(--bm-text-secondary)",
                }}
              >
                +{departments.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 제목 — 큼직하게 */}
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.4,
            color: "var(--bm-text-primary)",
            letterSpacing: -0.2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "keep-all",
            overflowWrap: "anywhere",
            minHeight: 46,
          }}
        >
          {title}
        </h3>

        {/* 날짜 — 진하게 */}
        <div
          className="mono-num"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 15,
            fontWeight: 600,
            color: "var(--bm-text-primary)",
          }}
        >
          <CalendarIcon
            width={15}
            height={15}
            style={{ flexShrink: 0, color: "var(--bm-text-secondary)" }}
          />
          <span>{dateLine}</span>
        </div>

        {/* 위치 — 진하게 */}
        {venueLine && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              fontWeight: 500,
              color: "var(--bm-text-primary)",
            }}
          >
            <PinIcon
              width={15}
              height={15}
              style={{ flexShrink: 0, color: "var(--bm-text-secondary)" }}
            />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                minWidth: 0,
              }}
            >
              {venueLine}
            </span>
          </div>
        )}

        {/* 학회명 (하단 라벨) — 진하게 */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid var(--bm-border)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--bm-text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {society}
        </div>
      </div>
    </Link>
  );
}

// flag exported for use elsewhere if needed
export const ConferenceCardCountryFlag = COUNTRY_FLAG;
