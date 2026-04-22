import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { SocietyRowEdit } from "./SocietyRowEdit";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; page?: string }>;

const PAGE_SIZE = 30;

export default async function AdminSocietiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const sb = await createClient();

  let query = sb
    .from("societies")
    .select("id, name, slug, specialty, is_verified, logo_url, website_url", {
      count: "exact",
    })
    .order("name", { ascending: true })
    .range(from, from + PAGE_SIZE - 1);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", "1");
    for (const [k, v] of Object.entries(updates)) {
      if (v == null) params.delete(k);
      else params.set(k, v);
    }
    return `/admin/societies?${params.toString()}`;
  };

  return (
    <div>
      <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: "var(--bm-text-primary)" }}>
        학회 관리
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--bm-text-secondary)" }}>
        총 {count ?? 0}개 학회
      </p>

      {/* 검색 */}
      <form
        method="get"
        action="/admin/societies"
        style={{ display: "flex", gap: 10, marginBottom: 20 }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="학회명 검색…"
          style={{
            flex: 1,
            maxWidth: 320,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid var(--bm-border)",
            fontSize: 13,
            background: "var(--bm-bg)",
            color: "var(--bm-text-primary)",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid var(--bm-border)",
            background: "var(--bm-surface)",
            fontSize: 13,
            cursor: "pointer",
            color: "var(--bm-text-primary)",
          }}
        >
          검색
        </button>
      </form>

      {/* 테이블 */}
      <div
        style={{
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--bm-border)", background: "var(--bm-bg-muted)" }}>
              {["ID", "학회명", "전문과목", "슬러그", "로고 / 인증"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--bm-text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--bm-border)" }}>
                <td style={{ padding: "10px 14px", color: "var(--bm-text-tertiary)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {s.id}
                </td>
                <td style={{ padding: "10px 14px", fontWeight: 500, color: "var(--bm-text-primary)" }}>
                  <Link
                    href={`/societies/${s.slug}`}
                    target="_blank"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {s.name}
                  </Link>
                </td>
                <td style={{ padding: "10px 14px", color: "var(--bm-text-secondary)" }}>
                  {s.specialty ?? "—"}
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--bm-text-tertiary)" }}>
                  {s.slug}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <SocietyRowEdit
                    id={s.id}
                    logoUrl={s.logo_url}
                    isVerified={s.is_verified}
                  />
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "40px 16px",
                    textAlign: "center",
                    color: "var(--bm-text-tertiary)",
                    fontSize: 13,
                  }}
                >
                  결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: String(p) })}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid var(--bm-border)",
                fontSize: 13,
                textDecoration: "none",
                background: p === page ? "var(--bm-primary)" : "var(--bm-surface)",
                color: p === page ? "#fff" : "var(--bm-text-primary)",
                fontWeight: p === page ? 600 : 400,
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
