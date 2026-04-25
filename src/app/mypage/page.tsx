import Link from "next/link";
import { redirect } from "next/navigation";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { ConferenceGrid } from "@/components/home/ConferenceGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { NotifySettings } from "./NotifySettings";
import { getMyProfile, getMyBookmarkedConferences } from "@/lib/queries";
import { logoutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "내 페이지 · BioMICE" };

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

  // 임박한 즐겨찾기 (D-7 이내)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingSoon = bookmarked.filter((c) => {
    const d = new Date(c.start_date);
    const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    return days >= 0 && days <= 7;
  }).length;

  const userInitial = (me.user.email ?? "U").slice(0, 1).toUpperCase();
  const userTypeLabel =
    me.profile?.user_type ? USER_TYPE_LABEL[me.profile.user_type] : null;

  return (
    <>
      <Header />
      <main
        className="bm-main"
        style={{ paddingTop: 18, paddingBottom: 64 }}
      >
        {/* Profile section */}
        <section
          style={{
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 12,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: "var(--bm-primary-subtle)",
                color: "var(--bm-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {userInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--bm-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {me.profile?.organization || "BioMICE 사용자"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--bm-text-tertiary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginTop: 2,
                }}
              >
                {me.user.email}
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                style={{
                  height: 32,
                  padding: "0 12px",
                  border: "1px solid var(--bm-border)",
                  borderRadius: 6,
                  background: "var(--bm-bg)",
                  color: "var(--bm-text-secondary)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                로그아웃
              </button>
            </form>
          </div>

          {/* Stats grid */}
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
            }}
          >
            <StatBox value={String(bookmarked.length)} label="즐겨찾기" />
            <StatBox
              value={String(upcomingSoon)}
              label="D-7 임박"
              accent={upcomingSoon > 0}
            />
            <StatBox
              value={userTypeLabel ?? "-"}
              label="회원 유형"
              isText
            />
          </div>

          {bookmarked.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <a href="/api/ics/my" download style={{ display: "block" }}>
                <Button variant="outline" size="sm" fullWidth>
                  내 일정 .ics 다운로드 (전체 {bookmarked.length}건)
                </Button>
              </a>
            </div>
          )}
        </section>

        {/* Notification Settings */}
        <NotifySettings
          enabled={me.profile?.notify_enabled ?? true}
          days={(me.profile?.notify_days as number[] | null) ?? [7, 1]}
        />

        {/* Bookmarks */}
        <section style={{ marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 14,
              gap: 16,
            }}
          >
            <div>
              <h2
                className="bm-section-h2"
                style={{ margin: 0 }}
              >
                내 즐겨찾기
              </h2>
              <div
                className="bm-section-caption"
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

function StatBox({
  value,
  label,
  accent,
  isText,
}: {
  value: string;
  label: string;
  accent?: boolean;
  isText?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--bm-bg-muted)",
        borderRadius: 6,
        padding: "10px 8px",
        textAlign: "center",
      }}
    >
      <div
        className={isText ? "" : "mono-num"}
        style={{
          fontSize: isText ? 14 : 18,
          fontWeight: 800,
          color: accent ? "var(--bm-accent)" : "var(--bm-text-primary)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--bm-text-tertiary)",
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}
