import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { BannerActions } from "./BannerActions";
import { BannerCreateForm } from "./BannerCreateForm";

export const dynamic = "force-dynamic";

const SLOT_LABELS: Record<string, string> = {
  list_sidebar: "목록 사이드바",
  detail_top: "상세 상단",
  home_hero: "홈 히어로",
};

export default async function AdminBannersPage() {
  await requireAdmin();
  const sb = await createClient();

  const { data: banners } = await sb
    .from("banners")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1
        style={{
          margin: "0 0 8px",
          fontSize: 24,
          fontWeight: 700,
          color: "var(--bm-text-primary)",
        }}
      >
        배너 관리
      </h1>
      <p style={{ margin: "0 0 32px", fontSize: 13, color: "var(--bm-text-secondary)" }}>
        총 {banners?.length ?? 0}개
      </p>

      {/* 배너 목록 */}
      <div
        style={{
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 40,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--bm-border)", background: "var(--bm-bg-muted)" }}>
              {["ID", "슬롯", "제목", "광고주", "우선순위", "상태", "액션"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--bm-text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(banners ?? []).map((b) => (
              <tr key={b.id} style={{ borderBottom: "1px solid var(--bm-border)" }}>
                <td style={{ padding: "12px 16px", color: "var(--bm-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                  {b.id}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "var(--bm-primary-subtle)",
                      color: "var(--bm-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {SLOT_LABELS[b.slot_name] ?? b.slot_name}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "var(--bm-text-primary)", maxWidth: 200 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.title ?? "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--bm-text-tertiary)", marginTop: 2 }}>
                    <a
                      href={b.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--bm-primary)" }}
                    >
                      {b.link_url.length > 40 ? b.link_url.slice(0, 40) + "…" : b.link_url}
                    </a>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: "var(--bm-text-secondary)" }}>
                  {b.advertiser_name ?? "—"}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--bm-text-secondary)",
                  }}
                >
                  {b.priority}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: b.is_active ? "var(--bm-success-subtle, #e6f9ed)" : "var(--bm-bg-muted)",
                      color: b.is_active ? "var(--bm-success, #1a8a3a)" : "var(--bm-text-tertiary)",
                      fontWeight: 600,
                    }}
                  >
                    {b.is_active ? "활성" : "비활성"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <BannerActions id={b.id} isActive={b.is_active} />
                </td>
              </tr>
            ))}
            {(banners ?? []).length === 0 && (
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
                  등록된 배너가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 배너 생성 폼 */}
      <div
        style={{
          background: "var(--bm-surface)",
          border: "1px solid var(--bm-border)",
          borderRadius: 10,
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--bm-text-primary)",
            marginBottom: 20,
          }}
        >
          새 배너 등록
        </div>
        <BannerCreateForm />
      </div>
    </div>
  );
}
