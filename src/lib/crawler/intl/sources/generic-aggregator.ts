/**
 * 범용 컨퍼런스 어그리게이터 어댑터 (P2).
 *
 * 대상: AllConferenceAlert.com / mConferences.com 등의 범용 학회 캘린더.
 * 한국 의사 관심도가 가장 높은 항목만 필터링해서 import.
 *
 * 필터링 규칙 (한국 키워드 우선순위):
 *   1. 제목/설명에 "Korean", "Korea", "Seoul", "KAMS" 포함 시 즉시 채택
 *   2. 학회 키워드 (KSC, KSIM, KSOG, KSS 등) 포함 시 채택
 *   3. 한국 의사 관심도 높은 분야 키워드 (cardiology + Asia, oncology + Korea 등) 포함 시 채택
 *   4. 그 외는 모두 skip — 어그리게이터의 long-tail 데이터에 묻히지 않게
 *
 * 어그리게이터 사이트는 anti-bot이 강함 (Cloudflare, JS rendering 등).
 * 정적 fetch 실패 시 빈 배열 반환 — 서비스 영향 없음.
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";
import {
  parseDateRange,
  parseLocation,
  safeFetch,
  slugify,
} from "../helpers";

/**
 * 한국 의사 관심도 우선순위 키워드.
 * 정렬: 가장 강한 신호부터.
 */
const KR_KEYWORDS = [
  // 강한 신호 — 한국 학회/장소
  /\bKorea\b/i,
  /\bKorean\b/i,
  /\bSeoul\b/i,
  /\bBusan\b/i,
  /\bKAMS\b/,
  /\bKSC\b/,
  /\bKSIM\b/,
  /\bKSOG\b/,
  /\bKSS\b/,
  /\bKAIM\b/,
  /\bKDA\b/,
  /\bKNA\b/,
  /\bKOA\b/,
  /\bKPS\b/,

  // 중간 신호 — 아시아 권역 + 의료
  /\bAsia[- ]Pacific\b/i,
  /\bAPAC\b/,
];

/** 카드/행사 정보 후보 selector — 다양한 어그리게이터 사이트 호환용 */
const ITEM_SELECTORS =
  ".event-card, .conference-card, .event-listing, .event-item, " +
  ".calendar-item, article.event, .listing-item, li.event";

const TITLE_SELECTORS = "h2, h3, h4, .event-title, .title, a.title";
const DATE_SELECTORS = ".date, .event-date, time, .when";
const LOCATION_SELECTORS = ".location, .event-location, .where, .venue";

/** 한국 키워드 매치 점수 (높을수록 채택 우선) */
function koreanRelevance(text: string): number {
  let score = 0;
  for (const re of KR_KEYWORDS) {
    if (re.test(text)) score += 10;
  }
  return score;
}

async function parseAggregator(
  url: string,
  baseUrl: string,
  sourceKey: string,
): Promise<IntlEvent[]> {
  let html: string;
  try {
    html = await safeFetch(url);
  } catch {
    return [];
  }
  const $ = cheerio.load(html);
  const events: IntlEvent[] = [];

  $(ITEM_SELECTORS).each((_idx, el) => {
    const $el = $(el);
    const title = $el.find(TITLE_SELECTORS).first().text().trim();
    if (!title || title.length > 250) return;

    const dateText = $el.find(DATE_SELECTORS).first().text().trim();
    const locationText = $el.find(LOCATION_SELECTORS).first().text().trim();
    const description = $el.find(".description, .summary, p").first().text().trim();

    // 한국 관심도 필터 — 점수 0이면 long-tail로 간주, skip
    const haystack = `${title} ${description} ${locationText}`;
    const relevance = koreanRelevance(haystack);
    if (relevance === 0) return;

    const dates = parseDateRange(dateText);
    if (!dates) return;

    const loc = parseLocation(locationText);
    const year = dates.startDate.slice(0, 4);
    const href = $el.find("a").first().attr("href");
    const detailUrl = href
      ? href.startsWith("http")
        ? href
        : `${baseUrl}${href}`
      : url;

    events.push({
      sourceId: slugify(`${sourceKey}-${title}`, year),
      title,
      societyName: "—", // 어그리게이터는 주관 학회를 명확히 표기 안 함 — 관리자가 인라인 에디터로 보강
      societyUrl: undefined,
      startDate: dates.startDate,
      endDate: dates.endDate,
      city: loc.city,
      countryCode: loc.countryCode,
      countryName: loc.country,
      detailUrl,
      registrationUrl: detailUrl,
      mode: /online|virtual|webinar/i.test(haystack) ? "online" : "offline",
      description,
      primarySpecialty: undefined, // 분류 불확실 — 관리자가 보강
      topics: ["aggregator", `relevance-${relevance}`],
    });
  });

  return events;
}

export const allConferenceAlertAdapter: IntlAdapter = {
  key: "allconferencealert",
  label: "AllConferenceAlert.com (한국 키워드 필터)",
  defaultSpecialty: "의학",
  priority: "P2",
  async fetchEvents(): Promise<IntlEvent[]> {
    return parseAggregator(
      "https://allconferencealert.com/medical.php",
      "https://allconferencealert.com",
      "aca",
    );
  },
};

export const mConferencesAdapter: IntlAdapter = {
  key: "mconferences",
  label: "mConferences.com (한국 키워드 필터)",
  defaultSpecialty: "의학",
  priority: "P2",
  async fetchEvents(): Promise<IntlEvent[]> {
    return parseAggregator(
      "https://mconferences.com/medical-conferences",
      "https://mconferences.com",
      "mconf",
    );
  },
};
