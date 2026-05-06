import { createClient } from "@/lib/supabase/server";
import { Header } from "./Header";

export async function HeaderServer() {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  let userType: string | null = null;
  if (data.user) {
    const { data: profile } = await sb
      .from("users_profile")
      .select("user_type")
      .eq("id", data.user.id)
      .maybeSingle();
    userType = profile?.user_type ?? null;
  }
  return <Header userEmail={data.user?.email ?? null} userType={userType} />;
}
