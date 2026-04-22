"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateNotifySettings(formData: FormData) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;

  const enabled = formData.get("notify_enabled") === "1";

  // notify_days: 체크된 값만 배열로
  const raw = formData.getAll("notify_days");
  const days = raw
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0);

  await sb
    .from("users_profile")
    .update({
      notify_enabled: enabled,
      notify_days: days.length > 0 ? days : [7, 1],
    })
    .eq("id", user.id);

  revalidatePath("/mypage");
}
