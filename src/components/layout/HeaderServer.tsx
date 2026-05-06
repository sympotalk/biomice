import { createClient } from "@/lib/supabase/server";
import { Header } from "./Header";

export async function HeaderServer() {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  let userType: string | null = null;
  let displayName: string | null = null;
  let organization: string | null = null;
  if (data.user) {
    const { data: profile } = await sb
      .from("users_profile")
      .select("user_type, display_name, organization")
      .eq("id", data.user.id)
      .maybeSingle();
    userType = profile?.user_type ?? null;
    displayName = profile?.display_name ?? null;
    organization = profile?.organization ?? null;
  }
  return (
    <Header
      userEmail={data.user?.email ?? null}
      userType={userType}
      displayName={displayName}
      organization={organization}
    />
  );
}
