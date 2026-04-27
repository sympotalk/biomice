"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";

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
