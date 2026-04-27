/**
 * 국제 학술대회 크롤러 — 수동/Cron 호출용 엔드포인트.
 *
 * 보안: CRAWLER_TOKEN 헤더 또는 ?token= 쿼리로 인증.
 *
 * 사용법:
 *   POST /api/cron/intl?token=xxx                  → 모든 어댑터 실행
 *   POST /api/cron/intl?token=xxx&source=esmo      → ESMO만 실행
 *   POST /api/cron/intl?token=xxx&dryRun=1         → DB 쓰기 없이 검증만
 *
 * Cloudflare Cron Trigger:
 *   wrangler.jsonc에 cron 추가하면 주기적 자동 호출 가능.
 *   현재는 수동 호출만 — admin이 트리거.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdapter } from "@/lib/crawler/intl/registry";
import {
  runAllIntlCrawlers,
  runIntlCrawler,
} from "@/lib/crawler/intl/runner";

export const runtime = "nodejs";
export const maxDuration = 300; // 5분

type AuthStatus = "ok" | "no-env" | "no-token" | "mismatch";

function authStatus(req: NextRequest): AuthStatus {
  const expected = process.env.CRAWLER_TOKEN?.trim();
  if (!expected) return "no-env";

  const headerToken = req.headers
    .get("authorization")
    ?.replace(/^Bearer /i, "")
    .trim();
  const queryToken = new URL(req.url).searchParams.get("token")?.trim();
  const provided = headerToken || queryToken;
  if (!provided) return "no-token";

  return provided === expected ? "ok" : "mismatch";
}

async function handle(req: NextRequest) {
  const status = authStatus(req);
  if (status !== "ok") {
    const reason =
      status === "no-env"
        ? "CRAWLER_TOKEN 시크릿이 Cloudflare Worker에 설정되지 않았습니다. `npx wrangler secret put CRAWLER_TOKEN` 으로 등록 후 30초~1분 대기."
        : status === "no-token"
        ? "토큰이 제공되지 않았습니다. ?token= 쿼리 또는 Authorization: Bearer 헤더를 사용하세요."
        : "토큰이 일치하지 않습니다. Cloudflare에 등록된 CRAWLER_TOKEN과 입력값이 정확히 같은지 확인하세요 (앞뒤 공백/줄바꿈 주의).";
    return NextResponse.json(
      { error: "unauthorized", code: status, reason },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const sourceKey = url.searchParams.get("source");
  const dryRun = url.searchParams.get("dryRun") === "1";

  try {
    if (sourceKey) {
      const adapter = getAdapter(sourceKey);
      if (!adapter) {
        return NextResponse.json(
          { error: `unknown source: ${sourceKey}` },
          { status: 404 },
        );
      }
      const result = await runIntlCrawler(adapter, { dryRun });
      return NextResponse.json({ ok: true, dryRun, result });
    }

    const results = await runAllIntlCrawlers({ dryRun });
    return NextResponse.json({ ok: true, dryRun, results });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
