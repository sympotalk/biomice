import Link from "next/link";
import { redirect } from "next/navigation";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { ConferenceGrid } from "@/components/home/ConferenceGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { getMyProfile, getMyBookmarkedConferences } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "내 페이지 · biomice" };

const USER_TYPE_LABEL: Record<string, string> = {
  doctor: "의사",
  pharma: "제약사",
  other: "기타",
};

export default async function MyPage() {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/mypage");

  const bookmarked = await getMyBookmarkedConferences();
  const bookmarkedIds = new Set(bookmarked.map((c) => c.id));

  return (
    <>
      <Header />
      <main
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px 64px" }}
      >
        {/* Profile card */}
        <section
          style={{
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            display: "flex",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--bm-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            {(me.user.email ?? "U").slice(0, 1)}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--bm-text-primary)",
              }}
            >
              {me.user.email}
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "var(--bm-text-secondary)",
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              {me.profile?.user_type && (
                <span>
                  {USER_TYPE_LABEL[me.profile.user_type] ?? me.profile.user_type}
                </span>
              )}
              {me.profile?.organization && (
                <>
                  <span style={{ color: "var(--bm-text-tertiary)" }}>·</span>
                  <span>{me.profile.organization}</span>
                </>
              )}
              {me.profile?.specialty && (
                <>
                  <span style={{ color: "var(--bm-text-tertiary)" }}>·</span>
                  <span>{me.profile.specialty}</span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {bookmarked.length > 0 && (
              <a href="/api/ics/my" download>
                <Button variant="outline" size="sm">
                  내 일정 .ics 다운로드
                </Button>
              </a>
            )}
          </div>
        </section>

        {/* Bookmarks */}
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 20,
              gap: 16,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: -0.4,
                  color: "var(--bm-text-primary)",
                }}
              >
                내 즐겨찾기
              </h2>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: "var(--bm-text-secondary)",
                }}
              >
                총 <span className="mono-num">{bookmarked.length}</span>건
              </div>
            </div>
          </div>

          {bookmarked.length > 0 ? (
            <ConferenceGrid
              conferences={bookmarked}
              bookmarkedIds={bookmarkedIds}
            />
          ) : (
            <EmptyState
              title="아직 즐겨찾기한 학술대회가 없습니다"
              description="관심있는 학술대회 카드의 하트를 눌러 저장하면 여기에 모입니다."
              action={
                <Link href="/conferences">
                  <Button variant="primary" size="sm">
                    학술대회 둘러보기
                  </Button>
                </Link>
              }
            />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
