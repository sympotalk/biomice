"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleFeatured(id: number, currentFeatured: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("conferences").update({ is_featured: !currentFeatured }).eq("id", id);
  revalidatePath("/admin/conferences");
  revalidatePath("/conferences");
  revalidatePath("/");
}

export async function softDeleteConference(id: number) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("conferences").update({ is_deleted: true }).eq("id", id);
  revalidatePath("/admin/conferences");
  revalidatePath("/conferences");
}

export async function restoreConference(id: number) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb.from("conferences").update({ is_deleted: false }).eq("id", id);
  revalidatePath("/admin/conferences");
}
