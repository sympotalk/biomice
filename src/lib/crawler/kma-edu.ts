/**
 * 대한의사협회 연수교육센터 (edu.kma.org) 크롤러
 *
 * KAMS(kams.or.kr)보다 훨씬 많은 정보를 제공하는 KMA 공식 CME 플랫폼.
 * - 교육코드(KMA2026_MMDD_XXXXXX), 평점, 수강료, 교육 URL, 강의 시간표 등 포함
 * - 다일차 행사는 Day1/Day2 등 별도 row로 분리됨 (각 eduidx 독립)
 *
 * 목록: GET  https://edu.kma.org/edu/schedule?pageNo=N&start_dt=...&end_dt=...
 *   (HTML form은 method=post이지만 $.goPage()가 실제로는 GET 쿼리스트링으로 제출 — POST는 405)
 * 상세: GET  https://edu.kma.org/edu/schedule_view?eduidx=N
 */
import axios from "axios";
import * as cheerio from "cheerio";
import { extractCity } from "./kams";

const BASE = "https://edu.kma.org";
const LIST_URL = `${BASE}/edu/schedule`;
const DETAIL_URL = (eduidx: number) => `${BASE}/edu/schedule_view?eduidx=${eduidx}`;

const UA = "Mozilla/5.0 (compatible; biomice-crawler/0.1; +https://biomice.kr)";

const http = axios.create({
  timeout: 20_000,
  headers: { "User-Agent": UA },
});

