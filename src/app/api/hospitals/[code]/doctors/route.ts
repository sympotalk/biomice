import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = Promise<{ code: string }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

/** GET /api/hospitals/[code]/doctors — 병원 내 의사 목록 */
export async function GET(
  _req: Request,
  { params }: { params: Params },
) {
  const { code } = await params;
  const sb: AnyClient = await createClient();

  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // pharma 유저만 접근
  const { data: profile } = await sb.from("users_profile").select("user_type").eq("id", auth.user.id).maybeSingle();
  if (profile?.user_type !== "pharma") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // hospital_id 조회
  const { data: hospital } = await sb.from("hospitals").select("id").eq("code", code).maybeSingle();
  if (!hospital) {
    return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
  }

  const { data: doctors, error } = await sb
    .from("hospital_doctors")
    .select("id, external_id, name, department, specialty, position, profile_url, notes")
    .eq("hospital_id", hospital.id)
    .order("department", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ doctors: doctors ?? [] });
}
