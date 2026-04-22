import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { ConferenceGrid } from "@/components/home/ConferenceGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AdBanner } from "@/components/ui/AdBanner";
import { FilterChips } from "@/components/conferences/FilterChips";
import { PaginationClient } from "@/components/conferences/PaginationClient";
import {
  listConferences,
  getSpecialtyCounts,
  getBannerForSlot,
  getMyBookmarkIds,
} from "@/lib/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  page?: string;
  view?: string;
}>;

export default async function ConferencesListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim() || undefined;
  const category = sp.category?.trim() || undefined;
  const featured = sp.view === "featured";

  const [{ rows, total }, categories, sideBanner, bookmarkedIds] = await Promise.all([
    listConferences({
      q,
      category,
      featured,
      page,
      pageSize: PAGE_SIZE,
    }),
    getSpecialtyCounts(),
    getBannerForSlot("list_sidebar"),
    getMyBookmarkIds(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const title = featured
    ? "Featured 학술대회"
    : q
    ? `검색 결과: "${q}"`
    : category
    ? `${category} 학술대회`
    : "전체 학술대회";

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px 64px" }}>
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -0.4,
              color: "var(--bm-text-primary)",
            }}
          >
            {title}
          </h1>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "var(--bm-text-secondary)",
            }}
          >
            총 <span className="mono-num">{total}</span>건
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <FilterChips categories={categories} current={category} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: sideBanner ? "1fr 280px" : "1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div>
            {rows.length > 0 ? (
              <ConferenceGrid conferences={rows} bookmarkedIds={bookmarkedIds} />
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

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 40,
                }}
              >
                <PaginationClient current={page} total={totalPages} />
              </div>
            )}
          </div>

          {sideBanner && (
            <aside style={{ position: "sticky", top: 88 }}>
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
      </main>
      <Footer />
    </>
  );
}
