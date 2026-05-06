"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function toggleBannerActive(id: number, currentActive: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("banners").update({ is_active: !currentActive }).eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidatePath("/conferences");
}

export async function deleteBanner(id: number) {
  await requireAdmin();
  const sb = createAdminClient();

  // 이미지 파일이 Storage에 있으면 함께 삭제 시도 (best-effort)
  const { data: banner } = await sb
    .from("banners")
    .select("image_url")
    .eq("id", id)
    .single();
  if (banner?.image_url?.includes("/storage/v1/object/public/banners/")) {
    const path = banner.image_url.split("/banners/").slice(-1)[0];
    if (path) await sb.storage.from("banners").remove([path]);
  }

  await sb.from("banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidatePath("/conferences");
}

/**
 * 파일 업로드 → Supabase Storage 'banners' bucket → public URL 반환.
 * GIF / PNG / JPEG / WebP / SVG 지원 (최대 10MB).
 */
async function uploadFileToStorage(file: File): Promise<{
  ok: true;
  url: string;
} | { ok: false; error: string }> {
  if (file.size === 0) return { ok: false, error: "빈 파일입니다." };
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `파일 크기 제한 초과 (최대 ${MAX_BYTES / 1024 / 1024}MB)` };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return {
      ok: false,
      error: `지원하지 않는 파일 형식: ${file.type}. PNG/JPEG/WebP/GIF/SVG만 가능.`,
    };
  }

  const sb = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9가-힣_-]+/g, "_")
    .slice(0, 60);
  const path = `${Date.now()}-${safeBase}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await sb.storage
    .from("banners")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: "31536000",
    });

  if (uploadErr) {
    return { ok: false, error: `업로드 실패: ${uploadErr.message}` };
  }

  const { data: pub } = sb.storage.from("banners").getPublicUrl(path);
  return { ok: true, url: pub.publicUrl };
}

export async function createBanner(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const title = (formData.get("title") as string)?.trim() || null;
  const link_url = (formData.get("link_url") as string)?.trim();
  const advertiser_name = (formData.get("advertiser_name") as string)?.trim() || null;
  const priority = Number(formData.get("priority") || 0);
  const file = formData.get("file") as File | null;
  const fallbackUrl = (formData.get("image_url") as string)?.trim() || null;

  if (!link_url) {
    return { error: "링크 URL은 필수입니다." };
  }
  if (!file && !fallbackUrl) {
    return { error: "이미지 파일을 업로드하거나 이미지 URL을 입력해야 합니다." };
  }

  let imageUrl: string;
  if (file && file.size > 0) {
    const upload = await uploadFileToStorage(file);
    if (!upload.ok) return { error: upload.error };
    imageUrl = upload.url;
  } else {
    imageUrl = fallbackUrl!;
  }

  const sb = createAdminClient();
  const { error } = await sb.from("banners").insert({
    title,
    slot_name: "right_sidebar", // 단일 슬롯으로 고정
    link_url,
    image_url: imageUrl,
    advertiser_name,
    priority,
    is_active: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidatePath("/conferences");
  return { error: null };
}

/**
 * 기존 배너의 이미지를 새 파일로 교체 (기존 Storage 파일은 삭제).
 */
export async function replaceBannerImage(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const file = formData.get("file") as File | null;
  if (!Number.isFinite(id) || !file || file.size === 0) {
    return { error: "id와 파일이 모두 필요합니다." };
  }

  const sb = createAdminClient();
  const { data: existing } = await sb
    .from("banners")
    .select("image_url")
    .eq("id", id)
    .single();

  const upload = await uploadFileToStorage(file);
  if (!upload.ok) return { error: upload.error };

  await sb.from("banners").update({ image_url: upload.url }).eq("id", id);

  // 옛 파일 정리
  if (existing?.image_url?.includes("/storage/v1/object/public/banners/")) {
    const oldPath = existing.image_url.split("/banners/").slice(-1)[0];
    if (oldPath) await sb.storage.from("banners").remove([oldPath]);
  }

  revalidatePath("/admin/banners");
  revalidatePath("/");
  revalidatePath("/conferences");
  return { error: null };
}
