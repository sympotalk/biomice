"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateSocietyLogoUrl(id: number, logoUrl: string) {
  await requireAdmin();
  const sb = createAdminClient();
  const { error } = await sb
    .from("societies")
    .update({ logo_url: logoUrl || null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/societies");
  revalidatePath("/societies");
}

export async function updateSocietyVerified(id: number, isVerified: boolean) {
  await requireAdmin();
  const sb = createAdminClient();
  await sb
    .from("societies")
    .update({ is_verified: !isVerified, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/societies");
  revalidatePath("/societies");
}
