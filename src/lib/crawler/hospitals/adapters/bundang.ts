/**
 * 분당서울대학교병원 (BUNDANG / SNUBH) 어댑터
 * 공식 사이트: https://www.snubh.org
 * 의사 목록: https://www.snubh.org/depts/main/index.do → 진료과별
 * 의사 상세: https://www.snubh.org/depts/doctor/doctorMain.do?mnuNo=<id>
 *
 * 분당서울대는 HTML 기반 공개 의사 목록이 비교적 잘 구조화되어 있다.
 * 진료과별 URL을 순회하여 의사 목록을 수집한다.
 */
import type { HospitalAdapter, DoctorRaw, ScheduleRaw } from "../types";
import {
  fetchHtml,
  sleep,
  extractText,
  toAbsolute,
  todayIso,
  getParam,
} from "../base";

const BASE = "https://www.snubh.org";

// SNUBH 진료과 메뉴번호 목록
const MENU_NOS = [
  "200010", // 내과
  "200020", // 소화기내과
  "200030", // 심장내과
  "200040", // 호흡기내과
  "200050", // 신장내과
  "200060", // 혈액종양내과
  "200070", // 내분비대사내과
  "200080", // 류마티스내과
  "200090", // 감염내과
  "200100", // 외과
  "200110", // 간담도·췌장외과
  "200120", // 위장관외과
  "200130", // 유방내분비외과
  "200140", // 대장항문외과
  "200150", // 혈관외과
  "200160", // 흉부외과
  "200170", // 정형외과
  "200180", // 신경외과
  "200190", // 성형외과
  "200200", // 비뇨의학과
  "200210", // 산부인과
  "200220", // 소아청소년과
  "200230", // 신경과
  "200240", // 정신건강의학과
  "200250", // 안과
  "200260", // 이비인후과
  "200270", // 피부과
  "200280", // 재활의학과
  "200290", // 가정의학과
  "200300", // 마취통증의학과
];

async function fetchDoctorsByMenu(mnuNo: string): Promise<DoctorRaw[]> {
  const url = `${BASE}/depts/doctor/doctorList.do`;
  const $ = await fetchHtml(url, { mnuNo });
  if (!$) return [];

  const doctors: DoctorRaw[] = [];

  // SNUBH 의사 목록 파싱
  const selectors = [
    ".doctor-list .doctor-item",
    ".doc_list li",
    ".physician-item",
    ".dr-wrap li",
    ".staff-list li",
  ];

  for (const sel of selectors) {
    if ($(sel).length === 0) continue;
    $(sel).each((_, el) => {
      const name = extractText($, $(el).find("strong, .name, .dr-name, h4, .nm").first()[0] ?? null);
      if (!name || name.length < 2) return;

      const department = $(el).find(".dept, .major, .department").first().text().trim() || "미분류";
      const specialty = $(el).find(".specialty, .field, .care").text().replace(/\s+/g, " ").trim() || undefined;
      const position = $(el).find(".position, .rank, .title, .grade").text().trim() || undefined;

      const href = $(el).find("a[href]").first().attr("href");
      const profileUrl = toAbsolute(BASE, href);
      const drMnuNo =
        getParam(href ?? "", "mnuNo") ??
        getParam(href ?? "", "drNo") ??
        $(el).data("drno") as string ??
        null;

      const externalId = drMnuNo
        ? `snubh-${drMnuNo}`
        : `snubh-${mnuNo}-${name}`;

      doctors.push({ externalId, name, department, specialty, position, profileUrl });
    });
    if (doctors.length > 0) break;
  }

  // fallback: table
  if (doctors.length === 0) {
    $("table tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;
      const name = extractText($, tds[0]);
      if (!name || name.length < 2 || /이름|성명/i.test(name)) return;
      const department = extractText($, tds[1]) || "미분류";
      const href = $(tds[0]).find("a").attr("href");
      const drNo = getParam(href ?? "", "mnuNo");
      doctors.push({
        externalId: drNo ? `snubh-${drNo}` : `snubh-${mnuNo}-${name}`,
        name,
        department,
        profileUrl: toAbsolute(BASE, href),
      });
    });
  }

  return doctors;
}

async function fetchSchedule(externalId: string): Promise<ScheduleRaw | null> {
  // externalId = "snubh-<mnuNo>" 패턴
  const mnuNo = externalId.replace("snubh-", "");
  const url = `${BASE}/depts/doctor/doctorMain.do`;
  const $ = await fetchHtml(url, { mnuNo });
  if (!$) return null;

  const weekdays: Record<string, ("AM" | "PM" | "휴진")[]> = {};
  const DAYS = ["월", "화", "수", "목", "금", "토"];

  const tableSelectors = [
    ".schedule-table",
    ".tbl-schedule",
    ".consulting-time",
    ".schedule",
  ];

  for (const sel of tableSelectors) {
    const $tbl = $(sel).first();
    if (!$tbl.length) continue;

    $tbl.find("tr").each((_, tr) => {
      const cells = $(tr).find("th, td");
      const dayText = extractText($, cells[0]).replace(/\s/g, "");
      if (!DAYS.includes(dayText)) return;

      const sessions: ("AM" | "PM" | "휴진")[] = [];
      cells.each((i, cell) => {
        if (i === 0) return;
        const t = extractText($, cell);
        if (/오전|AM/i.test(t)) sessions.push("AM");
        else if (/오후|PM/i.test(t)) sessions.push("PM");
        else if (/휴진|X/i.test(t)) sessions.push("휴진");
      });
      if (sessions.length) weekdays[dayText] = sessions;
    });

    if (Object.keys(weekdays).length) break;
  }

  return { weekdays, updatedAt: todayIso() };
}

export const bundangAdapter: HospitalAdapter = {
  code: "BUNDANG",
  name: "분당서울대학교병원",
  region: "경기",
  doctorListUrl: `${BASE}/depts/main/index.do`,

  async fetchDoctors(): Promise<DoctorRaw[]> {
    const all: DoctorRaw[] = [];
    const seen = new Set<string>();

    for (const mnuNo of MENU_NOS) {
      const doctors = await fetchDoctorsByMenu(mnuNo);
      for (const doc of doctors) {
        if (!seen.has(doc.externalId)) {
          seen.add(doc.externalId);
          all.push(doc);
        }
      }
      await sleep(800);
    }
    return all;
  },

  async fetchDoctorSchedule(externalId: string): Promise<ScheduleRaw | null> {
    return fetchSchedule(externalId);
  },
};
