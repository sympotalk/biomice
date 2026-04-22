import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  await requireAdmin();
  const sb = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: totalConfs },
    { count: upcomingConfs },
    { count: totalSocieties },
    { count: totalBanners },
    { count: totalBookmarks },
    { count: totalUsers },
  ] = await Promise.all([
    sb.from("conferences").select("*", { count: "exact", head: true }).eq("is_deleted", false),
    sb.from("conferences").select("*", { count: "exact", head: true }).gte("start_date", today).eq("is_deleted", false),
    sb.from("societies").select("*", { count: "exact", head: true }),
    sb.from("banners").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("bookmarks").select("*", { count: "exact", head: true }),
    sb.from("users_profile").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "전체 학술대회", value: totalConfs ?? 0, sub: `예정 ${upcomingConfs ?? 0}건`, accent: false },
    { label: "등록 학회", value: totalSocieties ?? 0, sub: "학회 프로필", accent: false },
    { label: "회원", value: totalUsers ?? 0, sub: "가입 계정", accent: false },
    { label: "북마크", value: totalBookmarks ?? 0, sub: "전체 저장", accent: false },
    { label: "활성 배너", value: totalBanners ?? 0, sub: "현재 게시 중", accent: true },
  ];

  return (
    <div>
      <h1
        style={{
          margin: "0 0 8px",
          fontSize: 24,
          fontWeight: 700,
          color: "var(--bm-text-primary)",
        }}
      >
        대시보드
      </h1>
      <p style={{ margin: "0 0 32px", fontSize: 13, color: "var(--bm-text-secondary)" }}>
        오늘({today}) 기준 현황
      </p>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--bm-surface)",
              border: `1px solid ${s.accent ? "var(--bm-accent-border)" : "var(--bm-border)"}`,
              borderRadius: 10,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: s.accent ? "var(--bm-accent)" : "var(--bm-text-primary)",
                fontFamily: "var(--font-mono)",
                lineHeight: 1,
              }}
            >
              {s.value.toLocaleString()}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--bm-text-primary)",
              }}
            >
              {s.label}
            </div>
            <div style={{ fontSize: 11, color: "var(--bm-text-tertiary)", marginTop: 2 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div
        style={{
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 10,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--bm-text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 16,
          }}
        >
          빠른 이동
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { href: "/admin/conferences", label: "학술대회 관리" },
            { href: "/admin/banners", label: "배너 관리" },
            { href: "/admin/societies", label: "학회 관리" },
            { href: "/conferences", label: "← 사이트 보기" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid var(--bm-border)",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--bm-text-primary)",
                textDecoration: "none",
                background: "var(--bm-bg)",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
