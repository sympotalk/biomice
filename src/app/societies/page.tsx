import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { listSocieties } from "@/lib/queries";
import { ExternalIcon } from "@/components/ui/Icon";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "학회 목록 · biomice",
  description: "biomice에 등록된 국내 의학 학회 목록입니다.",
};

export default async function SocietiesPage() {
  const societies = await listSocieties();

  // specialty별 그룹핑
  const grouped = new Map<string, typeof societies>();
  const noSpecialty: typeof societies = [];
  for (const s of societies) {
    if (!s.specialty) { noSpecialty.push(s); continue; }
    if (!grouped.has(s.specialty)) grouped.set(s.specialty, []);
    grouped.get(s.specialty)!.push(s);
  }
  const specialties = [...grouped.keys()].sort();

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px 64px" }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "clamp(24px,4vw,36px)",
              fontWeight: 700,
              letterSpacing: -0.5,
              color: "var(--bm-text-primary)",
            }}
          >
            학회 목록
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--bm-text-secondary)" }}>
            총 <strong>{societies.length}</strong>개 학회 · 예정 학술대회 보유 기준
          </p>
        </div>

        {/* 전공과목 그룹 */}
        {specialties.map((sp) => (
          <section key={sp} style={{ marginBottom: 40 }}>
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--bm-primary)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 18,
                  background: "var(--bm-primary)",
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              {sp}
            </h2>
            <SocietyGrid societies={grouped.get(sp)!} />
          </section>
        ))}

        {/* 미분류 */}
        {noSpecialty.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--bm-text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 18,
                  background: "var(--bm-border)",
                  borderRadius: 2,
                  display: "inline-block",
                }}
              />
              기타
            </h2>
            <SocietyGrid societies={noSpecialty} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function SocietyGrid({
  societies,
}: {
  societies: Awaited<ReturnType<typeof listSocieties>>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 12,
      }}
    >
      {societies.map((s) => (
        <Link
          key={s.id}
          href={`/societies/${s.slug}`}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-border)",
              borderRadius: 10,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "border-color .15s, box-shadow .15s",
            }}
            className="card-hover"
          >
            {/* 이니셜 아바타 */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "var(--bm-primary-subtle)",
                color: "var(--bm-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {s.name.slice(2, 4)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--bm-text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.name}
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontSize: 12,
                  color: "var(--bm-text-tertiary)",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                {s.conference_count > 0 ? (
                  <span>예정 {s.conference_count}건</span>
                ) : (
                  <span>예정 일정 없음</span>
                )}
                {s.website_url && (
                  <ExternalIcon style={{ width: 11, height: 11, opacity: 0.5 }} />
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
