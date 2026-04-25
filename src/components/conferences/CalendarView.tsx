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

  // 모바일 리스트 뷰용: 날짜 있는 학술대회 정렬
  const sortedDates = [...confByDate.keys()].sort();

  return (
    <div>
      {/* 월 네비게이션 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 8,
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
            flex: 1,
            textAlign: "center",
            fontSize: 17,
            fontWeight: 700,
            color: "var(--bm-text-primary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {year}년 {month}월
          <span
            style={{
              marginLeft: 8,
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

      {/* ── 데스크톱: 7-col grid ─────────────────────────────────────── */}
      <div className="bm-show-desktop">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            marginBottom: 4,
          }}
        >
          {DAYS_KO.map((d, i) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 700,
                color:
                  i === 0
                    ? "var(--bm-danger)"
                    : i === 6
                    ? "var(--bm-primary)"
                    : "var(--bm-text-tertiary)",
                padding: "6px 0",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {cells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{
                    minHeight: 80,
                    background: "var(--bm-bg-muted)",
                    borderRadius: 6,
                  }}
                />
              );
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

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
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

      {/* ── 모바일: 학술대회 있는 날짜만 list ─────────────────────── */}
      <div className="bm-show-mobile">
        {sortedDates.length === 0 ? (
          <div
            style={{
              padding: "40px 16px",
              textAlign: "center",
              fontSize: 13,
              color: "var(--bm-text-tertiary)",
              background: "var(--bm-bg-muted)",
              borderRadius: 8,
            }}
          >
            이번 달에 예정된 학술대회가 없습니다
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sortedDates.map((dateStr) => {
              const date = new Date(dateStr);
              const day = date.getDate();
              const dow = date.getDay();
              const isToday = dateStr === todayStr;
              const isPast = dateStr < todayStr;
              const dayConfs = confByDate.get(dateStr) ?? [];

              return (
                <div
                  key={dateStr}
                  style={{
                    display: "flex",
                    gap: 12,
                    opacity: isPast ? 0.5 : 1,
                  }}
                >
                  {/* 좌측 날짜 박스 */}
                  <div
                    style={{
                      width: 48,
                      flexShrink: 0,
                      textAlign: "center",
                      borderRadius: 8,
                      padding: "8px 4px",
                      background: isToday
                        ? "var(--bm-primary)"
                        : "var(--bm-bg-muted)",
                      color: isToday ? "#fff" : "var(--bm-text-primary)",
                    }}
                  >
                    <div
                      className="mono-num"
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      {day}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        marginTop: 2,
                        color: isToday
                          ? "rgba(255,255,255,0.8)"
                          : dow === 0
                          ? "var(--bm-danger)"
                          : dow === 6
                          ? "var(--bm-primary)"
                          : "var(--bm-text-tertiary)",
                      }}
                    >
                      {DAYS_KO[dow]}
                    </div>
                  </div>

                  {/* 우측 학술대회 카드들 */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {dayConfs.map((c) => (
                      <Link
                        key={c.id}
                        href={`/conferences/${c.id}`}
                        style={{
                          display: "block",
                          padding: "10px 12px",
                          borderRadius: 8,
                          background: c.is_featured
                            ? "var(--bm-accent-subtle)"
                            : "var(--bm-surface)",
                          border: `1px solid ${
                            c.is_featured
                              ? "var(--bm-accent-border)"
                              : "var(--bm-border)"
                          }`,
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 4,
                          }}
                        >
                          {c.category && (
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
                              {c.category}
                            </span>
                          )}
                          {c.is_featured && (
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
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--bm-text-primary)",
                            lineHeight: 1.35,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.event_name}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: "var(--bm-text-tertiary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.society_name}
                          {c.venue ? ` · ${c.venue}` : ""}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid var(--bm-border)",
  background: "var(--bm-surface)",
  cursor: "pointer",
  fontSize: 18,
  color: "var(--bm-text-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
  flexShrink: 0,
};
