"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "@/components/ui/Icon";
import { FilterPanel } from "./FilterPanel";

type Props = {
  categories: { category: string; count: number }[];
  cities: { city: string; count: number }[];
  currentCategory?: string;
  currentCity?: string;
  currentDate?: string;
  total: number;
};

const DATE_LABEL: Record<string, string> = {
  "this-month": "이번 달",
  "next-month": "다음 달",
  "3-months": "3개월",
  "6-months": "6개월",
};

/**
 * 모바일 학술대회 목록 페이지 상단 sticky 검색·필터 toolbar.
 * 필터 ▾ 클릭 → 바텀시트 슬라이드 업.
 * 적용된 필터는 toolbar 아래에 칩으로 표시.
 */
export function MobileFilterToolbar({
  categories,
  cities,
  currentCategory,
  currentCity,
  currentDate,
  total,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [q, setQ] = useState(sp.get("q") || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // 시트 열릴 때 body scroll lock
  useEffect(() => {
    if (sheetOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [sheetOpen]);

  const submitSearch = () => {
    const params = new URLSearchParams(sp.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    params.delete("page");
    router.push(`/conferences${params.size ? `?${params.toString()}` : ""}`);
  };

  const removeFilter = (key: "category" | "city" | "date") => {
    const params = new URLSearchParams(sp.toString());
    params.delete(key);
    params.delete("page");
    router.push(`/conferences${params.size ? `?${params.toString()}` : ""}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    const q = sp.get("q");
    if (q) params.set("q", q);
    router.push(`/conferences${params.size ? `?${params.toString()}` : ""}`);
  };

  const activeCount =
    Number(!!currentCategory) + Number(!!currentCity) + Number(!!currentDate);

  return (
    <div
      className="bm-show-mobile"
      style={{ marginLeft: -14, marginRight: -14, marginBottom: 12 }}
    >
      {/* sticky toolbar */}
      <div
        style={{
          position: "sticky",
          top: "var(--bm-header-h-mobile, 56px)",
          zIndex: 20,
          padding: "10px 14px",
          display: "flex",
          gap: 6,
          alignItems: "center",
          background: "var(--bm-bg)",
          borderBottom: "1px solid var(--bm-border)",
        }}
      >
        <div
          style={{
            flex: 1,
            height: 38,
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid var(--bm-border)",
            borderRadius: 6,
            background: "var(--bm-bg-muted)",
          }}
        >
          <SearchIcon
            width={14}
            height={14}
            style={{ color: "var(--bm-text-tertiary)", flexShrink: 0 }}
          />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
            placeholder="학회·학술대회명"
            style={{
              flex: 1,
              minWidth: 0,
              width: "100%",
              height: 36,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              fontFamily: "inherit",
              color: "var(--bm-text-primary)",
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          style={{
            flexShrink: 0,
            height: 38,
            padding: "0 12px",
            border: `1px solid ${activeCount > 0 ? "var(--bm-primary)" : "var(--bm-border)"}`,
            borderRadius: 6,
            background:
              activeCount > 0 ? "var(--bm-primary-subtle)" : "var(--bm-bg)",
            color: activeCount > 0 ? "var(--bm-primary)" : "var(--bm-text-secondary)",
            fontSize: 13,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          필터
          {activeCount > 0 && (
            <span
              className="mono-num"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                background: "var(--bm-primary)",
                color: "#fff",
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* 적용된 필터 칩 */}
      {activeCount > 0 && (
        <div
          style={{
            padding: "10px 14px 0",
            overflowX: "auto",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div style={{ display: "flex", gap: 6, whiteSpace: "nowrap" }}>
            {currentCategory && (
              <ActiveFilterChip
                label={currentCategory}
                onRemove={() => removeFilter("category")}
              />
            )}
            {currentCity && (
              <ActiveFilterChip
                label={currentCity}
                onRemove={() => removeFilter("city")}
              />
            )}
            {currentDate && DATE_LABEL[currentDate] && (
              <ActiveFilterChip
                label={DATE_LABEL[currentDate]}
                onRemove={() => removeFilter("date")}
              />
            )}
            <button
              type="button"
              onClick={clearAll}
              style={{
                height: 26,
                padding: "0 6px",
                border: "none",
                background: "transparent",
                color: "var(--bm-text-secondary)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              전체 해제
            </button>
          </div>
        </div>
      )}

      {/* 바텀시트 */}
      {sheetOpen && (
        <>
          <div
            className="bm-sheet-backdrop"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />
          <div className="bm-sheet" role="dialog" aria-modal="true">
            <div className="bm-sheet-handle">
              <div className="bm-sheet-handle-bar" />
            </div>
            <div
              style={{
                padding: "4px 18px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>필터</h3>
              <button
                type="button"
                onClick={clearAll}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--bm-text-secondary)",
                  fontSize: 12,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                  fontFamily: "inherit",
                }}
              >
                초기화
              </button>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 18px 12px",
                borderTop: "1px solid var(--bm-border)",
              }}
            >
              <FilterPanel
                categories={categories}
                cities={cities}
                currentCategory={currentCategory}
                currentCity={currentCity}
                currentDate={currentDate}
                hideReset
              />
            </div>
            <div
              style={{
                padding: 14,
                borderTop: "1px solid var(--bm-border)",
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={clearAll}
                style={{
                  height: 44,
                  borderRadius: 8,
                  border: "1px solid var(--bm-border)",
                  background: "var(--bm-bg)",
                  color: "var(--bm-text-primary)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                style={{
                  height: 44,
                  borderRadius: 8,
                  border: "none",
                  background: "var(--bm-primary)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span className="mono-num">{total}</span>건 보기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: 26,
        paddingLeft: 10,
        paddingRight: 4,
        background: "var(--bm-primary-subtle)",
        color: "var(--bm-primary)",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${label} 제거`}
        style={{
          width: 18,
          height: 18,
          border: "none",
          background: "transparent",
          color: "currentColor",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9,
          opacity: 0.7,
          padding: 0,
        }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M2 2l6 6M8 2l-6 6" />
        </svg>
      </button>
    </span>
  );
}
