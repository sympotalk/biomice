import { NextRequest, NextResponse } from "next/server";
import { crawlKams } from "@/lib/crawler/kams";
import { createAdminClient } from "@/lib/supabase/admin";

// KAMS crawl can take a while — give it headroom.
export const runtime = "nodejs";
export const maxDuration = 300;

function authorize(req: NextRequest): boolean {
  const token = process.env.CRAWLER_TOKEN;
  if (!token) return false;
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.replace(/^Bearer\s+/i, "");
  const queryToken = req.nextUrl.searchParams.get("token");
  return bearer === token || queryToken === token;
}

export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const year = Number(req.nextUrl.searchParams.get("year")) || undefined;
  const maxPages =
    Number(req.nextUrl.searchParams.get("maxPages")) || undefined;
  const fetchDetailPages =
    req.nextUrl.searchParams.get("detail") === "1";

  try {
    const rows = await crawlKams({ year, maxPages, fetchDetailPages });
    if (rows.length === 0) {
      return NextResponse.json({ crawled: 0, upserted: 0 });
    }

    const admin = createAdminClient();
    const { error, count } = await admin
      .from("conferences")
      .upsert(rows, {
        onConflict: "kams_id",
        count: "exact",
        ignoreDuplicates: false,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message, crawled: rows.length },
        { status: 500 },
      );
    }

    return NextResponse.json({
      crawled: rows.length,
      upserted: count ?? rows.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Convenience GET so cron services that can't POST still work.
export const GET = POST;
