import { NextRequest, NextResponse } from "next/server";
import { crawlKams } from "@/lib/crawler/kams";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron-invoked crawler endpoint.
 *
 * Cloudflare Workers triggers can't send custom headers, so this route
 * accepts a shared secret via `?token=` query param instead of a Bearer.
 * Wire up in wrangler.jsonc → triggers.crons.
 *
 * Example (local dry-run):
 *   curl "http://localhost:3000/api/cron?token=$CRAWLER_TOKEN"
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const token = process.env.CRAWLER_TOKEN;
  const sent = req.nextUrl.searchParams.get("token");
  if (!token || sent !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const rows = await crawlKams({
      year: new Date().getFullYear(),
      maxPages: 10,
      fetchDetailPages: true,
      delayMs: 1500,
    });
    if (rows.length === 0) return NextResponse.json({ upserted: 0 });

    const admin = createAdminClient();
    const { error, count } = await admin
      .from("conferences")
      .upsert(rows, { onConflict: "kams_id", count: "exact" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ upserted: count ?? rows.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
