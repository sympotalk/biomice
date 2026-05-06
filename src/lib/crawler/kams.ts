import axios from "axios";
import * as cheerio from "cheerio";
import type { ConferenceInsert } from "../database.types";

const BASE = "https://www.kams.or.kr";
const LIST_URL = (year: number, page: number) =>
  `${BASE}/bbs/index.php?code=ws&start_y=${year}&start_m=ALL&page=${page}`;
const DETAIL_URL = (id: string) =>
  `${BASE}/bbs/index.php?code=ws&number=${id}&mode=view`;

const UA =
  "Mozilla/5.0 (compatible; biomice-crawler/0.1; +https://biomice.kr)";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type KamsRow = {
  kamsId: string;
  societyName: string;
  societyUrl?: string;
  eventName: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  venue?: string;
  detailUrl: string;
};

export type LectureItem = {
  time: string;
  title: string;
  lecturer: string;
  affiliation: string;
};

export type KamsDetail = {
  registrationUrl?: string;
  description?: string;
  eventCode?: string;
  kmaCategory?: string;
  lectures?: LectureItem[];
};

/** Convert "서울 COEX" → city "서울", venue "COEX". Best-effort only. */
export function extractCity(venue: string | undefined | null): {
  city?: string;
  venue?: string;
} {
  if (!venue) return {};
  const trimmed = venue.trim();
  const CITIES = [
    "서울",
    "부산",
    "대구",
    "인천",
    "광주",
    "대전",
    "울산",
    "세종",
    "수원",
    "고양",
    "성남",
    "용인",
    "제주",
    "강릉",
    "경주",
    "여수",
    "창원",
    "전주",
    "청주",
  ];
  for (const c of CITIES) {
    if (trimmed.startsWith(c)) {
      const rest = trimmed.slice(c.length).trim();
      return { city: c, venue: rest || trimmed };
    }
  }
  return { venue: trimmed };
}

/** Extract `number=` param from a KAMS detail link. */
function extractKamsId(href: string): string | null {
  const m = href.match(/number=(\d+)/);
  return m ? m[1] : null;
}

