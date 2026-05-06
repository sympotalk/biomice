"use client";

import { useState } from "react";

type Props = {
  venue: string;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
  height?: number;
};

/**
 * 학술대회 venue를 페이지 안에 지도로 임베드.
 *
 * 두 provider 전환 가능:
 *   - OpenStreetMap (default, API 키 불필요)
 *   - Naver Mobile Search (m.map.naver.com) — X-Frame-Options에 따라 보일 수 있음/없음.
 *     거부되면 사용자가 OSM으로 전환 후 "새 탭으로 열기" 보조 링크 사용.
 *
 * 네이버 정식 임베드 API는 NCP 클라우드 키 필요. 키 등록 후
 * https://navermaps.github.io/maps.js.ncp/ 의 SDK로 교체 가능.
 */
export function VenueMap({ venue, city, lat, lng, height = 240 }: Props) {
  const [provider, setProvider] = useState<"osm" | "naver">("osm");

  const hasCoords = lat != null && lng != null;
  const span = 0.012;
  const bbox = hasCoords
    ? `${(lng as number) - span},${(lat as number) - span},${(lng as number) + span},${(lat as number) + span}`
    : "126.85,37.45,127.18,37.62"; // 서울 광역 fallback
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${
    hasCoords ? `&marker=${lat},${lng}` : ""
  }`;

  const queryRaw = `${venue} ${city ?? ""}`.trim();
  const query = encodeURIComponent(queryRaw);
  // 네이버 모바일 지도 검색 — 임베드 가능 여부는 환경 의존 (X-Frame-Options 거부 시 빈 화면)
  const naverSrc = `https://m.map.naver.com/search2/search.naver?query=${query}`;
  const naverExternalUrl = `https://map.naver.com/v5/search/${query}`;

  const src = provider === "osm" ? osmSrc : naverSrc;

  return (
    <div style={{ position: "relative" }}>
      <iframe
        key={provider}
        src={src}
        title={`지도 — ${venue}`}
        style={{
          width: "100%",
          height,
          border: 0,
          background: "var(--bm-bg-muted)",
          display: "block",
        }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Provider toggle (좌하단) */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          display: "flex",
          gap: 0,
          background: "#fff",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          border: "1px solid var(--bm-border)",
        }}
      >
        <button
          type="button"
          onClick={() => setProvider("osm")}
          style={{
            padding: "5px 10px",
            border: "none",
            background: provider === "osm" ? "var(--bm-primary)" : "transparent",
            color: provider === "osm" ? "#fff" : "var(--bm-text-secondary)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          OSM
        </button>
        <button
          type="button"
          onClick={() => setProvider("naver")}
          style={{
            padding: "5px 10px",
            border: "none",
            background: provider === "naver" ? "#03C75A" : "transparent",
            color: provider === "naver" ? "#fff" : "var(--bm-text-secondary)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          네이버
        </button>
      </div>

      {/* 새 탭 fallback (네이버가 임베드 거부 시) */}
      <a
        href={naverExternalUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          padding: "5px 10px",
          background: "rgba(255,255,255,0.95)",
          color: "var(--bm-text-secondary)",
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 6,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          border: "1px solid var(--bm-border)",
        }}
        aria-label="네이버 지도 새 탭"
      >
        새 탭 ↗
      </a>
    </div>
  );
}
