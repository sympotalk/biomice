"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ToggleResult = { bookmarked: boolean } | { error: string };

/**
 * Toggle a bookmark for the current user.
 * If the user isn't signed in, redirects to /login?next=<returnTo>.
 */
export async function toggleBookmark(
  conferenceId: number,
  returnTo?: string,
): Promise<ToggleResult> {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  const user = auth.user;
  if (!user) {
    const next = returnTo ?? "/";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  // Is it currently bookmarked?
  const { data: existing, error: selErr } = await sb
    .from("bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("conference_id", conferenceId)
    .maybeSingle();
  if (selErr) return { error: selErr.message };

  if (existing) {
    const { error } = await sb
      .from("bookmarks")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await sb
      .from("bookmarks")
      .insert({ user_id: user.id, conference_id: conferenceId });
    if (error) return { error: error.message };
  }

  // Revalidate pages that show bookmark state.
  revalidatePath("/");
  revalidatePath("/conferences");
  revalidatePath(`/conferences/${conferenceId}`);
  revalidatePath("/mypage");

  return { bookmarked: !existing };
}
