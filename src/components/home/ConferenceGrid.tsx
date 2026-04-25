import { ConferenceCard } from "@/components/ui/ConferenceCard";
import { formatKoreanDate, computeDDay, isRegistrationOpen } from "@/lib/dates";
import type { Conference } from "@/lib/database.types";

type Props = {
  conferences: Conference[];
  scroll?: boolean;
  bookmarkedIds?: Set<number>;
};

export function ConferenceGrid({ conferences, scroll, bookmarkedIds }: Props) {
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

  return (
    <div className="bm-card-grid">
      {conferences.map((c) => (
        <CardFromRow
          key={c.id}
          conference={c}
          bookmarked={bookmarkedIds?.has(c.id) ?? false}
        />
      ))}
    </div>
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
