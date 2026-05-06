/**
 * 우측 sticky 광고 사이드바 (monews.co.kr 스타일).
 *   - 데스크톱(≥1024px): 우측 sticky로 세로 stack
 *   - 모바일(<1024px): 콘텐츠 사이에 인라인으로 1개만 (mobile prop 사용 시)
 *
 * 사이즈는 banner별로 display_width/display_height (px) — admin에서 변경 가능.
 * 모바일에서는 자동 비율 유지하며 컨테이너 폭에 맞춤 (max-width 280).
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

  // 데스크톱 사이드바 폭은 가장 넓은 배너에 맞춤 (최소 120px, 최대 320px)
  const stackWidth = mobile
    ? "100%"
    : Math.min(Math.max(...items.map((b) => b.display_width || 120), 120), 320);

  return (
    <aside
      className={mobile ? "bm-show-mobile" : "bm-show-desktop"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        ...(mobile
          ? { width: "100%", margin: "16px 0", alignItems: "center" }
          : {
              position: "sticky",
              top: 88,
              width: stackWidth,
              flexShrink: 0,
              alignItems: "flex-start",
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
  // 사이즈: 데스크톱은 정확한 px, 모바일은 자동 비율로 viewport 안에 맞춤
  const w = banner.display_width || 120;
  const h = banner.display_height || 200;

  const dim: React.CSSProperties = mobile
    ? {
        width: `min(100%, ${w}px)`,
        height: "auto",
        aspectRatio: `${w} / ${h}`,
      }
    : {
        width: w,
        height: h,
      };

  const inner = (
    <div
      style={{
        position: "relative",
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "transform .14s, box-shadow .14s",
        ...dim,
      }}
    >
      {/* AD 라벨 */}
      <span
        style={{
          position: "absolute",
          top: 6,
          left: 6,
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

      {/* 광고 이미지 — 컨테이너 전체 차지, 비율 유지 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.image_url}
        alt={banner.title ?? banner.advertiser_name ?? "광고"}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          background: "var(--bm-bg-muted)",
        }}
      />
    </div>
  );

  // 광고주명 / 제목은 이미지 아래에 별도 작은 라벨로
  const meta =
    banner.advertiser_name || banner.title ? (
      <div
        style={{
          marginTop: 6,
          width: typeof dim.width === "number" ? dim.width : undefined,
          maxWidth: "100%",
          fontSize: 11,
          color: "var(--bm-text-tertiary)",
          lineHeight: 1.4,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {banner.advertiser_name && (
          <div style={{ fontWeight: 600, color: "var(--bm-text-secondary)" }}>
            {banner.advertiser_name}
          </div>
        )}
        {banner.title && (
          <div
            style={{
              fontSize: 10,
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {banner.title}
          </div>
        )}
      </div>
    ) : null;

  if (banner.link_url) {
    return (
      <div style={{ width: typeof dim.width === "number" ? dim.width : "100%", maxWidth: "100%" }}>
        <a
          href={banner.link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
        >
          {inner}
        </a>
        {meta}
      </div>
    );
  }
  return (
    <div style={{ width: typeof dim.width === "number" ? dim.width : "100%", maxWidth: "100%" }}>
      {inner}
      {meta}
    </div>
  );
}

