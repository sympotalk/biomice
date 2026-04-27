/**
 * 대한의학회(KAMS) 국내개최 국제학술대회 인정 리스트 어댑터.
 *
 * KAMS는 분기별로 "국내개최 국제학술대회 인정 학회 명단"을 공지사항으로 발표.
 * 각 게시물은 보통 PDF 첨부 또는 본문에 표 형태로 학회 + 행사명 매핑.
 *
 * 이 어댑터:
 *   1. 공지사항 게시판에서 "국제학술대회 인정" 제목 키워드 매치
 *   2. 게시물 상세 페이지의 표/리스트에서 (학회명, 행사명, 일자, 장소) 추출
 *   3. is_kams_certified=true + related_korean_society=주관학회명으로 마킹
 *
 * 출처: https://www.kams.or.kr/business/sub01.php?page=1&keykind=4&keyword=
 *       (검색 keykind=4 → 게시물 제목 검색)
 *
 * NOTE: KAMS 게시판 구조는 종종 변경됨. selector가 막히면 dry-run으로 검증 후
 *       이 파일의 selectors / FALLBACK_LIST 수정.
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";
import {
  parseDateRange,
  parseLocation,
  safeFetch,
  slugify,
} from "../helpers";

const SOURCE_LIST_URL =
  "https://www.kams.or.kr/business/sub01.php?keykind=4&keyword=" +
  encodeURIComponent("국제학술대회 인정");
const SOURCE_BASE = "https://www.kams.or.kr";

/**
 * 게시판이 막힌 경우 fallback — 사용자가 admin에서 직접 입력하거나
 * 이 배열을 수동 갱신해 사용. 일단 비어둠 (실 운영에서 채워짐).
 */
const FALLBACK_LIST: IntlEvent[] = [];

/**
 * KAMS 게시판 리스트 fetch + 인정 게시물 제목/링크 추출.
 */
async function fetchNoticeIndex(): Promise<
  { title: string; href: string; noticeNo: string }[]
> {
  let html: string;
  try {
    html = await safeFetch(SOURCE_LIST_URL);
  } catch {
    return [];
  }
  const $ = cheerio.load(html);
  const notices: { title: string; href: string; noticeNo: string }[] = [];

  $("table.board_list tr, table tr, .board-row").each((_idx, el) => {
    const $el = $(el);
    const link = $el.find("a").first();
    const title = link.text().trim();
    if (!title) return;
    if (!/국제학술대회.*인정/.test(title)) return;

    const href = link.attr("href");
    if (!href) return;
    const fullHref = href.startsWith("http") ? href : `${SOURCE_BASE}${href}`;
    const noticeNo = $el.find("td").first().text().trim() || "";

    notices.push({ title, href: fullHref, noticeNo });
  });

  return notices;
}

/**
 * 게시물 상세 페이지 → 표/리스트 파싱 → IntlEvent[] 반환.
 */
async function parseNoticeDetail(
  href: string,
  noticeTitle: string,
  noticeNo: string,
): Promise<IntlEvent[]> {
  let html: string;
  try {
    html = await safeFetch(href);
  } catch {
    return [];
  }
  const $ = cheerio.load(html);
  const events: IntlEvent[] = [];

  // 게시물 본문의 표 — 보통 학회명 / 행사명 / 일자 / 장소 columns
  $("table.board_view tbody tr, .board-content table tr").each((idx, el) => {
    if (idx === 0) return; // header 행 skip
    const cells = $(el)
      .find("td")
      .toArray()
      .map((c) => $(c).text().trim());
    if (cells.length < 3) return;

    const society = cells[0];
    const eventName = cells[1];
    const dateText = cells[2] ?? "";
    const venueText = cells[3] ?? "";

    if (!society || !eventName) return;

    const dates = parseDateRange(dateText);
    if (!dates) return;

    const loc = parseLocation(venueText);
    const year = dates.startDate.slice(0, 4);

    events.push({
      sourceId: slugify(`kams-${eventName}-${society}`, year),
      title: eventName,
      societyName: society, // 영문이면 그대로, 한글이면 society_name으로 사용
      societyUrl: undefined,
      startDate: dates.startDate,
      endDate: dates.endDate,
      city: loc.city || venueText,
      countryCode: loc.countryCode || "KR", // KAMS 인정은 보통 국내 개최
      countryName: loc.country || "대한민국",
      detailUrl: href,
      mode: "offline",
      primarySpecialty: "내과", // 기본값. classify에서 학회명 기반 보정
      topics: ["KAMS-certified"],
      // KAMS 인증 마커 — runner.ts에서 row 매핑 시 처리
      description: `KAMS 국내개최 국제학술대회 인정. 출처: ${noticeTitle}`,
    });
  });

  // 메타데이터에 KAMS notice 정보 첨부 (runner가 row 매핑 시 사용)
  events.forEach((ev) => {
    (ev as IntlEvent & { _kamsNoticeUrl?: string; _kamsNoticeNo?: string })._kamsNoticeUrl = href;
    (ev as IntlEvent & { _kamsNoticeUrl?: string; _kamsNoticeNo?: string })._kamsNoticeNo = noticeNo;
  });

  return events;
}

export const kamsCertifiedAdapter: IntlAdapter = {
  key: "kams-certified",
  label: "KAMS 국내개최 국제학술대회 인정 리스트",
  defaultSpecialty: "의학",
  priority: "P0",
  async fetchEvents(): Promise<IntlEvent[]> {
    try {
      const notices = await fetchNoticeIndex();

      // 최신 5건만 처리 (오래된 인정 명단은 이미 종료된 행사가 대부분)
      const recent = notices.slice(0, 5);

      const allEvents: IntlEvent[] = [];
      for (const n of recent) {
        try {
          const events = await parseNoticeDetail(n.href, n.title, n.noticeNo);
          allEvents.push(...events);
          // KAMS 서버 부담 분산 — 1.5s 대기
          await new Promise((r) => setTimeout(r, 1500));
        } catch {
          // 단일 게시물 파싱 실패는 다른 게시물 진행 막지 않음
          continue;
        }
      }

      // 모든 KAMS 인정 행사는 플래그 표시
      allEvents.forEach((ev) => {
        (ev as IntlEvent & { _isKamsCertified?: boolean })._isKamsCertified = true;
      });

      return allEvents.length > 0 ? allEvents : FALLBACK_LIST;
    } catch {
      return FALLBACK_LIST;
    }
  },
};
