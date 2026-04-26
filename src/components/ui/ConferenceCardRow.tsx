"use client";

import Link from "next/link";
import { useState } from "react";
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
  logoUrl?: string;
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
  logoUrl,
}: ConferenceCardRowProps) {
  const [logoErr, setLogoErr] = useState(false);
  const isPast = dDay != null && dDay < 0;

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

  const initials = (logoText || society || "KM").slice(0, 3).toUpperCase();

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
          background: logoUrl && !logoErr ? "#fff" : (logoColor || "var(--bm-primary)"),
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 0.3,
          overflow: "hidden",
          border: logoUrl && !logoErr ? "1px solid var(--bm-border)" : "none",
        }}
      >
        {logoUrl && !logoErr ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt=""
            onError={() => setLogoErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
          />
        ) : (
          initials
        )}
      </div>

      {/* 우측 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 1줄: 배지 + 즐겨찾기 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
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
