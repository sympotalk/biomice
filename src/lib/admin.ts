import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "sympotalk@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

/**
 * Verify the current session is an admin.
 * Call at the top of every admin Server Component / Server Action.
 * Redirects to /login if not authenticated, throws if not authorised.
 */
export async function requireAdmin(): Promise<string> {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) redirect("/login");

  const email = (user.email ?? "").toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) {
    redirect("/");
  }

  return user.id;
}
