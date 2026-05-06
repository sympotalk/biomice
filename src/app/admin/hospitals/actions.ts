"use server";

import { requireAdmin } from "@/lib/admin";
import { getAdapter, HOSPITAL_META } from "@/lib/crawler/hospitals";
import { createAdminClient } from "@/lib/supabase/admin";

export type CrawlHospitalResult = {
  ok: boolean;
  code: string;
  hospitalName: string;
  inserted: number;
  updated: number;
  skipped: number;
  error?: string;
  durationMs: number;
};

/**
 * 특정 병원 어댑터를 실행하여 hospital_doctors 테이블을 채운다.
 * dryRun=true 이면 DB 쓰기 없이 카운트만 반환.
 */
export async function crawlHospitalAction(
  code: string,
  dryRun = false,
): Promise<CrawlHospitalResult> {
  await requireAdmin();

  const meta = HOSPITAL_META.find((h) => h.code === code);
  const hospitalName = meta?.name ?? code;

  const adapter = getAdapter(code);
  if (!adapter) {
    return {
      ok: false,
      code,
      hospitalName,
      inserted: 0,
      updated: 0,
      skipped: 0,
      error: "어댑터가 등록되지 않았습니다.",
      durationMs: 0,
    };
  }

  const t0 = Date.now();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const doctors = await adapter.fetchDoctors();

    if (dryRun) {
      return {
        ok: true,
        code,
        hospitalName,
        inserted: doctors.length,
        updated: 0,
        skipped: 0,
        durationMs: Date.now() - t0,
      };
    }

    const sb = createAdminClient();

    // hospitals 테이블에 병원 row upsert
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sbAny = sb as any;
    const { data: hospitalRow } = await sbAny
      .from("hospitals")
      .upsert(
        {
          code,
          name: hospitalName,
          region: meta?.region ?? "기타",
          is_active: true,
        },
        { onConflict: "code" },
      )
      .select("id")
      .single();

    const hospitalId: number | null = hospitalRow?.id ?? null;
    if (!hospitalId) {
      return {
        ok: false,
        code,
        hospitalName,
        inserted: 0,
        updated: 0,
        skipped,
        error: "병원 row 생성 실패",
        durationMs: Date.now() - t0,
      };
    }

    // doctor_count 업데이트 예약 (마지막에)
    let finalDoctorCount = 0;

    for (const doc of doctors) {
      if (!doc.name || doc.name.length < 2) {
        skipped++;
        continue;
      }

      const row = {
        hospital_id: hospitalId,
        external_id: doc.externalId,
        name: doc.name,
        department: doc.department || null,
        specialty: doc.specialty || null,
        position: doc.position || null,
        profile_url: doc.profileUrl || null,
        notes: doc.notes || null,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await sbAny
        .from("hospital_doctors")
        .select("id")
        .eq("hospital_id", hospitalId)
        .eq("external_id", doc.externalId)
        .maybeSingle();

      if (existing) {
        await sbAny
          .from("hospital_doctors")
          .update(row)
          .eq("id", existing.id);
        updated++;
      } else {
        await sbAny
          .from("hospital_doctors")
          .insert({ ...row, created_at: new Date().toISOString() });
        inserted++;
      }
      finalDoctorCount++;
    }

    // hospitals.doctor_count + last_crawled_at 갱신
    await sbAny
      .from("hospitals")
      .update({
        doctor_count: finalDoctorCount,
        last_crawled_at: new Date().toISOString(),
      })
      .eq("id", hospitalId);

    return {
      ok: true,
      code,
      hospitalName,
      inserted,
      updated,
      skipped,
      durationMs: Date.now() - t0,
    };
  } catch (e) {
    return {
      ok: false,
      code,
      hospitalName,
      inserted,
      updated,
      skipped,
      error: (e as Error).message,
      durationMs: Date.now() - t0,
    };
  }
}
