import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdapter } from "@/lib/crawler/hospitals";

export const dynamic = "force-dynamic";

type Params = Promise<{ code: string; externalId: string }>;

const CACHE_HOURS = 6;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

/** GET /api/hospitals/[code]/doctors/[externalId]/schedule */
export async function GET(
  _req: Request,
  { params }: { params: Params },
) {
  const { code, externalId } = await params;
  const sb: AnyClient = await createClient();

  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // pharma 유저만 접근
  const { data: profile } = await sb.from("users_profile").select("user_type").eq("id", auth.user.id).maybeSingle();
  if (profile?.user_type !== "pharma") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // hospital + doctor 조회
  const { data: hospital } = await sb.from("hospitals").select("id").eq("code", code).maybeSingle();
  if (!hospital) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
  }

  const { data: doctor } = await sb
    .from("hospital_doctors")
    .select("id, schedule_raw, last_schedule_crawled_at")
    .eq("hospital_id", hospital.id)
    .eq("external_id", externalId)
    .maybeSingle();

  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  // 캐시 유효 여부 확인 (6시간)
  const lastCrawled = doctor.last_schedule_crawled_at
    ? new Date(doctor.last_schedule_crawled_at)
    : null;
  const isStale =
    !lastCrawled ||
    Date.now() - lastCrawled.getTime() > CACHE_HOURS * 3_600_000;

  if (!isStale && doctor.schedule_raw) {
    return NextResponse.json({ schedule: doctor.schedule_raw, cached: true });
  }

  // 어댑터로 실시간 크롤
  const adapter = getAdapter(code);
  if (!adapter) {
    // 어댑터 미구현 — 캐시된 데이터 반환 (없으면 null)
    return NextResponse.json({
      schedule: doctor.schedule_raw ?? null,
      cached: true,
      adapterMissing: true,
    });
  }

  try {
    const scheduleRaw = await adapter.fetchDoctorSchedule(externalId);
    if (scheduleRaw) {
      await sb.from("hospital_doctors").update({
        schedule_raw: scheduleRaw,
        last_schedule_crawled_at: new Date().toISOString(),
      }).eq("id", doctor.id);
    }
    return NextResponse.json({ schedule: scheduleRaw, cached: false });
  } catch (err) {
    console.error(`Schedule crawl failed for ${code}/${externalId}:`, err);
    return NextResponse.json({
      schedule: doctor.schedule_raw ?? null,
      cached: true,
      error: "crawl_failed",
    });
  }
}
