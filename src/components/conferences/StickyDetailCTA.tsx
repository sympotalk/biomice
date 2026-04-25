"use client";

import { FavoriteHeart } from "@/components/ui/FavoriteHeart";

type Props = {
  conferenceId: number;
  isBookmarked: boolean;
  registrationUrl?: string | null;
};

/**
 * 모바일 학술대회 상세 페이지 하단 고정 CTA bar.
 * [♡ 즐겨찾기] [캘린더] [사전등록 하러 가기 →]
 * 데스크톱에서는 숨김 (사이드바 sticky CTA가 그 역할).
 */
export function StickyDetailCTA({
  conferenceId,
  isBookmarked,
  registrationUrl,
}: Props) {
  return (
    <div className="bm-show-mobile">
      <div className="bm-sticky-cta">
      <div
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 8,
          border: "1px solid var(--bm-border)",
          background: "var(--bm-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FavoriteHeart
          active={isBookmarked}
          conferenceId={conferenceId}
          size={36}
        />
      </div>
      <a
        href={`/api/ics/${conferenceId}`}
        download
        aria-label="캘린더에 추가"
        style={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 8,
          border: "1px solid var(--bm-border)",
          background: "var(--bm-bg)",
          color: "var(--bm-text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="14" height="12" rx="1.5" />
          <path d="M3 9h14M7 3v3M13 3v3M10 12v3M8.5 13.5h3" />
        </svg>
      </a>
      {registrationUrl ? (
        <a
          href={registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            border: "none",
            background: "var(--bm-primary)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            textDecoration: "none",
          }}
        >
          사전등록 하러 가기
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M3 7h8M8 4l3 3-3 3" />
          </svg>
        </a>
      ) : (
        <div
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            background: "var(--bm-bg-muted)",
            color: "var(--bm-text-tertiary)",
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          사전등록 링크 없음
        </div>
      )}
      </div>
    </div>
  );
}
