import { listAdapters } from "@/lib/crawler/intl/registry";
import { CrawlerActions } from "./CrawlerActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "크롤러 관리 · BioMICE Admin" };

export default async function AdminCrawlersPage() {
  const adapters = listAdapters();

  return (
    <div style={{ maxWidth: 980 }}>
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
    </div>
  );
}
