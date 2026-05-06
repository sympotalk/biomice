/**
 * 서울대학교병원 (SNUH) 어댑터
 * 의사 검색: https://www.snuh.org/pub/dr/doctorSearch.do
 * POST 파라미터로 진료과 코드별 검색 → JSON 또는 HTML 응답
 *
 * SNUH 의사 목록은 검색 POST API를 사용하므로
 * 각 진료과 코드를 순회하며 의사를 수집한다.
 */
import type { HospitalAdapter, DoctorRaw, ScheduleRaw } from "../types";
import {
  fetchHtml,
  postHtml,
  sleep,
  extractText,
  toAbsolute,
  todayIso,
} from "../base";

const BASE = "https://www.snuh.org";

// SNUH 진료과 코드 (공식 진료과 코드 목록 기준)
const DEPT_CODES = [
  "001", // 내과
  "002", // 외과
  "003", // 정형외과
  "004", // 신경외과
  "005", // 흉부외과
  "006", // 성형외과
  "007", // 마취통증의학과
  "008", // 산부인과
  "009", // 소아청소년과
  "010", // 안과
  "011", // 이비인후과
  "012", // 비뇨의학과
  "013", // 피부과
  "014", // 영상의학과
  "015", // 방사선종양학과
  "016", // 핵의학과
  "017", // 진단검사의학과
  "018", // 병리과
  "019", // 재활의학과
  "020", // 신경과
  "021", // 정신건강의학과
  "022", // 가정의학과
  "023", // 응급의학과
  "024", // 직업환경의학과
  "025", // 구강악안면외과
];

async function fetchDoctorsByDept(deptCd: string): Promise<DoctorRaw[]> {
  // SNUH 의사 검색 — POST 방식
  const searchUrl = `${BASE}/pub/dr/doctorSearch.do`;
  const $ = await postHtml(searchUrl, {
    deptCd,
    page: 1,
    pageSize: 100,
  });
  if (!$) return [];

  const doctors: DoctorRaw[] = [];

  // SNUH 의사 카드/리스트 파싱
  const selectors = [
    ".doctor-list li",
    ".dr-item",
    ".docList li",
    ".physician-card",
    ".dr_search_list li",
    ".doctor-card",
  ];

  for (const sel of selectors) {
    if ($(sel).length === 0) continue;

    $(sel).each((_, el) => {
      const nameEl = $(el).find("strong, .name, .dr-name, h4, .nm").first();
      const name = extractText($, nameEl[0] ?? null);
      if (!name || name.length < 2) return;

      // 진료과
      const deptEl = $(el).find(".dept, .department, .major, .care").first();
      const department = deptEl.text().trim() || "미분류";

      // 전문분야
      const specialtyEl = $(el).find(".specialty, .subject, .field, .care-field");
      const specialty = specialtyEl.text().replace(/\s+/g, " ").trim() || undefined;

      // 직위
      const posEl = $(el).find(".position, .rank, .title, .grade");
      const position = posEl.text().trim() || undefined;

      // 링크 (프로필 URL + doctorNo 추출)
      const linkEl = $(el).find("a[href]").first();
      const href = linkEl.attr("href") ?? "";
      const profileUrl = toAbsolute(BASE, href);

      // doctorNo: SNUH는 쿼리스트링에 doctorNo 또는 drNo 포함
      const params = new URLSearchParams(href.split("?")[1] ?? "");
      const doctorNo =
        params.get("doctorNo") ??
        params.get("drNo") ??
        $(el).data("doctorno") as string ??
        null;

      if (!doctorNo && !profileUrl) return;

      doctors.push({
        externalId: String(doctorNo ?? `snuh-${deptCd}-${name}`),
        name,
        department,
        specialty,
        position,
        profileUrl,
      });
    });

    if (doctors.length > 0) break;
  }

  // fallback: 일반 HTML 테이블
  if (doctors.length === 0) {
    $("table tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;
      const name = extractText($, tds[0]);
      if (!name || name.length < 2 || /이름|성명/i.test(name)) return;
      const dept = extractText($, tds[1]) || "미분류";
      doctors.push({
        externalId: `snuh-${deptCd}-${name}`,
        name,
        department: dept,
      });
    });
  }

  return doctors;
}

