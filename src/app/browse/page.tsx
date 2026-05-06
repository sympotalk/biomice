import { redirect } from "next/navigation";
import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { HOSPITAL_META } from "@/lib/crawler/hospitals";
import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export const dynamic = "force-dynamic";
export const metadata = { title: "의료진 검색 · BioMICE" };

const REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "기타"];

export default async function BrowsePage() {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/browse");
  if (me.profile?.user_type !== "pharma") redirect("/");

  const sb: AnyClient = await createClient();
  const { data: dbHospitals } = await sb
    .from("hospitals")
    .select("code, doctor_count, last_crawled_at, is_active");

  const dbMap = new Map<string, { doctor_count: number; last_crawled_at: string | null; is_active: boolean }>(
    (dbHospitals ?? []).map((r: { code: string; doctor_count: number; last_crawled_at: string | null; is_active: boolean }) => [r.code, r])
  );

  const hospitals = HOSPITAL_META.map((h) => {
    const db = dbMap.get(h.code);
    return { ...h, doctorCount: db?.doctor_count ?? 0, lastCrawledAt: db?.last_crawled_at ?? null };
  });

  const byRegion = new Map<string, typeof hospitals>();
  for (const h of hospitals) {
    const r = REGIONS.includes(h.region) ? h.region : "기타";
    if (!byRegion.has(r)) byRegion.set(r, []);
    byRegion.get(r)!.push(h);
  }

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: -0.4 }}>
            의료진 검색
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--bm-text-secondary)" }}>
            전국 주요 병원 의사 정보 및 진료시간을 확인하세요. (MR 전용)
          </p>
        </div>

        {REGIONS.filter((r) => byRegion.has(r)).map((region) => (
          <section key={region} style={{ marginBottom: 32 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "var(--bm-text-primary)" }}>
              {region}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {byRegion.get(region)!.map((h) => (
                <Link
                  key={h.code}
                  href={`/browse/${h.code}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: 16,
                    background: "var(--bm-surface)",
                    border: "1px solid var(--bm-border)",
                    borderRadius: 10,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color .12s",
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--bm-text-primary)" }}>
                    {h.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {h.doctorCount > 0 ? (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--bm-success)",
                          background: "var(--bm-success-subtle)",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        의사 {h.doctorCount}명
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--bm-text-tertiary)",
                          background: "var(--bm-bg-muted)",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        준비 중
                      </span>
                    )}
                    {h.lastCrawledAt && (
                      <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>
                        {new Date(h.lastCrawledAt).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })} 갱신
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
