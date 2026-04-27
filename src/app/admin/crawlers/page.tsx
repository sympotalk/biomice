import { listAdapters } from "@/lib/crawler/intl/registry";
import { CrawlerActions } from "./CrawlerActions";
import { ConferenceManualEditor } from "./ConferenceManualEditor";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "크롤러 관리 · BioMICE Admin" };

export default async function AdminCrawlersPage() {
  const adapters = listAdapters();

  // 최근 등록된 국제 학술대회 30건 — 인라인 에디터에서 수정 가능
  const sb = createAdminClient();
  const { data: recentIntl } = await sb
    .from("conferences")
    .select(
      "id, event_name, society_name, start_date, country_code, source_type, conference_type, is_kams_certified, related_korean_society, cme_credits_kr, cme_credits",
    )
    .eq("conference_type", "international")
    .order("start_date", { ascending: true })
    .limit(30);

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1
        style={{
          margin: "0 0 8px",
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: -0.4,
        }}
      >
        크롤러 관리
      </h1>
      <p
        style={{
          margin: "0 0 24px",
          fontSize: 13,
          color: "var(--bm-text-secondary)",
          lineHeight: 1.6,
        }}
      >
        등록된 국제 학술대회 어댑터 목록입니다. 각 어댑터는 학회 사이트에서
        학술대회 일정을 fetch → parse → DB upsert합니다. 운영 환경에서는
        Cloudflare Cron Trigger가 주 1회/월 1회 자동 실행하지만, 여기서 수동
        실행하거나 dry-run으로 검증할 수 있습니다.
      </p>

      <CrawlerActions adapters={adapters} />

      {/* 인라인 에디터: 국내 평점 / 연관 학회 / KAMS 인정 매뉴얼 보강 */}
      <section style={{ marginTop: 32 }}>
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          국제 학술대회 매뉴얼 보강
        </h2>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 12,
            color: "var(--bm-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          크롤러가 자동 수집한 국제 학술대회에 국내 연수평점 (cme_credits_kr) /
          연관 국내 학회명 (related_korean_society) / KAMS 인정 여부를 직접
          수정할 수 있습니다. 사용자에게 표시되는 모든 카드/상세 페이지에
          즉시 반영됩니다.
        </p>
        <ConferenceManualEditor rows={recentIntl ?? []} />
      </section>
    </div>
  );
}