// 522 (Cloudflare 연결 타임아웃) 발생 시 최대 2회 재시도
http.interceptors.response.use(undefined, async (err) => {
  const status = err?.response?.status;
  const retryCount: number = (err.config as { _retry?: number })?._retry ?? 0;
  if ((status === 522 || status === 524) && retryCount < 2) {
    (err.config as { _retry?: number })._retry = retryCount + 1;
    await sleep(2000 * (retryCount + 1));
    return http.request(err.config);
  }
  return Promise.reject(err);
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── types ────────────────────────────────────────────────────────────────────

export type KmaEduListItem = {
  eduidx: number;
  eventName: string;
  institutionName: string;
  date: string;       // YYYY-MM-DD
  venue: string;
  creditPoints: number | null;
};

export type KmaEduLecture = {
  type: string;       // 교육시간 | 휴식 | 토론 | 기타
  date: string;       // MM-DD
  time: string;       // HH:MM~HH:MM
  title: string;
  lecturer: string;
  affiliation: string;
};

export type KmaEduDetail = {
  institutionName: string;
  eduCode: string | null;         // KMA2026_0408_169877
  eventName: string;
  keywords: string | null;
  region: string | null;
  venue: string | null;
  eduTypes: string[];             // ['임상의학:내과', ...] — 선택항목 없음 제외
  contactInfo: string | null;
  eduUrl: string | null;
  expectedParticipants: number | null;
  fee: string | null;
  notes: string | null;
  creditPoints: number | null;
  lectures: KmaEduLecture[];
};

// ─── list page ────────────────────────────────────────────────────────────────

/** GET 목록 페이지 한 장을 파싱해 eduidx 배열 반환 */
export async function fetchListPage(
  page: number,
  startDate: string,
  endDate: string,
): Promise<KmaEduListItem[]> {
  const res = await http.get<string>(LIST_URL, {
    params: {
      pageNo: page,
      start_dt: startDate,
      end_dt: endDate,
      sch_type: "1",
      sch_txt: "",
      sch_es: "",
      s_smallcode_Nm: "",
      s_place: "",
      siidx: "",
      s_escidx: "",
      s_scode: "",
    },
    responseType: "text",
  });

  const $ = cheerio.load(res.data);
  const items: KmaEduListItem[] = [];
  const seen = new Set<number>();

  $("[onclick]").each((_, el) => {
    const onclick = $(el).attr("onclick") ?? "";
    const m = onclick.match(/viewer\((\d+)\)/);
    if (!m) return;
    const eduidx = Number(m[1]);
    if (seen.has(eduidx)) return;
    seen.add(eduidx);

    // title p: "행사명\n평점 N"
    const titleEl = $(el).is("p") ? $(el) : $(el).closest("div, li").find("p").first();
    const rawTitle = titleEl.text().trim();
    const creditMatch = rawTitle.match(/평점\s*(\d+)/);
    const creditPoints = creditMatch ? Number(creditMatch[1]) : null;
    const eventName = rawTitle.replace(/평점\s*\d+/, "").trim();

    // sub UL: 교육일자, 기관명, 장소
    const ul = $(el).is("ul") ? $(el) : $(el).closest("div, li").find("ul").first();
    const ulText = ul.text();
    const dateMatch = ulText.match(/교육일자\s*([\d-]+)/);
    const institutionMatch = ulText.match(/기관명\s*([^\n\t교육]+)/);
    const venueMatch = ulText.match(/장소\s*([^\n\t교육]+)/);

    const date = dateMatch?.[1]?.trim() ?? "";
    const institutionName = institutionMatch?.[1]?.trim() ?? "";
    const venue = venueMatch?.[1]?.trim() ?? "";

    if (!eduidx || !date) return;

    items.push({ eduidx, eventName, institutionName, date, venue, creditPoints });
  });

  return items;
}

/** 총 페이지 수 파악 */
async function fetchTotalPages(startDate: string, endDate: string): Promise<number> {
  const res = await http.get<string>(LIST_URL, {
    params: {
      pageNo: 1,
      start_dt: startDate,
      end_dt: endDate,
      sch_type: "1",
      sch_txt: "",
      sch_es: "",
      s_smallcode_Nm: "",
      s_place: "",
      siidx: "",
      s_escidx: "",
      s_scode: "",
    },
    responseType: "text",
  });

  const $ = cheerio.load(res.data);
  let maxPage = 1;

  $("[onclick*='goPage']").each((_, el) => {
    const m = $(el).attr("onclick")?.match(/goPage\((\d+)\)/);
    if (m) maxPage = Math.max(maxPage, Number(m[1]));
  });

  return maxPage;
}

// ─── detail page ──────────────────────────────────────────────────────────────

/** th → td 매핑 헬퍼 */
function parseDetailTable($: cheerio.CheerioAPI): Map<string, string> {
  const map = new Map<string, string>();
  $("table tr").each((_, tr) => {
    const ths = $(tr).find("th");
    const tds = $(tr).find("td");
    ths.each((i, th) => {
      const key = $(th).text().trim();
      const val = $(tds[i])?.text().trim() ?? "";
      if (key) map.set(key, val);
    });
  });
  return map;
}

/** 강의 시간표 파싱 — 헤더 행(구분/월/일/시간/...) 이후 데이터 rows */
function parseLectures($: cheerio.CheerioAPI): KmaEduLecture[] {
  const lectures: KmaEduLecture[] = [];
  let inSchedule = false;

  $("table tr").each((_, tr) => {
    const ths = $(tr).find("th");
    // 헤더 행 감지: "구분", "월/일", "시간", "교육제목" 포함
    if (ths.length >= 4) {
      const headers = Array.from(ths).map((th) => $(th).text().trim());
      if (headers.includes("구분") && headers.includes("교육제목")) {
        inSchedule = true;
        return;
      }
    }
    if (!inSchedule) return;

    const tds = $(tr).find("td");
    if (tds.length < 4) return;

    const type = $(tds[0]).text().trim();
    const date = $(tds[1]).text().trim();
    const time = $(tds[2]).text().trim();
    const title = $(tds[3]).text().trim();
    const lecturer = tds.length >= 5 ? $(tds[4]).text().trim() : "";
    const affiliation = tds.length >= 6 ? $(tds[5]).text().trim() : "";

    if (!title || title === "교육제목") return;
    lectures.push({ type, date, time, title, lecturer, affiliation });
  });

  return lectures;
}

export async function fetchDetail(eduidx: number): Promise<KmaEduDetail | null> {
  try {
    const res = await http.get<string>(DETAIL_URL(eduidx), { responseType: "text" });
    const $ = cheerio.load(res.data);
    const fields = parseDetailTable($);

    const get = (key: string) => {
      const v = fields.get(key);
      return !v || v === "선택항목 없음" ? null : v;
    };

    // 교육종류 수집 (임상의학, 기초의학, 인문사회의학, 의료정책, 기타)
    const typeKeys = ["교육종류(임상의학)", "교육종류(기초의학)", "교육종류(인문사회의학)", "교육종류(의료정책)", "교육종류(기타)"];
    const eduTypes = typeKeys
      .map((k) => {
        const domain = k.replace("교육종류(", "").replace(")", "");
        const val = get(k);
        return val ? `${domain}:${val}` : null;
      })
      .filter(Boolean) as string[];

    // 승인평점: "5 점" → 5
    const creditRaw = get("승인평점");
    const creditPoints = creditRaw ? Number(creditRaw.replace(/[^0-9]/g, "")) || null : null;

    // 참가예상인원: "1000명" → 1000
    const participantsRaw = get("참가예상인원");
    const expectedParticipants = participantsRaw
      ? Number(participantsRaw.replace(/[^0-9]/g, "")) || null
      : null;

    return {
      institutionName: get("기관명") ?? "",
      eduCode: get("교육코드"),
      eventName: get("교육명") ?? "",
      keywords: get("키워드"),
      region: get("지역"),
      venue: get("장소"),
      eduTypes,
      contactInfo: get("교육문의"),
      eduUrl: get("교육 URL"),
      expectedParticipants,
      fee: get("수강료"),
      notes: get("비고"),
      creditPoints,
      lectures: parseLectures($),
    };
  } catch {
    return null;
  }
}

// ─── orchestration ────────────────────────────────────────────────────────────

export type KmaEduCrawlOptions = {
  /** 검색 시작일 (YYYY-MM-DD). 기본: 오늘 */
  startDate?: string;
  /** 검색 종료일 (YYYY-MM-DD). 기본: 오늘 +1년 */
  endDate?: string;
  /** 최대 페이지 수. 기본: 100 (= 최대 1500건) */
  maxPages?: number;
  /** 상세 페이지 크롤 여부. 기본: true */
  fetchDetails?: boolean;
  /** 요청 간 딜레이 ms. 기본: 1500 */
  delayMs?: number;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function crawlKmaEdu(opts: KmaEduCrawlOptions = {}): Promise<any[]> {
  const today = todayIso();
  const startDate = opts.startDate ?? today;
  const endDate = opts.endDate ?? addDays(today, 365);
  const maxPages = opts.maxPages ?? 100;
  const delay = opts.delayMs ?? 1500;
  const fetchDetails = opts.fetchDetails !== false;

  // 총 페이지 수 확인
  const totalPages = await fetchTotalPages(startDate, endDate);
  const pagesToCrawl = Math.min(totalPages, maxPages);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any[] = [];
  const seenEduidx = new Set<number>();

  for (let page = 1; page <= pagesToCrawl; page++) {
    const items = await fetchListPage(page, startDate, endDate);
    if (items.length === 0) break;

    for (const item of items) {
      if (seenEduidx.has(item.eduidx)) continue;
      seenEduidx.add(item.eduidx);

      let detail: KmaEduDetail | null = null;
      if (fetchDetails) {
        detail = await fetchDetail(item.eduidx);
        await sleep(delay);
      }

      const venueFinal = detail?.venue ?? item.venue;
      const { city, venue } = extractCity(venueFinal);

      const departments =
        detail?.eduTypes
          ?.map((t) => {
            // "임상의학:내과, 외과" → ["내과", "외과"]
            const [, subjects] = t.split(":");
            return subjects?.split(",").map((s) => s.trim()) ?? [];
          })
          .flat()
          .filter(Boolean) ?? null;

      const lectures =
        detail?.lectures && detail.lectures.length > 0
          ? detail.lectures.map((l) => ({
              time: `${l.date} ${l.time}`.trim(),
              title: l.title,
              lecturer: l.lecturer,
              affiliation: l.affiliation,
            }))
          : null;

      out.push({
        kma_edu_id: item.eduidx,
        society_name: detail?.institutionName ?? item.institutionName,
        event_name: detail?.eventName ?? item.eventName,
        start_date: item.date,
        end_date: item.date,          // KMA edu: 하루 단위
        venue: venue ?? null,
        city: city ?? null,
        registration_url: detail?.eduUrl ?? null,
        event_code: detail?.eduCode ?? null,
        kma_category: detail?.eduTypes?.join(", ") ?? null,
        departments: departments && departments.length > 0 ? departments : null,
        description: detail?.notes ?? null,
        cme_credits_kr: detail?.creditPoints ?? item.creditPoints ?? null,
        lectures: lectures ? JSON.stringify(lectures) : null,
        fee: detail?.fee ?? null,
        contact_info: detail?.contactInfo ?? null,
        keywords: detail?.keywords ?? null,
        conference_type: "domestic",
        country_code: "KR",
        source_type: "kma_edu",
        source_id: String(item.eduidx),
        mode: detectMode(item.venue, detail?.venue),
        is_deleted: false,
        is_kams_certified: true,
      });
    }

    await sleep(delay);
  }

  return out;
}

function detectMode(listVenue: string, detailVenue: string | null | undefined): string {
  const venue = detailVenue ?? listVenue;
  if (/온라인|zoom|webinar|웨비나|cyber/i.test(venue)) return "online";
  if (/온\+오프|하이브리드|hybrid/i.test(venue)) return "hybrid";
  return "offline";
}
