/**
 * 병원 크롤러 공통 유틸리티.
 * 개별 어댑터는 여기서 axiosHospital / sleep / extractText 등을 가져다 쓴다.
 */
import axios from "axios";
import * as cheerio from "cheerio";

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** 병원 크롤 전용 axios 인스턴스. 병원 서버는 느릴 수 있으므로 타임아웃 20s. */
export const axiosHospital = axios.create({
  timeout: 20_000,
  headers: {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
  },
  maxRedirects: 5,
});

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** cheerio로 텍스트 추출 (공백 정리) */
export function extractText(
  $: cheerio.CheerioAPI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  el: any | null,
): string {
  if (!el) return "";
  return $(el).text().replace(/\s+/g, " ").trim();
}

/** href → 절대 URL 변환 */
export function toAbsolute(base: string, href: string | undefined): string | undefined {
  if (!href) return undefined;
  if (href.startsWith("http")) return href;
  try {
    return new URL(href, base).toString();
  } catch {
    return undefined;
  }
}

/** URL에서 특정 쿼리 파라미터 추출 */
export function getParam(url: string, key: string): string | null {
  try {
    return new URL(url).searchParams.get(key);
  } catch {
    return null;
  }
}

/**
 * GET 요청 + cheerio 파싱. 실패 시 null 반환 (어댑터가 graceful하게 처리).
 */
export async function fetchHtml(
  url: string,
  params?: Record<string, string | number>,
  extraHeaders?: Record<string, string>,
): Promise<cheerio.CheerioAPI | null> {
  try {
    const res = await axiosHospital.get<string>(url, {
      params,
      headers: extraHeaders,
      responseType: "text",
    });
    return cheerio.load(res.data);
  } catch {
    return null;
  }
}

/**
 * POST 요청 + cheerio 파싱.
 */
export async function postHtml(
  url: string,
  body: Record<string, string | number>,
  extraHeaders?: Record<string, string>,
): Promise<cheerio.CheerioAPI | null> {
  try {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) params.set(k, String(v));
    const res = await axiosHospital.post<string>(url, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...extraHeaders,
      },
      responseType: "text",
    });
    return cheerio.load(res.data);
  } catch {
    return null;
  }
}

/**
 * POST JSON 요청 → JSON 반환.
 */
export async function postJson<T>(
  url: string,
  body: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T | null> {
  try {
    const res = await axiosHospital.post<T>(url, body, {
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
      },
    });
    return res.data;
  } catch {
    return null;
  }
}

/** 오늘 날짜 ISO string */
export const todayIso = () => new Date().toISOString().slice(0, 10);

/** 빈 ScheduleRaw (어댑터가 스케줄을 파싱 못할 경우 fallback) */
export const emptySchedule = () => ({
  weekdays: {} as Record<string, ("AM" | "PM" | "휴진")[]>,
  updatedAt: todayIso(),
});
