import { createClient } from "@/lib/supabase/server";
import { Header } from "./Header";

export async function HeaderServer() {
  const sb = await createClient();
  const { data } = await sb.auth.getUser();
  return <Header userEmail={data.user?.email ?? null} />;
}
