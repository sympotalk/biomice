/**
 * biomice 크롤러 + 알림 전용 Cron Worker
 *
 * cron 스케줄:
 *   - KST 03:00 (UTC 18:00) → KAMS 크롤링 /api/cron
 *   - KST 09:00 (UTC 00:00) → 이메일 알림  /api/cron/notify
 *
 * 별도 wrangler 설정으로 배포:
 *   wrangler deploy --config workers/wrangler.cron.jsonc
 */

export interface Env {
  BIOMICE_ORIGIN: string; // e.g. "https://biomice.kr"
  CRAWLER_TOKEN: string;
}

async function callApi(
  origin: string,
  path: string,
  token: string,
  ctx: ExecutionContext,
) {
  const url = `${origin}${path}?token=${encodeURIComponent(token)}`;
  ctx.waitUntil(
    fetch(url, { method: "GET" })
      .then(async (res) => {
        const body = await res.text();
        console.log(`[cron] ${path} → ${res.status} ${body.slice(0, 200)}`);
      })
      .catch((err) => console.error(`[cron] ${path} error`, err)),
  );
}

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    // scheduledTime is a Unix timestamp in ms
    const hour = new Date(event.scheduledTime).getUTCHours();

    if (hour === 18) {
      // KST 03:00 — crawler
      await callApi(env.BIOMICE_ORIGIN, "/api/cron", env.CRAWLER_TOKEN, ctx);
    } else if (hour === 0) {
      // KST 09:00 — email notifications
      await callApi(env.BIOMICE_ORIGIN, "/api/cron/notify", env.CRAWLER_TOKEN, ctx);
    } else {
      // fallback: both
      await callApi(env.BIOMICE_ORIGIN, "/api/cron", env.CRAWLER_TOKEN, ctx);
      await callApi(env.BIOMICE_ORIGIN, "/api/cron/notify", env.CRAWLER_TOKEN, ctx);
    }
  },
} satisfies ExportedHandler<Env>;
