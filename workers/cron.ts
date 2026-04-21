/**
 * biomice 크롤러 전용 Cron Worker
 *
 * 매일 KST 03:00(UTC 18:00)에 메인 biomice 워커의 /api/cron 을 호출합니다.
 *
 * 별도 wrangler 설정으로 배포:
 *   wrangler deploy --config workers/wrangler.cron.jsonc
 */

export interface Env {
  BIOMICE_ORIGIN: string; // e.g. "https://biomice.kr"
  CRAWLER_TOKEN: string;
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const url = `${env.BIOMICE_ORIGIN}/api/cron?token=${encodeURIComponent(env.CRAWLER_TOKEN)}`;
    ctx.waitUntil(
      fetch(url, { method: "GET" })
        .then(async (res) => {
          const body = await res.text();
          console.log(`[cron] ${res.status} ${body.slice(0, 200)}`);
        })
        .catch((err) => console.error("[cron] error", err)),
    );
  },
} satisfies ExportedHandler<Env>;
