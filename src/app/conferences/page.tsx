import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { ConferenceGrid } from "@/components/home/ConferenceGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AdBanner } from "@/components/ui/AdBanner";
import { FilterPanel } from "@/components/conferences/FilterPanel";
import { ListSidebar } from "@/components/conferences/ListSidebar";
import { PaginationClient } from "@/components/conferences/PaginationClient";
import { ViewToggle } from "@/components/conferences/ViewToggle";
import { CalendarView } from "@/components/conferences/CalendarView";
import {
  listConferences,
  listConferencesForMonth,
  getSpecialtyCounts,
  getCityCounts,
  getBannerForSlot,
  getMyBookmarkIds,
} from "@/lib/queries";
import { formatISO, addMonths } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  city?: string;
  date?: string;
  page?: string;
  view?: string;
  year?: string;
  month?: string;
}>;

/** date 파라미터 → dateFrom/dateTo 변환 */
function resolveDateRange(date?: string): { dateFrom?: string; dateTo?: string } {
  if (!date) return {};
  const now = new Date();
  const fmt = (d: Date) => formatISO(d, { representation: "date" });
  switch (date) {
    case "this-month": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { dateFrom: fmt(first), dateTo: fmt(last) };
    }
    case "next-month": {
      const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return { dateFrom: fmt(first), dateTo: fmt(last) };
    }
    case "3-months":
      return { dateFrom: fmt(now), dateTo: fmt(addMonths(now, 3)) };
    case "6-months":
      return { dateFrom: fmt(now), dateTo: fmt(addMonths(now, 6)) };
    default:
      return {};
  }
}

export default async function ConferencesListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() || undefined;
  const category = sp.category?.trim() || undefined;
  const city = sp.city?.trim() || undefined;
  const date = sp.date?.trim() || undefined;
  const isCalendar = sp.view === "calendar";
  const isFeatured = sp.view === "featured";

  // 캘린더 뷰: 연/월 파라미터
  const now = new Date();
  const calYear = Number(sp.year) || now.getFullYear();
  const calMonth = Math.min(12, Math.max(1, Number(sp.month) || (now.getMonth() + 1)));

  const { dateFrom, dateTo } = resolveDateRange(date);

  const [{ rows, total }, categories, cities, sideBanner, bookmarkedIds] =
    await Promise.all([
      isCalendar
        ? { rows: [], total: 0 }
        : listConferences({
            q,
            category,
            city,
            dateFrom,
            dateTo,
            featured: isFeatured,
            page,
            pageSize: PAGE_SIZE,
          }),
      getSpecialtyCounts(),
      getCityCounts(),
      getBannerForSlot("list_sidebar"),
      getMyBookmarkIds(),
    ]);

  // 캘린더 뷰 데이터
  const calConfs = isCalendar
    ? await listConferencesForMonth(calYear, calMonth)
    : [];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const title = isFeatured
    ? "Featured 학술대회"
    : q
    ? `"${q}" 검색 결과`
    : category
    ? `${category} 학술대회`
    : city
    ? `${city} 학술대회`
    : isCalendar
    ? "캘린더"
    : "전체 학술대회";

  return (
    <>
      <Header />

      {/* ── Hero bar ─────────────────────────────────────────────────────── */}
      <div className="bm-list-hero">
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: -0.4,
                color: "var(--bm-text-primary)",
              }}
            >
              {title}
            </h1>
            {!isCalendar && (
              <div style={{ marginTop: 4, fontSize: 13, color: "var(--bm-text-secondary)" }}>
                총 <span className="mono-num">{total}</span>건
              </div>
            )}
          </div>
          <ViewToggle current={isCalendar ? "calendar" : "grid"} />
        </div>
      </div>

      <main
        className="bm-main"
        style={{
          paddingTop: 24,
          paddingBottom: 64,
        }}
      >
        {/* 캘린더 뷰 */}
        {isCalendar ? (
          <CalendarView
            conferences={calConfs}
            year={calYear}
            month={calMonth}
            bookmarkedIds={bookmarkedIds}
          />
        ) : isFeatured ? (
          /* Featured 뷰 — 사이드바 없이 전체 너비 */
          <div>
            {rows.length > 0 ? (
              <ConferenceGrid conferences={rows} bookmarkedIds={bookmarkedIds} />
            ) : (
              <EmptyState
                title="Featured 학술대회가 없습니다"
                description="현재 Featured로 선정된 학술대회가 없습니다."
                action={
                  <Link href="/conferences">
                    <Button variant="outline" size="sm">전체 보기</Button>
                  </Link>
                }
              />
            )}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
                <PaginationClient current={page} total={totalPages} />
              </div>
            )}
          </div>
        ) : (
          /* 일반 뷰 — sidebar + content */
          <div className="bm-list-layout">
            {/* 사이드바 필터 (데스크톱) */}
            <div className="bm-show-desktop">
              <ListSidebar
                categories={categories}
                cities={cities}
                currentCategory={category}
                currentCity={city}
                currentDate={date}
              />
            </div>

            {/* 콘텐츠 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 모바일용 축약 필터 (md 미만에서만 보임) */}
              <div
                className="bm-show-mobile"
                style={{
                  background: "var(--bm-surface)",
                  border: "1px solid var(--bm-border)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  marginBottom: 14,
                }}
              >
                <FilterPanel
                  categories={categories}
                  cities={cities}
                  currentCategory={category}
                  currentCity={city}
                  currentDate={date}
                />
              </div>

              {rows.length > 0 ? (
                <>
                  <ConferenceGrid conferences={rows} bookmarkedIds={bookmarkedIds} />
                  {totalPages > 1 && (
                    <div
                      style={{ display: "flex", justifyContent: "center", marginTop: 40 }}
                    >
                      <PaginationClient current={page} total={totalPages} />
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  title="조건에 맞는 학술대회가 없습니다"
                  description="검색어나 필터를 조정해 보세요."
                  action={
                    <Link href="/conferences">
                      <Button variant="outline" size="sm">
                        필터 초기화
                      </Button>
                    </Link>
                  }
                />
              )}
            </div>

            {/* 배너 광고 (사이드바 오른쪽) */}
            {sideBanner && (
              <aside style={{ position: "sticky", top: 88, flexShrink: 0 }}>
                <AdBanner
                  size="square"
                  sponsor={sideBanner.advertiser_name ?? undefined}
                  title={sideBanner.title ?? "Sponsor"}
                  cta="자세히"
                  href={sideBanner.link_url}
                />
              </aside>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