/** Parse a date range like "2026.04.24 ~ 2026.04.26" or "2026.04.24". */
function parseDateRange(raw: string): { start: string; end?: string } | null {
  const text = raw.replace(/\s+/g, " ").trim();
  const re = /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/g;
  const matches = [...text.matchAll(re)];
  if (matches.length === 0) return null;
  const toIso = (m: RegExpMatchArray) =>
    `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  return {
    start: toIso(matches[0]),
    end: matches[1] ? toIso(matches[1]) : undefined,
  };
}

/**
 * Parse KMA 교육코드 from detail page HTML.
 * Patterns: "교육코드 : KMA2026_0309_169525" or data-code attribute.
 */
function parseEventCode(html: string): string | null {
  const match = html.match(/교육코드\s*[：:]\s*([A-Z0-9_]+)/);
  if (match?.[1]) return match[1];
  const dataMatch = html.match(/data-code=["']([A-Z0-9_]+)["']/);
  return dataMatch?.[1] ?? null;
}

/**
 * Parse KMA 인정과목 (specialty categories).
 * Pattern: "인정과목 : 내과, 외과, 소아청소년과..."
 */
function parseKmaCategory(html: string): string | null {
  const match = html.match(/인정과목\s*[：:]\s*([^<\n\r]+)/);
  return match?.[1]?.trim() ?? null;
}

/**
 * Parse program/lecture table from detail page.
 * Table rows: 시간 | 강의제목 | 강연자 | 소속
 */
function parseLectures(html: string): LectureItem[] {
  const $ = cheerio.load(html);
  const lectures: LectureItem[] = [];

  // Try common selectors for program tables
  const tableSelectors = [
    ".program_table tr",
    ".schedule_table tr",
    ".board_view table tr",
    ".view_content table tr",
    "#view_content table tr",
    "table tr",
  ];

  for (const sel of tableSelectors) {
    const rows = $(sel);
    if (rows.length < 2) continue;

    let found = false;
    rows.each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 3) return;

      const time = $(tds[0]).text().trim();
      const title = $(tds[1]).text().trim();
      const lecturer = $(tds[2]).text().trim();
      const affiliation = tds.length >= 4 ? $(tds[3]).text().trim() : "";

      // Skip header-like rows or empty rows
      if (!title || title.length < 2) return;
      if (/시간|강의|제목|강연자|연자|좌장/i.test(title) && !lecturer) return;

      lectures.push({ time, title, lecturer, affiliation });
      found = true;
    });

    if (found) break;
  }

  return lectures;
}

export async function fetchListPage(
  year: number,
  page: number,
): Promise<KamsRow[]> {
  const res = await axios.get<string>(LIST_URL(year, page), {
    headers: { "User-Agent": UA },
    timeout: 15_000,
    responseType: "text",
  });
  const $ = cheerio.load(res.data);

  const rows: KamsRow[] = [];
  $("table tbody tr").each((_, tr) => {
    const $tr = $(tr);
    const tds = $tr.find("td");
    if (tds.length < 5) return;

    const societyAnchor = $(tds[1]).find("a");
    const eventAnchor = $(tds[2]).find("a");

    const societyName = societyAnchor.text().trim() || $(tds[1]).text().trim();
    const eventName = eventAnchor.text().trim() || $(tds[2]).text().trim();
    const dateText = $(tds[3]).text().trim();
    const venueText = $(tds[4]).text().trim();

    const societyHref = societyAnchor.attr("href") ?? "";
    const eventHref = eventAnchor.attr("href") ?? "";
    const kamsId = extractKamsId(eventHref) ?? extractKamsId(societyHref);
    if (!kamsId || !eventName || !societyName) return;

    const range = parseDateRange(dateText);
    if (!range) return;

    const societyUrl =
      societyHref && !societyHref.startsWith("/")
        ? societyHref
        : societyHref
        ? `${BASE}${societyHref}`
        : undefined;

    rows.push({
      kamsId,
      societyName,
      societyUrl,
      eventName,
      startDate: range.start,
      endDate: range.end,
      venue: venueText || undefined,
      detailUrl: DETAIL_URL(kamsId),
    });
  });

  return rows;
}

/** Fetch extra detail (registration URL, description, event code, categories, lectures) for a single row. */
export async function fetchDetail(kamsId: string): Promise<KamsDetail> {
  try {
    const res = await axios.get<string>(DETAIL_URL(kamsId), {
      headers: { "User-Agent": UA },
      timeout: 15_000,
      responseType: "text",
    });
    const $ = cheerio.load(res.data);
    const html = res.data;

    // Registration links — pick the first external http(s) link inside the body
    // that looks like it's not back to KAMS.
    let registrationUrl: string | undefined;
    $("a[href^='http']").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      if (href.includes("kams.or.kr")) return;
      const text = $(el).text().trim();
      if (/등록|register|reg|신청/i.test(text) && !registrationUrl) {
        registrationUrl = href;
      }
    });

    // Fallback: search description text for a likely registration URL.
    const bodyText = $("body").text();
    if (!registrationUrl) {
      const urlMatch = bodyText.match(
        /https?:\/\/[^\s"']+(?:reg|register|신청)[^\s"']*/i,
      );
      if (urlMatch) registrationUrl = urlMatch[0];
    }

    // Description: grab the main content area (best-effort).
    const description =
      $(".board_view .content, .view_content, #view_content")
        .first()
        .text()
        .trim()
        .slice(0, 2000) || undefined;

    const eventCode = parseEventCode(html) ?? undefined;
    const kmaCategory = parseKmaCategory(html) ?? undefined;
    const lectures = parseLectures(html);

    return {
      registrationUrl,
      description,
      eventCode,
      kmaCategory,
      lectures: lectures.length > 0 ? lectures : undefined,
    };
  } catch {
    return {};
  }
}

export type CrawlOptions = {
  year?: number;
  maxPages?: number;
  fetchDetailPages?: boolean;
  delayMs?: number;
};

/** Top-level orchestration — returns rows ready for Supabase upsert. */
export async function crawlKams(
  opts: CrawlOptions = {},
): Promise<ConferenceInsert[]> {
  const year = opts.year ?? new Date().getFullYear();
  const maxPages = opts.maxPages ?? 5;
  const delay = opts.delayMs ?? 1500;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const rows = await fetchListPage(year, page);
    if (rows.length === 0) break;

    for (const row of rows) {
      const { city, venue } = extractCity(row.venue);
      let detail: KamsDetail = {};
      if (opts.fetchDetailPages) {
        detail = await fetchDetail(row.kamsId);
        await sleep(delay);
      }

      const departments =
        detail.kmaCategory
          ? detail.kmaCategory
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : null;

      out.push({
        kams_id: row.kamsId,
        society_name: row.societyName,
        society_url: row.societyUrl ?? null,
        event_name: row.eventName,
        start_date: row.startDate,
        end_date: row.endDate ?? null,
        venue: venue ?? null,
        city: city ?? null,
        detail_url: row.detailUrl,
        registration_url: detail.registrationUrl ?? null,
        description: detail.description ?? null,
        event_code: detail.eventCode ?? null,
        kma_category: detail.kmaCategory ?? null,
        departments: departments,
        lectures: detail.lectures ? JSON.stringify(detail.lectures) : null,
        is_deleted: false,
      });
    }
    await sleep(delay);
  }

  return out;
}
