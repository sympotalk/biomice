"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarIcon, PinIcon } from "./Icon";
import { DDayBadge, FeaturedBadge, RegistrationOpenBadge } from "./Badge";
import { FavoriteHeart } from "./FavoriteHeart";
import { radius } from "@/lib/tokens";

export type ConferenceCardProps = {
  id: number;
  title: string;
  society: string;
  startDate: string; // "2026.05.14" formatted
  endDate?: string | null;
  venue?: string | null;
  city?: string | null;
  specialty?: string | null;
  dDay?: number | null;
  featured?: boolean;
  registrationOpen?: boolean;
  favorite?: boolean;
  compact?: boolean;
  logoText?: string;
  logoColor?: string;
  href?: string;
};

export function ConferenceCard({
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
  registrationOpen,
  favorite,
  compact,
  logoText,
  logoColor,
  href,
}: ConferenceCardProps) {
  const [hov, setHov] = useState(false);
  const destination = href ?? `/conferences/${id}`;

  return (
    <Link
      href={destination}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        display: "block",
        background: "var(--bm-surface)",
        border: `1px solid ${featured ? "var(--bm-accent-border)" : "var(--bm-border)"}`,
        borderRadius: radius.card,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .18s",
        boxShadow: hov
          ? "0 4px 16px rgba(0,0,0,0.06)"
          : "0 1px 2px rgba(0,0,0,0.02)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* Logo/Image area */}
      <div
        style={{
          height: compact ? 120 : 160,
          background: featured
            ? "linear-gradient(135deg, var(--bm-accent-subtle) 0%, var(--bm-bg-muted) 100%)"
            : "var(--bm-bg-muted)",
          borderBottom: "1px solid var(--bm-border)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          {featured && <FeaturedBadge variant="featured" />}
          {!featured && registrationOpen && <RegistrationOpenBadge />}
        </div>
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <FavoriteHeart active={favorite} conferenceId={id} size={32} />
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: logoColor || "var(--bm-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {logoText || (society || "KM").slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          {specialty && (
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
              {specialty}
            </span>
          )}
          {dDay != null && <DDayBadge days={dDay} size="sm" />}
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.4,
            color: "var(--bm-text-primary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 42,
          }}
        >
          {title}
        </h3>

        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--bm-text-secondary)",
            }}
          >
            <CalendarIcon style={{ flexShrink: 0 }} />
            <span className="mono-num">
              {startDate}
              {endDate ? ` – ${endDate}` : ""}
            </span>
          </div>
          {venue && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--bm-text-secondary)",
              }}
            >
              <PinIcon style={{ flexShrink: 0 }} />
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {venue}
                {city ? ` · ${city}` : ""}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--bm-border)",
            fontSize: 12,
            color: "var(--bm-text-tertiary)",
          }}
        >
          {society}
        </div>
      </div>
    </Link>
  );
}
