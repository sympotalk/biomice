import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { HOSPITAL_META } from "@/lib/crawler/hospitals";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

/** GET /api/hospitals — 병원 목록 + DB 저장 수 */
export async function GET() {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // hospitals 테이블에서 DB 기록 가져오기
  const { data: dbRows } = await sb.from("hospitals").select("code, doctor_count, last_crawled_at, is_active");
  const dbMap = new Map<string, { doctor_count: number; last_crawled_at: string | null; is_active: boolean }>(
    (dbRows ?? []).map((r: { code: string; doctor_count: number; last_crawled_at: string | null; is_active: boolean }) => [r.code, r])
  );

  const hospitals = HOSPITAL_META.map((h) => {
    const db = dbMap.get(h.code);
    return {
      code: h.code,
      name: h.name,
      region: h.region,
      doctorCount: db?.doctor_count ?? 0,
      lastCrawledAt: db?.last_crawled_at ?? null,
      isActive: db?.is_active ?? false,
    };
  });

  return NextResponse.json({ hospitals });
}
