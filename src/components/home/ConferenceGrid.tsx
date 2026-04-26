import { ConferenceCard } from "@/components/ui/ConferenceCard";
import { ConferenceCardRow } from "@/components/ui/ConferenceCardRow";
import { formatKoreanDate, computeDDay, isRegistrationOpen } from "@/lib/dates";
import type { Conference } from "@/lib/database.types";

type Props = {
  conferences: Conference[];
  /** 데스크톱에서만 가로 스크롤 스트립 (Featured/이번 주). 모바일은 자동으로 row 카드 stack. */
  scroll?: boolean;
  bookmarkedIds?: Set<number>;
};

/**
 * 학술대회 카드 그리드.
 *
 * 동작 원칙 (일관성):
 *   - 모바일은 ★항상★ row 카드 1열 stack. 가로 스크롤 없음.
 *   - 데스크톱은 props에 따라:
 *     · scroll=true → 가로 스크롤 스트립 (Featured/이번 주)
 *     · 기본 → 4-col grid
 */
export function ConferenceGrid({ conferences, scroll, bookmarkedIds }: Props) {
  return (
    <>
      {/* ── 데스크톱 ───────────────────────────────────────────────────── */}
      <div className="bm-show-desktop">
        {scroll ? (
          <div className="bm-scroll-row">
            {conferences.map((c) => (
              <div key={c.id} className="bm-scroll-card">
                <CardFromRow
                  conference={c}
                  bookmarked={bookmarkedIds?.has(c.id) ?? false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bm-card-grid">
            {conferences.map((c) => (
              <CardFromRow
                key={c.id}
                conference={c}
                bookmarked={bookmarkedIds?.has(c.id) ?? false}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 모바일 ─────────────────────────────────────────────────────── */}
      <div className="bm-show-mobile" style={{ width: "100%", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          {conferences.map((c) => (
            <RowFromConf
              key={c.id}
              conference={c}
              bookmarked={bookmarkedIds?.has(c.id) ?? false}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function CardFromRow({
  conference: c,
  bookmarked,
}: {
  conference: Conference;
  bookmarked: boolean;
}) {
  return (
    <ConferenceCard
      id={c.id}
      title={c.event_name}
      society={c.society_name}
      startDate={formatKoreanDate(c.start_date)}
      endDate={c.end_date ? formatKoreanDate(c.end_date) : undefined}
      venue={c.venue}
      city={c.city}
      specialty={c.category}
      dDay={computeDDay(c.start_date)}
      featured={c.is_featured}
      registrationOpen={isRegistrationOpen(c.start_date, c.registration_url)}
      logoText={societyShort(c.society_name)}
      logoUrl={faviconUrl(c.society_url)}
      favorite={bookmarked}
    />
  );
}

function RowFromConf({
  conference: c,
  bookmarked,
}: {
  conference: Conference;
  bookmarked: boolean;
}) {
  return (
    <ConferenceCardRow
      id={c.id}
      title={c.event_name}
      society={c.society_name}
      startDate={formatKoreanDate(c.start_date)}
      endDate={c.end_date ? formatKoreanDate(c.end_date) : undefined}
      venue={c.venue}
      city={c.city}
      specialty={c.category}
      dDay={computeDDay(c.start_date)}
      featured={c.is_featured}
      registrationOpen={isRegistrationOpen(c.start_date, c.registration_url)}
      logoText={societyShort(c.society_name)}
      logoUrl={faviconUrl(c.society_url)}
      favorite={bookmarked}
    />
  );
}

function societyShort(society: string): string {
  const cleaned = society.replace(/대한|학회|협회/g, "");
  return cleaned.slice(0, 2).toUpperCase();
}

function faviconUrl(societyUrl: string | null | undefined): string | undefined {
  if (!societyUrl) return undefined;
  try {
    const { hostname } = new URL(societyUrl);
    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
  } catch {
    return undefined;
  }
}
