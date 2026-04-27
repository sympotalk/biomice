/**
 * ESMO (European Society for Medical Oncology) 어댑터.
 * 출처: https://www.esmo.org/meeting-calendar
 *
 * ESMO는 meeting-calendar 페이지에 1년치 일정을 정적 HTML로 노출.
 * cheerio로 안정적으로 파싱 가능.
 *
 * NOTE: 이 어댑터는 실제 운영 전 selector가 변경될 수 있음.
 *       /api/cron/intl?source=esmo&dryRun=1 로 dry-run 검증 권장.
 */

import * as cheerio from "cheerio";
import type { IntlAdapter, IntlEvent } from "../types";

const SOURCE_URL = "https://www.esmo.org/meeting-calendar";
const SOURCE_KEY = "esmo";

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; BioMiceCrawler/1.0; +https://biomice.xyz)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    // Cloudflare Workers fetch — no Node-specific options.
  });
  if (!res.ok) {
    throw new Error(`ESMO fetch failed: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

/**
 * meeting-calendar 페이지에서 행사 카드 파싱.
 * ESMO 페이지 구조 (2026-04 기준):
 *   .meeting-card > h3 (제목) + .meeting-date + .meeting-location + a[href]
 *
 * 페이지 구조 변경 시 이 selector를 수정해야 함.
 */
function parseEvents(html: string): IntlEvent[] {
  const $ = cheerio.load(html);
  const events: IntlEvent[] = [];

  $(".meeting-card, article.meeting, .calendar-item").each((_idx, el) => {
    const $el = $(el);
    const title = $el.find("h2, h3").first().text().trim();
    if (!title) return;

    const dateText = $el.find(".meeting-date, .date, time").first().text().trim();
    const location = $el.find(".meeting-location, .location").first().text().trim();
    const href = $el.find("a").first().attr("href");
    const detailUrl = href
      ? href.startsWith("http")
        ? href
        : `https://www.esmo.org${href}`
      : undefined;

    const dates = parseDateRange(dateText);
    if (!dates) return; // 날짜 파싱 실패 시 skip

    const { city, country, countryCode } = parseLocation(location);

    // sourceId — slug 기반 고유키 (제목 + 시작년도)
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const year = dates.startDate.slice(0, 4);
    const sourceId = `${slug}-${year}`;

    events.push({
      sourceId,
      title,
      acronym: extractAcronym(title),
      societyName: "European Society for Medical Oncology",
      societyUrl: "https://www.esmo.org",
      startDate: dates.startDate,
      endDate: dates.endDate,
      city,
      countryCode,
      countryName: country,
      detailUrl,
      registrationUrl: detailUrl,
      mode: "hybrid", // ESMO 대부분 hybrid
      primarySpecialty: "내과", // ESMO = oncology, KR 분류상 종양내과 → 내과 그룹
      topics: ["oncology", "medical oncology"],
    });
  });

  return events;
}

function parseDateRange(text: string): { startDate: string; endDate?: string } | null {
  if (!text) return null;
  // "10–14 Oct 2026" / "Oct 10-14, 2026" / "10 Oct 2026" 형식 지원
  const monthMap: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const m = text.match(
    /(\d{1,2})\s*[–\-~]?\s*(\d{0,2})\s*([A-Za-z]{3})\.?\s*(\d{4})/,
  );
  if (!m) return null;
  const [, d1, d2, monAbbr, year] = m;
  const mm = monthMap[monAbbr.slice(0, 3).toLowerCase()];
  if (!mm) return null;
  const startDate = `${year}-${mm}-${d1.padStart(2, "0")}`;
  const endDate = d2 ? `${year}-${mm}-${d2.padStart(2, "0")}` : undefined;
  return { startDate, endDate };
}

function parseLocation(text: string): {
  city?: string;
  country?: string;
  countryCode?: string;
} {
  if (!text) return {};
  // "Barcelona, Spain" 형식
  const parts = text.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const country = parts[parts.length - 1];
    const city = parts.slice(0, -1).join(", ");
    return { city, country, countryCode: countryNameToCode(country) };
  }
  return { city: parts[0] };
}

function countryNameToCode(name: string): string | undefined {
  const map: Record<string, string> = {
    Spain: "ES",
    "United States": "US",
    USA: "US",
    Italy: "IT",
    Germany: "DE",
    France: "FR",
    "United Kingdom": "GB",
    UK: "GB",
    Switzerland: "CH",
    Austria: "AT",
    Netherlands: "NL",
    Japan: "JP",
    China: "CN",
    Singapore: "SG",
    Australia: "AU",
    Canada: "CA",
    Korea: "KR",
    "South Korea": "KR",
  };
  return map[name];
}

function extractAcronym(title: string): string | undefined {
  // "ESMO Congress 2026" → "ESMO"
  const m = title.match(/^([A-Z]{2,8})\s/);
  return m ? m[1] : undefined;
}

export const esmoAdapter: IntlAdapter = {
  key: SOURCE_KEY,
  label: "ESMO (European Society for Medical Oncology)",
  defaultSpecialty: "내과",
  priority: "P0",
  async fetchEvents() {
    const html = await fetchHtml(SOURCE_URL);
    return parseEvents(html);
  },
};
