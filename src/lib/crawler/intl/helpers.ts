/**
 * 국제 학술대회 어댑터 공통 헬퍼.
 * 각 source/{key}.ts 어댑터가 사용.
 */

export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  Spain: "ES",
  "United States": "US",
  USA: "US",
  America: "US",
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
  Belgium: "BE",
  Sweden: "SE",
  Denmark: "DK",
  Portugal: "PT",
  Greece: "GR",
  Israel: "IL",
  India: "IN",
  Brazil: "BR",
  Mexico: "MX",
};

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  january: "01", february: "02", march: "03", april: "04", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

export type DateRange = { startDate: string; endDate?: string };

/**
 * 다양한 영문 날짜 표현을 ISO YYYY-MM-DD 범위로 파싱.
 *
 * 지원 형식:
 *   "10-14 October 2026"
 *   "October 10-14, 2026"
 *   "Oct 10-14 2026"
 *   "10 Oct 2026"
 *   "October 10, 2026 - October 14, 2026"
 *   "29 August - 1 September 2026"  (월 경계)
 */
export function parseDateRange(text: string): DateRange | null {
  if (!text) return null;
  const t = text.replace(/\s+/g, " ").trim();

  // "29 August - 1 September 2026" — 월 경계
  const crossMonth = t.match(
    /(\d{1,2})\s+([A-Za-z]+)\s*[–\-~]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/,
  );
  if (crossMonth) {
    const [, d1, m1, d2, m2, year] = crossMonth;
    const mm1 = monthCode(m1);
    const mm2 = monthCode(m2);
    if (mm1 && mm2) {
      return {
        startDate: `${year}-${mm1}-${d1.padStart(2, "0")}`,
        endDate: `${year}-${mm2}-${d2.padStart(2, "0")}`,
      };
    }
  }

  // "10–14 October 2026" / "10-14 Oct 2026"
  const sameMonth = t.match(
    /(\d{1,2})\s*[–\-~]\s*(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})/,
  );
  if (sameMonth) {
    const [, d1, d2, mon, year] = sameMonth;
    const mm = monthCode(mon);
    if (mm) {
      return {
        startDate: `${year}-${mm}-${d1.padStart(2, "0")}`,
        endDate: `${year}-${mm}-${d2.padStart(2, "0")}`,
      };
    }
  }

  // "October 10-14, 2026" / "Oct. 10-14 2026"
  const monthFirst = t.match(
    /([A-Za-z]+)\.?\s+(\d{1,2})\s*[–\-~]\s*(\d{1,2}),?\s+(\d{4})/,
  );
  if (monthFirst) {
    const [, mon, d1, d2, year] = monthFirst;
    const mm = monthCode(mon);
    if (mm) {
      return {
        startDate: `${year}-${mm}-${d1.padStart(2, "0")}`,
        endDate: `${year}-${mm}-${d2.padStart(2, "0")}`,
      };
    }
  }

  // "October 10, 2026 - October 14, 2026"
  const fullRange = t.match(
    /([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})\s*[–\-~to]+\s*([A-Za-z]+)?\.?\s*(\d{1,2}),?\s+(\d{4})/i,
  );
  if (fullRange) {
    const [, m1, d1, y1, m2maybe, d2, y2] = fullRange;
    const mm1 = monthCode(m1);
    const mm2 = monthCode(m2maybe || m1);
    if (mm1 && mm2) {
      return {
        startDate: `${y1}-${mm1}-${d1.padStart(2, "0")}`,
        endDate: `${y2}-${mm2}-${d2.padStart(2, "0")}`,
      };
    }
  }

  // "10 October 2026" 단일 일자
  const single = t.match(/(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})/);
  if (single) {
    const [, d, mon, year] = single;
    const mm = monthCode(mon);
    if (mm) return { startDate: `${year}-${mm}-${d.padStart(2, "0")}` };
  }

  // "October 10, 2026" 단일
  const monFirst = t.match(/([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (monFirst) {
    const [, mon, d, year] = monFirst;
    const mm = monthCode(mon);
    if (mm) return { startDate: `${year}-${mm}-${d.padStart(2, "0")}` };
  }

  return null;
}

function monthCode(s: string): string | undefined {
  return MONTH_MAP[s.toLowerCase().slice(0, s.length === 3 ? 3 : undefined)] ||
    MONTH_MAP[s.toLowerCase()];
}

export type ParsedLocation = {
  city?: string;
  country?: string;
  countryCode?: string;
};

/**
 * 위치 문자열 파싱.
 *   "Barcelona, Spain"        → city=Barcelona, country=Spain, countryCode=ES
 *   "Chicago, IL, USA"        → city=Chicago, IL, country=USA
 *   "Online / Virtual"        → city=Online
 */
export function parseLocation(text: string): ParsedLocation {
  if (!text) return {};
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (/online|virtual|webinar/i.test(cleaned)) {
    return { city: "Online" };
  }
  const parts = cleaned.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { city: parts[0] };

  const country = parts[parts.length - 1];
  const city = parts.slice(0, -1).join(", ");
  return {
    city,
    country,
    countryCode: COUNTRY_NAME_TO_CODE[country],
  };
}

/**
 * 표준 fetch — User-Agent + 한국어 환경 명시 + 타임아웃 30s.
 * Cloudflare Workers fetch 호환.
 */
export async function safeFetch(url: string, init?: RequestInit): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BioMiceCrawler/1.0; +https://biomice.xyz)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
        ...init?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`fetch failed ${res.status}: ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 제목에서 영문 약자 추출.
 *   "ESC Congress 2026"          → "ESC"
 *   "ASCO Annual Meeting 2026"   → "ASCO"
 *   "AHA Scientific Sessions"    → "AHA SS"
 */
export function extractAcronym(title: string): string | undefined {
  // 첫 단어가 대문자 약자인 경우
  const m = title.match(/^([A-Z]{2,8})(?:\s+(Scientific|Annual|Congress|Meeting))?/);
  if (!m) return undefined;
  if (m[2]) {
    return `${m[1]} ${m[2].slice(0, 2).toUpperCase()}`.trim();
  }
  return m[1];
}

/**
 * Slug 생성: "ESC Congress 2026" → "esc-congress"
 */
export function slugify(text: string, year?: string | number): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return year ? `${slug}-${year}` : slug;
}
