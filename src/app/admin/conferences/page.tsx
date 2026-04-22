import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { ConferenceRowActions } from "./ConferenceRowActions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; deleted?: string; page?: string }>;

const PAGE_SIZE = 30;

export default async function AdminConferencesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const showDeleted = sp.deleted === "1";
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const sb = await createClient();

  let query = sb
    .from("conferences")
    .select("id, event_name, society_name, start_date, is_featured, is_deleted, category", {
      count: "exact",
    })
    .order("start_date", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  if (showDeleted) {
    query = query.eq("is_deleted", true);
  } else {
    query = query.eq("is_deleted", false);
  }

  if (q) {
    query = query.or(`event_name.ilike.%${q}%,society_name.ilike.%${q}%`);
  }

  const { data, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (showDeleted) params.set("deleted", "1");
    params.set("page", "1");
    for (const [k, v] of Object.entries(updates)) {
      if (v == null) params.delete(k);
      else params.set(k, v);
    }
    return `/admin/conferences?${params.toString()}`;
  };

  return (
    <div>
      <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 700, color: "var(--bm-text-primary)" }}>
        학술대회 관리
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--bm-text-secondary)" }}>
        총 {count ?? 0}건 {showDeleted && "(숨김 포함)"}
      </p>

      {/* 필터 바 */}
      <form method="get" action="/admin/conferences" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {showDeleted && <input type="hidden" name="deleted" value="1" />}
        <input
          name="q"
          defaultValue={q}
          placeholder="이름 검색…"
          style={{
            flex: 1,
            minWidth: 200,
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
        <Link
          href={buildUrl({ deleted: showDeleted ? undefined : "1" })}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: `1px solid ${showDeleted ? "var(--bm-primary)" : "var(--bm-border)"}`,
            background: showDeleted ? "var(--bm-primary-subtle)" : "var(--bm-surface)",
            fontSize: 13,
            color: showDeleted ? "var(--bm-primary)" : "var(--bm-text-secondary)",
            textDecoration: "none",
            fontWeight: showDeleted ? 600 : 400,
          }}
        >
          {showDeleted ? "✓ 숨김 보기" : "숨김 보기"}
        </Link>
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
              {["ID", "행사명", "학회", "분야", "시작일", "상태", "액션"].map((h) => (
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
            {(data ?? []).map((c) => (
              <tr
                key={c.id}
                style={{
                  borderBottom: "1px solid var(--bm-border)",
                  opacity: c.is_deleted ? 0.5 : 1,
                }}
              >
                <td style={{ padding: "10px 14px", color: "var(--bm-text-tertiary)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {c.id}
                </td>
                <td style={{ padding: "10px 14px", maxWidth: 280 }}>
                  <Link
                    href={`/conferences/${c.id}`}
                    target="_blank"
                    style={{
                      color: "var(--bm-text-primary)",
                      fontWeight: 500,
                      textDecoration: "none",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {c.event_name}
                  </Link>
                </td>
                <td style={{ padding: "10px 14px", color: "var(--bm-text-secondary)", whiteSpace: "nowrap", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.society_name}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  {c.category && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: "var(--bm-primary-subtle)",
                        color: "var(--bm-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.category}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: 12, whiteSpace: "nowrap", color: "var(--bm-text-secondary)" }}>
                  {c.start_date}
                </td>
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  {c.is_featured && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: "var(--bm-accent-subtle)",
                        color: "var(--bm-accent)",
                        fontWeight: 600,
                      }}
                    >
                      Featured
                    </span>
                  )}
                  {c.is_deleted && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: "var(--bm-bg-muted)",
                        color: "var(--bm-text-tertiary)",
                        fontWeight: 600,
                      }}
                    >
                      숨김
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <ConferenceRowActions
                    id={c.id}
                    isFeatured={c.is_featured}
                    isDeleted={c.is_deleted}
                  />
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={7}
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
