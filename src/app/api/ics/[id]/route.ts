import { NextResponse } from "next/server";
import { getConference } from "@/lib/queries";
import { conferencesToIcs } from "@/lib/ics";

export const runtime = "nodejs";

type Params = Promise<{ id: string }>;

export async function GET(_req: Request, { params }: { params: Params }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const conf = await getConference(numId);
  if (!conf) return NextResponse.json({ error: "not found" }, { status: 404 });

  const ics = conferencesToIcs([conf]);
  const safeName = conf.event_name
    .replace(/[^\w가-힣]+/g, "_")
    .slice(0, 60);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="biomice-${safeName}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
