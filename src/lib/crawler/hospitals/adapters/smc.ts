/**
 * 삼성서울병원 (SMC) 어댑터
 * 진료과 목록: https://www.samsunghospital.com/home/reservation/deptSearch.do
 * 의사 목록: https://www.samsunghospital.com/home/reservation/deptDrSearch.do
 *
 * SMC는 AJAX 기반 검색. deptCd 파라미터로 진료과 코드를 보내
 * JSON 또는 HTML 응답을 받는다.
 */
import type { HospitalAdapter, DoctorRaw, ScheduleRaw } from "../types";
import {
  fetchHtml,
  postJson,
  sleep,
  extractText,
  toAbsolute,
  todayIso,
} from "../base";

const BASE = "https://www.samsunghospital.com";

// 삼성서울병원 진료과 코드 목록
const DEPT_CODES = [
  "C001", // 내과
  "C002", // 소화기내과
  "C003", // 심장내과
  "C004", // 호흡기내과
  "C005", // 신장내과
  "C006", // 혈액종양내과
  "C007", // 내분비대사내과
  "C008", // 류마티스내과
  "C009", // 감염내과
  "C010", // 외과
  "C011", // 간담도외과
  "C012", // 위장관외과
  "C013", // 유방외과
  "C014", // 대장항문외과
  "C015", // 흉부외과
  "C016", // 정형외과
  "C017", // 신경외과
  "C018", // 성형외과
  "C019", // 비뇨의학과
  "C020", // 산부인과
  "C021", // 소아청소년과
  "C022", // 신경과
  "C023", // 정신건강의학과
  "C024", // 안과
  "C025", // 이비인후과
  "C026", // 피부과
  "C027", // 재활의학과
  "C028", // 가정의학과
];

type SmcDoctorJson = {
  drNm?: string;
  drNo?: string;
  deptNm?: string;
  specialty?: string;
  position?: string;
  profileUrl?: string;
};

async function fetchDoctorsByDept(deptCd: string): Promise<DoctorRaw[]> {
  // SMC JSON API 시도
  const jsonUrl = `${BASE}/home/reservation/deptDrSearch.do`;
  const jsonResult = await postJson<{ list?: SmcDoctorJson[]; doctorList?: SmcDoctorJson[] }>(
    jsonUrl,
    { deptCd, pageIndex: 1, pageSize: 100 },
  );

  if (jsonResult) {
    const list = jsonResult.list ?? jsonResult.doctorList ?? [];
    if (list.length > 0) {
      return list.map((d) => ({
        externalId: String(d.drNo ?? `smc-${deptCd}-${d.drNm ?? ""}`),
        name: d.drNm ?? "",
        department: d.deptNm ?? "미분류",
        specialty: d.specialty || undefined,
        position: d.position || undefined,
        profileUrl: d.profileUrl ? toAbsolute(BASE, d.profileUrl) : undefined,
      })).filter((d) => d.name.length >= 2);
    }
  }

  // HTML fallback
  const $ = await fetchHtml(`${BASE}/home/reservation/deptDrSearch.do`, { deptCd });
  if (!$) return [];

  const doctors: DoctorRaw[] = [];
  const selectors = [
    ".doctor-list li",
    ".dr_list li",
    ".physician-item",
    ".doc-item",
    ".staff-card",
  ];

  for (const sel of selectors) {
    if ($(sel).length === 0) continue;
    $(sel).each((_, el) => {
      const name = extractText($, $(el).find("strong, .name, h4").first()[0] ?? null);
      if (!name || name.length < 2) return;
      const department = $(el).find(".dept, .major").text().trim() || "미분류";
      const specialty = $(el).find(".specialty, .field").text().trim() || undefined;
      const href = $(el).find("a[href]").attr("href");
      const params = new URLSearchParams((href ?? "").split("?")[1] ?? "");
      const drNo = params.get("drNo") ?? params.get("doctorNo");
      doctors.push({
        externalId: String(drNo ?? `smc-${deptCd}-${name}`),
        name,
        department,
        specialty,
        profileUrl: toAbsolute(BASE, href),
      });
    });
    if (doctors.length > 0) break;
  }

  return doctors;
}

async function fetchSchedule(drNo: string): Promise<ScheduleRaw | null> {
  // SMC 스케줄 API
  type ScheduleRow = { day?: string; dayNm?: string; amYn: string; pmYn: string };
  type ScheduleApiRes = {
    scheduleList?: ScheduleRow[];
    weekSchedule?: ScheduleRow[];
  };

  const jsonResult = await postJson<ScheduleApiRes>(
    `${BASE}/home/reservation/drSchedule.do`,
    { drNo },
  );

  if (jsonResult) {
    const list = jsonResult.scheduleList ?? jsonResult.weekSchedule ?? [];
    if (list.length > 0) {
      const weekdays: Record<string, ("AM" | "PM" | "휴진")[]> = {};
      for (const row of list) {
        const day = row.day ?? row.dayNm;
        if (!day) continue;
        const sessions: ("AM" | "PM" | "휴진")[] = [];
        if (row.amYn === "Y") sessions.push("AM");
        if (row.pmYn === "Y") sessions.push("PM");
        if (sessions.length === 0) sessions.push("휴진");
        weekdays[day] = sessions;
      }
      return { weekdays, updatedAt: todayIso() };
    }
  }

  // HTML fallback
  const $ = await fetchHtml(`${BASE}/home/reservation/drDetail.do`, { drNo });
  if (!$) return null;

  const weekdays: Record<string, ("AM" | "PM" | "휴진")[]> = {};
  const DAYS = ["월", "화", "수", "목", "금", "토"];

  $("table tr").each((_, tr) => {
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
    if (sessions.length > 0) weekdays[dayText] = sessions;
  });

  return { weekdays, updatedAt: todayIso() };
}

export const smcAdapter: HospitalAdapter = {
  code: "SMC",
  name: "삼성서울병원",
  region: "서울",
  doctorListUrl: `${BASE}/home/reservation/deptSearch.do`,

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
