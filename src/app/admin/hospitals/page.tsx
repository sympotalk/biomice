import { requireAdmin } from "@/lib/admin";
import { HOSPITAL_META, getAdapter } from "@/lib/crawler/hospitals";
import { createAdminClient } from "@/lib/supabase/admin";
import { HospitalCrawlerPanel } from "./HospitalCrawlerPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "병원 크롤러 · BioMICE Admin" };

export default async function AdminHospitalsPage() {
  await requireAdmin();

  const sb = createAdminClient();

  // DB의 hospitals 테이블에서 크롤 상태 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sbAny = sb as any;
  const { data: dbHospitals } = await sbAny
    .from("hospitals")
    .select("code, doctor_count, last_crawled_at, is_active");

  const dbMap = new Map<string, { doctor_count: number; last_crawled_at: string | null }>(
    (dbHospitals ?? []).map((h: { code: string; doctor_count: number; last_crawled_at: string | null }) => [
      h.code,
      { doctor_count: h.doctor_count, last_crawled_at: h.last_crawled_at },
    ]),
  );

  const hospitals = HOSPITAL_META.map((h) => {
    const db = dbMap.get(h.code);
    return {
      code: h.code,
      name: h.name,
      region: h.region,
      hasAdapter: getAdapter(h.code) !== null,
      doctorCount: db?.doctor_count ?? null,
      lastCrawledAt: db?.last_crawled_at ?? null,
    };
  });

  const adaptedCount = hospitals.filter((h) => h.hasAdapter).length;

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: -0.4 }}>
        병원 크롤러 관리
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--bm-text-secondary)", lineHeight: 1.6 }}>
        각 병원 어댑터를 실행하여 의사 목록을 <code>hospital_doctors</code> 테이블에 저장합니다.
        현재 <strong>{adaptedCount}개</strong> 병원에 어댑터가 구현되어 있습니다.
        크롤 전 <strong>dry-run</strong>으로 결과를 미리 확인하세요.
      </p>

      <div
        style={{
          marginBottom: 20,
          padding: "12px 16px",
          background: "#FFF9E6",
          border: "1px solid #F5D060",
          borderRadius: 8,
          fontSize: 12,
          color: "#7A5A00",
          lineHeight: 1.6,
        }}
      >
        <strong>⚠ 크롤 주의사항</strong><br />
        각 병원 사이트를 직접 스크래핑합니다. 과도한 요청은 IP 차단을 유발할 수 있으므로
        한 번에 하나씩 실행하고, 오류 발생 시 해당 병원의 HTML 구조를 확인 후 어댑터 selector를 수정하세요.
        어댑터 파일 위치: <code>src/lib/crawler/hospitals/adapters/</code>
      </div>

      <HospitalCrawlerPanel hospitals={hospitals} />
    </div>
  );
}
