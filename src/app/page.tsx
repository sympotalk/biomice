import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { SectionHeader } from "@/components/home/SectionHeader";
import { ConferenceGrid } from "@/components/home/ConferenceGrid";
import { AdBanner } from "@/components/ui/AdBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  listFeaturedConferences,
  listThisWeekConferences,
  listUpcomingConferences,
  getSpecialtyCounts,
  getBannerForSlot,
  getMyBookmarkIds,
} from "@/lib/queries";

// Per-user bookmark state means we can't statically cache this page.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, thisWeek, upcoming, specialtyCounts, banner, bookmarkedIds] =
    await Promise.all([
      listFeaturedConferences(6),
      listThisWeekConferences(8),
      listUpcomingConferences(12),
      getSpecialtyCounts(),
      getBannerForSlot("main_top"),
      getMyBookmarkIds(),
    ]);

  const topSpecialties = specialtyCounts.slice(0, 8).map((s) => s.category);

  return (
    <>
      <Header />
      <Hero totalUpcoming={upcoming.length} topSpecialties={topSpecialties} />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
        {/* Main top banner */}
        {banner && (
          <div style={{ padding: "24px 0" }}>
            <AdBanner
              size="wide"
              sponsor={banner.advertiser_name ?? undefined}
              title={banner.title ?? "Advertisement"}
              cta="자세히 보기"
              href={banner.link_url}
            />
          </div>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section style={{ padding: "32px 0" }}>
            <SectionHeader
              title="Featured 학술대회"
              caption="주목할 만한 학술대회"
              actionHref="/conferences?view=featured"
            />
            <ConferenceGrid conferences={featured} bookmarkedIds={bookmarkedIds} />
          </section>
        )}

        {/* This week */}
        <section style={{ padding: "32px 0" }}>
          <SectionHeader
            title="이번 주 열리는 학술대회"
            caption={`앞으로 7일 이내 · ${thisWeek.length}건`}
            actionHref="/conferences?view=upcoming"
          />
          {thisWeek.length > 0 ? (
            <ConferenceGrid conferences={thisWeek} scroll bookmarkedIds={bookmarkedIds} />
          ) : (
            <EmptyState
              title="이번 주 예정된 학술대회가 없습니다"
              description="전체 학술대회 목록에서 다가오는 일정을 확인해 보세요."
            />
          )}
        </section>

        {/* Upcoming */}
        <section style={{ padding: "32px 0 64px" }}>
          <SectionHeader
            title="다가오는 학술대회"
            caption="가까운 일정순"
            actionHref="/conferences"
          />
          {upcoming.length > 0 ? (
            <ConferenceGrid conferences={upcoming} bookmarkedIds={bookmarkedIds} />
          ) : (
            <EmptyState />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
