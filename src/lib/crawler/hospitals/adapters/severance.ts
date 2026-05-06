/**
 * 세브란스병원 (SEVERANCE) 어댑터
 * 의사 검색: https://sev.severance.healthcare/sev/doctor/doctorList.do
 * 상세 페이지: https://sev.severance.healthcare/sev/doctor/doctorView.do?drNo=<id>
 *
 * 세브란스는 진료과 코드 + 페이지네이션 기반 의사 목록 제공.
 */
import type { HospitalAdapter, DoctorRaw, ScheduleRaw } from "../types";
import {
  fetchHtml,
  postHtml,
  sleep,
  extractText,
  toAbsolute,
  todayIso,
  getParam,
} from "../base";

const BASE = "https://sev.severance.healthcare";

// 세브란스 진료과 코드
const DEPT_CODES = [
  "DEP0001", // 내과
  "DEP0002", // 소화기내과
  "DEP0003", // 심장내과
  "DEP0004", // 호흡기내과
  "DEP0005", // 신장내과
  "DEP0006", // 혈액종양내과
  "DEP0007", // 내분비내과
  "DEP0008", // 류마티스내과
  "DEP0009", // 감염내과
  "DEP0010", // 외과
  "DEP0011", // 간이식·간담도외과
  "DEP0012", // 위장관외과
  "DEP0013", // 유방외과
  "DEP0014", // 대장항문외과
  "DEP0015", // 흉부외과
  "DEP0016", // 정형외과
  "DEP0017", // 신경외과
  "DEP0018", // 성형외과
  "DEP0019", // 비뇨의학과
  "DEP0020", // 산부인과
  "DEP0021", // 소아청소년과
  "DEP0022", // 신경과
  "DEP0023", // 정신건강의학과
  "DEP0024", // 안과
  "DEP0025", // 이비인후과
  "DEP0026", // 피부과
  "DEP0027", // 재활의학과
  "DEP0028", // 가정의학과
  "DEP0029", // 응급의학과
  "DEP0030", // 마취통증의학과
];

async function fetchDoctorsByDept(deptCd: string): Promise<DoctorRaw[]> {
  const doctors: DoctorRaw[] = [];

  // 세브란스는 POST 파라미터로 deptCd 전송
  const listUrl = `${BASE}/sev/doctor/doctorList.do`;
  const $ = await postHtml(listUrl, { deptCd, pageIndex: 1, pageSize: 50 });
  if (!$) return [];

  const selectors = [
    ".doctor-list .doctor-item",
    ".doc_list li",
    ".physician-list li",
    ".dr-card",
    ".staff-list li",
    ".doctor_card",
  ];

  for (const sel of selectors) {
    if ($(sel).length === 0) continue;
    $(sel).each((_, el) => {
      const name = extractText($, $(el).find("strong, .name, .dr-name, h4").first()[0] ?? null);
      if (!name || name.length < 2) return;

      const department = $(el).find(".dept, .department, .major").first().text().trim() || "미분류";
      const specialty = $(el).find(".specialty, .field, .care").text().replace(/\s+/g, " ").trim() || undefined;
      const position = $(el).find(".position, .rank, .title").text().trim() || undefined;

      const href = $(el).find("a[href]").first().attr("href");
      const profileUrl = toAbsolute(BASE, href);
      const drNo =
        getParam(href ?? "", "drNo") ??
        $(el).data("drno") as string ??
        null;

      doctors.push({
        externalId: String(drNo ?? `sev-${deptCd}-${name}`),
        name,
        department,
        specialty,
        position,
        profileUrl,
      });
    });
    if (doctors.length > 0) break;
  }

  // fallback: 테이블
  if (doctors.length === 0) {
    $("table tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;
      const name = extractText($, tds[0]);
      if (!name || name.length < 2 || /이름|성명/i.test(name)) return;
      const dept = extractText($, tds[1]) || "미분류";
      const href = $(tds[0]).find("a").attr("href");
      const drNo = getParam(href ?? "", "drNo");
      doctors.push({
        externalId: String(drNo ?? `sev-${deptCd}-${name}`),
        name,
        department: dept,
        profileUrl: toAbsolute(BASE, href),
      });
    });
  }

  return doctors;
}

async function fetchSchedule(drNo: string): Promise<ScheduleRaw | null> {
  const url = `${BASE}/sev/doctor/doctorView.do`;
  const $ = await fetchHtml(url, { drNo });
  if (!$) return null;

  const weekdays: Record<string, ("AM" | "PM" | "휴진")[]> = {};
  const DAYS = ["월", "화", "수", "목", "금", "토"];

  const tableSelectors = [".schedule-table", ".clinic-time", ".consult-schedule", ".timetable"];
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
        if (/오전|AM|진료/i.test(t)) sessions.push("AM");
        else if (/오후|PM/i.test(t)) sessions.push("PM");
        else if (/휴진|X/i.test(t)) sessions.push("휴진");
      });
      if (sessions.length) weekdays[dayText] = sessions;
    });

    if (Object.keys(weekdays).length) break;
  }

  return { weekdays, updatedAt: todayIso() };
}

export const severanceAdapter: HospitalAdapter = {
  code: "SEVERANCE",
  name: "세브란스병원",
  region: "서울",
  doctorListUrl: `${BASE}/sev/doctor/doctorList.do`,

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
