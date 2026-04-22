"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleBannerActive(id: number, currentActive: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("banners").update({ is_active: !currentActive }).eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/conferences");
}

export async function deleteBanner(id: number) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/conferences");
}

export async function createBanner(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slot_name = formData.get("slot_name") as string;
  const link_url = formData.get("link_url") as string;
  const image_url = formData.get("image_url") as string;
  const advertiser_name = formData.get("advertiser_name") as string;
  const priority = Number(formData.get("priority") || 0);

  if (!slot_name || !link_url || !image_url) {
    return { error: "슬롯명, 링크 URL, 이미지 URL은 필수입니다." };
  }

  const sb = createAdminClient();
  const { error } = await sb.from("banners").insert({
    title: title || null,
    slot_name,
    link_url,
    image_url,
    advertiser_name: advertiser_name || null,
    priority,
    is_active: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/conferences");
  return { error: null };
}
