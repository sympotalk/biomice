"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileUpdateInput = {
  display_name?: string;
  organization?: string;
  specialty?: string;
  phone?: string;
  pharma_sub_type?: string;
};

export async function updateProfile(
  input: ProfileUpdateInput,
): Promise<{ error?: string }> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("users_profile")
    .update({
      display_name: input.display_name?.trim() || null,
      organization: input.organization?.trim() || null,
      specialty: input.specialty?.trim() || null,
      phone: input.phone?.trim() || null,
      pharma_sub_type: input.pharma_sub_type || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/mypage");
  return {};
}
