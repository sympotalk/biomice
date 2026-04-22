import { addDays, formatISO } from "date-fns";
import { createClient as createServerClient } from "./supabase/server";
import type { Conference, Banner, Society } from "./database.types";

const today = () => formatISO(new Date(), { representation: "date" });

export async function listFeaturedConferences(limit = 6): Promise<Conference[]> {
  const sb = await createServerClient();
  const { data, error } = await sb
    .from("conferences")
    .select("*")
    .eq("is_featured", true)
    .gte("start_date", today())
    .order("start_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listThisWeekConferences(limit = 12): Promise<Conference[]> {
  const sb = await createServerClient();
  const now = new Date();
  const weekAhead = formatISO(addDays(now, 7), { representation: "date" });

  const { data, error } = await sb
    .from("conferences")
    .select("*")
    .gte("start_date", today())
    .lte("start_date", weekAhead)
    .order("start_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listUpcomingConferences(limit = 12): Promise<Conference[]> {
  const sb = await createServerClient();
  const { data, error } = await sb
    .from("conferences")
    .select("*")
    .gte("start_date", today())
    .order("start_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getSpecialtyCounts(): Promise<{ category: string; count: number }[]> {
  const sb = await createServerClient();
  // Pull future conferences and aggregate in JS (works around limited select RPC).
  const { data, error } = await sb
    .from("conferences")
    .select("category")
    .gte("start_date", today());
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.category) continue;
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export async function listConferences(params: {
  q?: string;
  category?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  from?: "upcoming" | "all";
}): Promise<{ rows: Conference[]; total: number }> {
  const sb = await createServerClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 12;
  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  let query = sb
    .from("conferences")
    .select("*", { count: "exact" })
    .order("start_date", { ascending: true })
    .range(fromIdx, toIdx);

  if (params.from !== "all") {
    query = query.gte("start_date", today());
  }
  if (params.q) {
    const q = params.q.replace(/,/g, " ").trim();
    // Search event_name OR society_name (case-insensitive)
    query = query.or(`event_name.ilike.%${q}%,society_name.ilike.%${q}%`);
  }
  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.featured) {
    query = query.eq("is_featured", true);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getConference(id: number): Promise<Conference | null> {
  const sb = await createServerClient();
  const { data, error } = await sb
    .from("conferences")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Fetch the set of bookmarked conference ids for the current user.
 * Returns an empty Set when the user is signed out.
 */
export async function getMyBookmarkIds(): Promise<Set<number>> {
  const sb = await createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return new Set();
  const { data, error } = await sb
    .from("bookmarks")
    .select("conference_id")
    .eq("user_id", auth.user.id);
  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.conference_id));
}

/** Fetch the full list of a user's bookmarked conferences (newest first). */
export async function getMyBookmarkedConferences(): Promise<Conference[]> {
  const sb = await createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await sb
    .from("bookmarks")
    .select("created_at, conferences(*)")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .map((r) => r.conferences as unknown as Conference | null)
    .filter((c): c is Conference => c != null);
}

export async function getMyProfile() {
  const sb = await createServerClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data } = await sb
    .from("users_profile")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();
  return { user: auth.user, profile: data };
}

// ─── Societies ────────────────────────────────────────────────────────────────

export type SocietyWithCount = Society & { conference_count: number };

export async function listSocieties(): Promise<SocietyWithCount[]> {
  const sb = await createServerClient();
  // conferences 테이블에서 society_id별 카운트를 집계
  const { data: counts } = await sb
    .from("conferences")
    .select("society_id")
    .not("society_id", "is", null)
    .gte("start_date", today());

  const countMap = new Map<number, number>();
  for (const row of counts ?? []) {
    if (row.society_id == null) continue;
    countMap.set(row.society_id, (countMap.get(row.society_id) ?? 0) + 1);
  }

  const { data, error } = await sb
    .from("societies")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((s) => ({
    ...s,
    conference_count: countMap.get(s.id) ?? 0,
  }));
}

export async function getSocietyBySlug(slug: string): Promise<Society | null> {
  const sb = await createServerClient();
  const { data, error } = await sb
    .from("societies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getSocietyConferences(
  societyId: number,
  from: "upcoming" | "all" = "upcoming",
): Promise<Conference[]> {
  const sb = await createServerClient();
  let query = sb
    .from("conferences")
    .select("*")
    .eq("society_id", societyId)
    .order("start_date", { ascending: true });
  if (from === "upcoming") query = query.gte("start_date", today());
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getBannerForSlot(slotName: string): Promise<Banner | null> {
  const sb = await createServerClient();
  const { data, error } = await sb
    .from("banners")
    .select("*")
    .eq("slot_name", slotName)
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
