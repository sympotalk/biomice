"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Conference } from "@/lib/database.types";

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  conferences: Conference[];
  year: number;
  month: number; // 1-12
  bookmarkedIds?: Set<number>;
};

export function CalendarView({ conferences, year, month, bookmarkedIds }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const confByDate = new Map<string, Conference[]>();
  for (const c of conferences) {
    const key = c.start_date.slice(0, 10);
    if (!confByDate.has(key)) confByDate.set(key, []);
    confByDate.get(key)!.push(c);
  }

  // 캘린더 날짜 계산
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // 6주 채우기
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const goMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    const params = new URLSearchParams(sp.toString());
    params.set("year", String(d.getFullYear()));
    params.set("month", String(d.getMonth() + 1));
    router.push(`/conferences?${params.toString()}`);
  };

  return (
    <div>
      {/* 월 네비게이션 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => goMonth(-1)}
          style={navBtnStyle}
          aria-label="이전 달"
        >
          ‹
        </button>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--bm-text-primary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {year}년 {month}월
          <span
            style={{
              marginLeft: 10,
              fontSize: 12,
              fontWeight: 400,
              color: "var(--bm-text-tertiary)",
              fontFamily: "inherit",
            }}
          >
            {conferences.length}건
          </span>
        </div>
        <button
          type="button"
          onClick={() => goMonth(1)}
          style={navBtnStyle}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {DAYS_KO.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 11,
              fontWeight: 700,
              color: i === 0 ? "var(--bm-danger)" : i === 6 ? "var(--bm-primary)" : "var(--bm-text-tertiary)",
              padding: "6px 0",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
        }}
      >
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} style={{ minHeight: 80 }} />;
          }
          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayConfs = confByDate.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;
          const dow = (firstDay + day - 1) % 7;

          return (
            <div
              key={dateStr}
              style={{
                minHeight: 80,
                background: isToday ? "var(--bm-primary-subtle)" : "var(--bm-surface)",
                border: `1px solid ${isToday ? "var(--bm-primary)" : "var(--bm-border)"}`,
                borderRadius: 6,
                padding: "6px 6px 4px",
                opacity: isPast ? 0.6 : 1,
              }}
            >
              {/* 날짜 숫자 */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday
                    ? "var(--bm-primary)"
                    : dow === 0
                    ? "var(--bm-danger)"
                    : dow === 6
                    ? "var(--bm-primary)"
                    : "var(--bm-text-secondary)",
                  marginBottom: 4,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {day}
              </div>

              {/* 학술대회 칩 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {dayConfs.slice(0, 3).map((c) => (
                  <Link
                    key={c.id}
                    href={`/conferences/${c.id}`}
                    title={c.event_name}
                    style={{
                      display: "block",
                      fontSize: 10,
                      lineHeight: 1.3,
                      padding: "2px 4px",
                      borderRadius: 3,
                      background: bookmarkedIds?.has(c.id)
                        ? "var(--bm-accent-subtle)"
                        : "var(--bm-primary-subtle)",
                      color: bookmarkedIds?.has(c.id)
                        ? "var(--bm-accent)"
                        : "var(--bm-primary)",
                      textDecoration: "none",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      fontWeight: 500,
                    }}
                  >
                    {c.event_name}
                  </Link>
                ))}
                {dayConfs.length > 3 && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--bm-text-tertiary)",
                      paddingLeft: 4,
                    }}
                  >
                    +{dayConfs.length - 3}건
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 6,
  border: "1px solid var(--bm-border)",
  background: "var(--bm-surface)",
  cursor: "pointer",
  fontSize: 18,
  color: "var(--bm-text-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};
