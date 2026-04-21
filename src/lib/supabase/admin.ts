import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

/**
 * Server-side admin client using the service role key.
 * Only use inside API routes / server scripts where the key is safe.
 * Never import this from client components.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY missing. Set it in .env.local to run crawler/admin actions.",
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
