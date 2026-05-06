"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MemoType = "visit" | "meeting" | "note";

export type VisitMemo = {
  id: number;
  user_id: string;
  doctor_id: number | null;
  memo_type: MemoType;
  visit_date: string;
  content: string;
  conference_id: number | null;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  hospital_doctors?: {
    name: string;
    department: string | null;
    hospitals?: { code: string; name: string } | null;
  } | null;
  conferences?: { title: string } | null;
};

export type MemoFilters = {
  memoType?: MemoType;
  doctorId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export async function createMemo(input: {
  doctorId?: number;
  memoType: MemoType;
  visitDate: string;
  content: string;
  conferenceId?: number;
  isShared?: boolean;
}): Promise<{ id?: number; error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { data, error } = await sb.from("visit_memos").insert({
    user_id: auth.user.id,
    doctor_id: input.doctorId ?? null,
    memo_type: input.memoType,
    visit_date: input.visitDate,
    content: input.content,
    conference_id: input.conferenceId ?? null,
    is_shared: input.isShared ?? false,
  }).select("id").single();

  if (error) return { error: error.message };
  revalidatePath("/memos");
  revalidatePath("/mypage");
  return { id: data?.id };
}

export async function updateMemo(id: number, content: string): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("visit_memos")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) return { error: error.message };
  revalidatePath("/memos");
  return {};
}

export async function deleteMemo(id: number): Promise<{ error?: string }> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: "로그인이 필요합니다." };

  const { error } = await sb
    .from("visit_memos")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) return { error: error.message };
  revalidatePath("/memos");
  revalidatePath("/mypage");
  return {};
}

export async function getMyMemos(filters: MemoFilters = {}): Promise<VisitMemo[]> {
  const sb: AnyClient = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];

  let query = sb
    .from("visit_memos")
    .select(`
      id, user_id, doctor_id, memo_type, visit_date, content,
      conference_id, is_shared, created_at, updated_at,
      hospital_doctors (
        name, department,
        hospitals ( code, name )
      ),
      conferences ( title )
    `)
    .eq("user_id", auth.user.id)
    .order("visit_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.memoType) query = query.eq("memo_type", filters.memoType);
  if (filters.doctorId) query = query.eq("doctor_id", filters.doctorId);
  if (filters.dateFrom) query = query.gte("visit_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("visit_date", filters.dateTo);

  const { data } = await query;
  let results = (data ?? []) as VisitMemo[];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        (m.hospital_doctors?.name ?? "").toLowerCase().includes(q) ||
        (m.conferences?.title ?? "").toLowerCase().includes(q),
    );
  }

  return results;
}
