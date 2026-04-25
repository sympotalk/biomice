import { ConferenceCard } from "@/components/ui/ConferenceCard";
import { ConferenceCardRow } from "@/components/ui/ConferenceCardRow";
import { formatKoreanDate, computeDDay, isRegistrationOpen } from "@/lib/dates";
import type { Conference } from "@/lib/database.types";

type Props = {
  conferences: Conference[];
  /** 데스크톱·모바일 모두 가로 스크롤 스트립 (Featured/이번 주 등). */
  scroll?: boolean;
  /**
   * 데스크톱은 그리드, 모바일은 가로 스크롤 (Featured에 좋음).
   * scroll=true일 때는 무시됨.
   */
  mobileScroll?: boolean;
  bookmarkedIds?: Set<number>;
};

export function ConferenceGrid({
  conferences,
  scroll,
  mobileScroll,
  bookmarkedIds,
}: Props) {
  if (scroll) {
    return (
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
    );
  }

  if (mobileScroll) {
    return (
      <>
        {/* 데스크톱: 일반 그리드 */}
        <div className="bm-show-desktop">
          <div className="bm-card-grid">
            {conferences.map((c) => (
              <CardFromRow
                key={c.id}
                conference={c}
                bookmarked={bookmarkedIds?.has(c.id) ?? false}
              />
            ))}
          </div>
        </div>
        {/* 모바일: 가로 스크롤 (M2FeaturedScrollCard 형태) */}
        <div className="bm-show-mobile">
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
        </div>
      </>
    );
  }

  // 데스크톱: 그리드 카드 / 모바일: 가로형 카드. CSS로 둘 중 하나만 보이게.
  return (
    <>
      <div className="bm-show-desktop">
        <div className="bm-card-grid">
          {conferences.map((c) => (
            <CardFromRow
              key={c.id}
              conference={c}
              bookmarked={bookmarkedIds?.has(c.id) ?? false}
            />
          ))}
        </div>
      </div>
      <div className="bm-show-mobile">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
  // "대한내과학회" → "내과" → uppercase first 2 kanji/characters
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