async function fetchSchedule(doctorNo: string): Promise<ScheduleRaw | null> {
  const url = `${BASE}/pub/dr/doctorDetail.do`;
  const $ = await fetchHtml(url, { doctorNo });
  if (!$) return null;

  const weekdays: Record<string, ("AM" | "PM" | "휴진")[]> = {};
  const DAYS = ["월", "화", "수", "목", "금", "토"];

  // SNUH 진료시간 테이블: 보통 <th>요일</th> 가로 방향
  const tableSelectors = [
    ".schedule-table",
    ".clinic-schedule",
    ".consultation-time",
    ".schedule_tbl",
    ".timetable",
  ];

  for (const sel of tableSelectors) {
    const $tbl = $(sel).first();
    if (!$tbl.length) continue;

    // 헤더에서 요일 위치 파악
    const headerCells: string[] = [];
    $tbl.find("thead th, tr:first-child th").each((_, th) => {
      headerCells.push(extractText($, th));
    });

    if (headerCells.length === 0) {
      // 세로 방향 파싱
      $tbl.find("tr").each((_, tr) => {
        const cells = $(tr).find("th, td");
        const dayText = extractText($, cells[0]).replace(/\s/g, "");
        if (!DAYS.includes(dayText)) return;

        const sessions: ("AM" | "PM" | "휴진")[] = [];
        cells.each((i, cell) => {
          if (i === 0) return;
          const t = extractText($, cell);
          if (/오전|AM|진료O/i.test(t)) sessions.push("AM");
          else if (/오후|PM/i.test(t)) sessions.push("PM");
          else if (/휴진|없음|X/i.test(t)) sessions.push("휴진");
        });
        if (sessions.length > 0) weekdays[dayText] = sessions;
      });
    } else {
      // 가로 방향 (열 = 요일)
      $tbl.find("tbody tr").each((rowIdx, tr) => {
        const rowHeader = extractText($, $(tr).find("th, td:first-child")[0] ?? null);
        const isAm = /오전|AM/i.test(rowHeader);
        const isPm = /오후|PM/i.test(rowHeader);

        $(tr).find("td").each((colIdx, cell) => {
          const day = headerCells[colIdx + ($(tr).find("th").length > 0 ? 1 : 0)];
          if (!day || !DAYS.includes(day)) return;
          const t = extractText($, cell);
          if (!weekdays[day]) weekdays[day] = [];
          if (/진료|O|◯/i.test(t)) {
            if (isAm) weekdays[day].push("AM");
            else if (isPm) weekdays[day].push("PM");
          } else if (/휴진|X|✕/i.test(t)) {
            if (!weekdays[day].includes("휴진")) weekdays[day].push("휴진");
          }
        });
      });
    }

    if (Object.keys(weekdays).length > 0) break;
  }

  return { weekdays, updatedAt: todayIso() };
}

export const snuhAdapter: HospitalAdapter = {
  code: "SNUH",
  name: "서울대학교병원",
  region: "서울",
  doctorListUrl: `${BASE}/pub/dr/doctorSearch.do`,

  async fetchDoctors(): Promise<DoctorRaw[]> {
    const all: DoctorRaw[] = [];
    const seen = new Set<string>();

    for (const deptCd of DEPT_CODES) {
      const doctors = await fetchDoctorsByDept(deptCd);
      for (const doc of doctors) {
        if (!seen.has(doc.externalId)) {
          seen.add(doc.externalId);
          all.push(doc);
        }
      }
      await sleep(1000);
    }
    return all;
  },

  async fetchDoctorSchedule(externalId: string): Promise<ScheduleRaw | null> {
    return fetchSchedule(externalId);
  },
};
