/**
 * 우측 sticky 광고 사이드바 (monews.co.kr 스타일).
 *   - 데스크톱(≥1024px): 우측 sticky로 세로 stack
 *   - 모바일(<1024px): 콘텐츠 사이에 인라인으로 1개만 (mobile prop 사용 시)
 *
 * 데이터: queries.ts → listSidebarBanners() → banners 테이블 slot_name='right_sidebar'
 */

import type { Banner } from "@/lib/database.types";

type Props = {
  banners: Banner[];
  /** 모바일 인라인 모드 — 1개만 표시 */
  mobile?: boolean;
};

export function AdSidebarStack({ banners, mobile }: Props) {
  if (banners.length === 0) return null;
  const items = mobile ? banners.slice(0, 1) : banners;

  return (
    <aside
      className={mobile ? "bm-show-mobile" : "bm-show-desktop"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        ...(mobile
          ? { width: "100%", margin: "16px 0" }
          : {
              position: "sticky",
              top: 88,
              width: 280,
              flexShrink: 0,
            }),
      }}
    >
      {items.map((banner) => (
        <SidebarAdItem key={banner.id} banner={banner} mobile={mobile} />
      ))}
    </aside>
  );
}

function SidebarAdItem({ banner, mobile }: { banner: Banner; mobile?: boolean }) {
  const inner = (
    <div
      style={{
        position: "relative",
        width: "100%",
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform .14s, box-shadow .14s",
      }}
    >
      {/* AD 라벨 */}
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 2,
          fontSize: 9,
          fontWeight: 700,
          color: "var(--bm-text-tertiary)",
          background: "rgba(255,255,255,0.85)",
          padding: "2px 6px",
          borderRadius: 3,
          letterSpacing: 0.5,
        }}
      >
        AD
      </span>

      {/* 광고 이미지 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.image_url}
        alt={banner.title ?? banner.advertiser_name ?? "광고"}
        style={{
          display: "block",
          width: "100%",
          height: mobile ? 220 : 320,
          objectFit: "cover",
          background: "var(--bm-bg-muted)",
        }}
      />

      {/* 광고주 + 제목 */}
      <div style={{ padding: 12 }}>
        {banner.advertiser_name && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--bm-text-tertiary)",
              marginBottom: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {banner.advertiser_name}
          </div>
        )}
        {banner.title && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--bm-text-primary)",
              lineHeight: 1.4,
              wordBreak: "keep-all",
              overflowWrap: "anywhere",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {banner.title}
          </div>
        )}
      </div>
    </div>
  );

  if (banner.link_url) {
    return (
      <a
        href={banner.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {inner}
      </a>
    );
  }
  return inner;
}
