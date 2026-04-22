import { NextResponse } from "next/server";
import { getMyBookmarkedConferences } from "@/lib/queries";
import { conferencesToIcs } from "@/lib/ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Full .ics export of the signed-in user's bookmarks. */
export async function GET() {
  const list = await getMyBookmarkedConferences();
  if (list.length === 0) {
    return NextResponse.json({ error: "no bookmarks" }, { status: 404 });
  }

  const ics = conferencesToIcs(list);
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="biomice-my-conferences.ics"',
      "Cache-Control": "private, no-store",
    },
  });
}
