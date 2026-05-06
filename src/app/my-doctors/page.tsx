import { redirect } from "next/navigation";
import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { getMyDoctors } from "@/app/actions/myDoctors";
import { MyDoctorCard } from "./MyDoctorCard";
import { GRADE_LABELS } from "./constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "내 의료진 · BioMICE" };
export { GRADE_LABELS } from "./constants";

export default async function MyDoctorsPage() {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/my-doctors");
  if (me.profile?.user_type !== "pharma") redirect("/");

  const myDoctors = await getMyDoctors();

  const byHospital = new Map<string, typeof myDoctors>();
  for (const md of myDoctors) {
    const hospitalName = md.hospital_doctors?.hospitals?.name ?? "기타";
    if (!byHospital.has(hospitalName)) byHospital.set(hospitalName, []);
    byHospital.get(hospitalName)!.push(md);
  }

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: -0.4 }}>
                내 의료진
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "var(--bm-text-secondary)" }}>
                총 {myDoctors.length}명 등록됨
              </p>
            </div>
            <Link
              href="/browse"
              style={{
                padding: "8px 18px",
                background: "var(--bm-primary)",
                color: "#fff",
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              + 의료진 추가
            </Link>
          </div>

          {/* 등급 범례 */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {Object.entries(GRADE_LABELS).map(([grade, { label, color, bg }]) => (
              <span key={grade} style={{ fontSize: 12, fontWeight: 600, color, background: bg, padding: "3px 10px", borderRadius: 999 }}>
                {label}
              </span>
            ))}
            <span style={{ fontSize: 12, color: "var(--bm-text-tertiary)", alignSelf: "center" }}>
              — 방문 우선순위 등급
            </span>
          </div>
        </div>

        {myDoctors.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏥</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>등록된 의료진이 없습니다</div>
            <div style={{ fontSize: 14, color: "var(--bm-text-secondary)", marginBottom: 20 }}>
              병원 검색에서 의사를 찾아 내 의료진으로 등록해 보세요.
            </div>
            <Link
              href="/browse"
              style={{
                padding: "10px 24px",
                background: "var(--bm-primary)",
                color: "#fff",
                borderRadius: 24,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              의료진 검색하기
            </Link>
          </div>
        ) : (
          [...byHospital.entries()].map(([hospitalName, doctors]) => (
            <section key={hospitalName} style={{ marginBottom: 32 }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "var(--bm-text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                {hospitalName}
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--bm-text-tertiary)" }}>{doctors.length}명</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {doctors.map((md) => (
                  <MyDoctorCard key={md.id} myDoctor={md} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
      <Footer />
    </>
  );
}
