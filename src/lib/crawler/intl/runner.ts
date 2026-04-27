/**
 * 국제 학술대회 크롤러 실행기.
 *
 * 사용:
 *   await runIntlCrawler(adapter)              // 단일 어댑터
 *   await runAllIntlCrawlers()                  // 모든 어댑터
 *   await runIntlCrawler(adapter, { dryRun })   // DB 쓰기 없이 fetch+parse만
 *
 * 호출 위치:
 *   - /api/cron/intl (Cloudflare Cron Trigger 또는 수동 호출)
 *   - admin/scripts에서 수동 실행
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { ADAPTERS } from "./registry";
import type { IntlAdapter, IntlEvent, CrawlResult } from "./types";

export type RunOptions = {
  /** true면 DB에 쓰지 않고 결과만 리턴 (검증용) */
  dryRun?: boolean;
};

export async function runIntlCrawler(
  adapter: IntlAdapter,
  opts: RunOptions = {},
): Promise<CrawlResult> {
  const result: CrawlResult = {
    source: adapter.key,
    fetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  let events: IntlEvent[];
  try {
    events = await adapter.fetchEvents();
    result.fetched = events.length;
  } catch (e) {
    result.errors.push(`fetchEvents failed: ${(e as Error).message}`);
    return result;
  }

  if (opts.dryRun) {
    return result;
  }

  const sb = createAdminClient();

  for (const ev of events) {
    try {
      // (source_type, source_id) UNIQUE 인덱스 활용 — 중복이면 update
      const { data: existing } = await sb
        .from("conferences")
        .select("id")
        .eq("source_type", adapter.key)
        .eq("source_id", ev.sourceId)
        .maybeSingle();

      const row = {
        event_name: ev.title,
        society_name: ev.societyName,
        society_url: ev.societyUrl ?? null,
        start_date: ev.startDate,
        end_date: ev.endDate ?? null,
        venue: ev.venue ?? null,
        city: ev.city ?? null,
        country_code: ev.countryCode ?? "XX",
        country_name: ev.countryName ?? null,
        category: ev.primarySpecialty ?? adapter.defaultSpecialty,
        description: ev.description ?? null,
        registration_url: ev.registrationUrl ?? null,
        detail_url: ev.detailUrl ?? null,
        registration_deadline: ev.registrationDeadline ?? null,
        abstract_deadline: ev.abstractDeadline ?? null,
        early_bird_deadline: ev.earlyBirdDeadline ?? null,
        lat: ev.lat ?? null,
        lng: ev.lng ?? null,
        acronym: ev.acronym ?? null,
        mode: ev.mode ?? "offline",
        conference_type: "international",
        source_type: adapter.key,
        source_id: ev.sourceId,
      };

      if (existing) {
        const { error } = await sb
          .from("conferences")
          .update(row)
          .eq("id", existing.id);
        if (error) throw error;
        result.updated += 1;
      } else {
        const { error } = await sb.from("conferences").insert(row);
        if (error) throw error;
        result.inserted += 1;
      }
    } catch (e) {
      result.errors.push(
        `event "${ev.title}" failed: ${(e as Error).message}`,
      );
      result.skipped += 1;
    }
  }

  return result;
}

export async function runAllIntlCrawlers(
  opts: RunOptions = {},
): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  for (const adapter of ADAPTERS) {
    // 어댑터 간 2초 간격 — 학회 서버 부담 분산
    if (results.length > 0) {
      await new Promise((r) => setTimeout(r, 2000));
    }
    results.push(await runIntlCrawler(adapter, opts));
  }
  return results;
}
