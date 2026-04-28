"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { getAdapter } from "@/lib/crawler/intl/registry";
import { runIntlCrawler, runAllIntlCrawlers } from "@/lib/crawler/intl/runner";
import type { CrawlResult } from "@/lib/crawler/intl/types";

/**
 * 관리자 페이지에서 어댑터를 직접 실행. CRAWLER_TOKEN 불필요.
 * Supabase admin 세션이면 통과. (Cron Trigger는 /api/cron/intl + 토큰 사용)
 */
export async function runCrawlerAction(
  sourceKey: string | null,
  dryRun: boolean,
): Promise<
  | { ok: true; dryRun: boolean; result?: CrawlResult; results?: CrawlResult[] }
  | { ok: false; error: string }
> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "관리자 권한이 필요합니다" };
  }

  try {
    if (sourceKey) {
      const adapter = getAdapter(sourceKey);
      if (!adapter) {
        return { ok: false, error: `unknown source: ${sourceKey}` };
      }
      const result = await runIntlCrawler(adapter, { dryRun });
      // 결과가 DB에 반영되었으면 리스트 캐시 무효화
      if (!dryRun && result.inserted + result.updated > 0) {
        revalidatePath("/admin/crawlers");
        revalidatePath("/conferences");
      }
      return { ok: true, dryRun, result };
    }

    const results = await runAllIntlCrawlers({ dryRun });
    if (!dryRun) {
      revalidatePath("/admin/crawlers");
      revalidatePath("/conferences");
    }
    return { ok: true, dryRun, results };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * 학술대회의 manual 필드 (cme_credits_kr / related_korean_society / is_kams_certified)
 * 를 admin이 직접 수정.
 *
 * 인증: requireAdmin() — admin email만 허용.
 */
export async function updateConferenceManualFields(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) {
    return { error: "invalid id" };
  }

  const cmeCreditsKrRaw = formData.get("cme_credits_kr");
  const cmeCreditsKr =
    cmeCreditsKrRaw === null || cmeCreditsKrRaw === ""
      ? null
      : Number(cmeCreditsKrRaw);
  if (cmeCreditsKr !== null && !Number.isFinite(cmeCreditsKr)) {
    return { error: "invalid cme_credits_kr" };
  }

  const relatedKoreanSociety =
    (formData.get("related_korean_society") as string | null)?.trim() || null;

  const isKamsCertified = formData.get("is_kams_certified") === "on";

  const sb = createAdminClient();
  const { error } = await sb
    .from("conferences")
    .update({
      cme_credits_kr: cmeCreditsKr,
      related_korean_society: relatedKoreanSociety,
      is_kams_certified: isKamsCertified,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/crawlers");
  revalidatePath(`/conferences/${id}`);
  revalidatePath("/conferences");

  return { ok: true };
}
