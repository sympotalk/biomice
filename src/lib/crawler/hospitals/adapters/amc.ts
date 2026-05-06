/**
 * 서울아산병원 (AMC) 어댑터
 * 의사 목록: https://www.amc.seoul.kr/asan/depts/deptList.do
 * 개인 상세: https://www.amc.seoul.kr/asan/depts/deptDrDetail.do?doctorId=<id>
 *
 * 구조:
 *   1. /asan/departments/list.do → 진료과 목록
 *   2. 진료과별 /asan/departments/doctors.do?deptCd=<code> → 의사 목록
 *   3. 의사 상세 페이지 → 진료시간 (schedule)
 */
import type { HospitalAdapter, DoctorRaw, ScheduleRaw } from "../types";
import {
  fetchHtml,
  sleep,
  toAbsolute,
  extractText,
  todayIso,
} from "../base";

const BASE = "https://www.amc.seoul.kr";

// 진료과 코드 목록 (AMC 주요 50개 진료과, 크롤 결과로 확장 가능)
const DEPT_CODES = [
  "B000174", // 내과
  "B000175", // 소화기내과
  "B000176", // 심장내과
  "B000177", // 호흡기내과
  "B000178", // 신장내과
  "B000179", // 혈액종양내과
  "B000180", // 내분비대사내과
  "B000181", // 류마티스내과
  "B000182", // 감염내과
  "B000183", // 외과
  "B000184", // 간이식·간담도외과
  "B000185", // 위장관외과
  "B000186", // 유방외과
  "B000187", // 대장항문외과
  "B000188", // 이식외과
  "B000189", // 흉부외과
  "B000190", // 정형외과
  "B000191", // 신경외과
  "B000192", // 성형외과
  "B000193", // 비뇨기과
  "B000194", // 산부인과
  "B000195", // 소아과
  "B000196", // 신경과
  "B000197", // 정신건강의학과
  "B000198", // 안과
  "B000199", // 이비인후과
  "B000200", // 피부과
  "B000201", // 마취통증의학과
  "B000202", // 영상의학과
  "B000203", // 방사선종양학과
  "B000204", // 핵의학과
  "B000205", // 진단검사의학과
  "B000206", // 재활의학과
  "B000207", // 가정의학과
  "B000208", // 응급의학과
];

async function fetchDoctorsByDept(deptCd: string): Promise<DoctorRaw[]> {
  // AMC 의사 목록 URL 패턴 — 실제 URL은 배포 시 검증 필요
  const url = `${BASE}/asan/depts/deptDrList.do`;
  const $ = await fetchHtml(url, { deptCd });
  if (!$) return [];

  const doctors: DoctorRaw[] = [];

  // AMC 의사 카드 파싱 (다중 selector fallback)
  const selectors = [
    ".doctor-item",
    ".doc_list li",
    ".physician-item",
    ".dr_list li",
    ".staff-item",
  ];

  let found = false;
  for (const sel of selectors) {
    if ($(sel).length === 0) continue;

    $(sel).each((_, el) => {
      const nameEl =
        $(el).find("strong, .name, .dr_name, h4, dt").first();
      const name = extractText($, nameEl[0] ?? null);
      if (!name || name.length < 2) return;

      const deptText =
        $(el).find(".dept, .department, dd").first().text().trim() ||
        "미분류";

      const specialtyEl = $(el).find(".specialty, .subject, .field, .care_item");
      const specialty = specialtyEl.text().replace(/\s+/g, " ").trim() || undefined;

      const positionEl = $(el).find(".position, .rank, .title");
      const position = positionEl.text().trim() || undefined;

      const linkEl = $(el).find("a[href]");
      const href = linkEl.attr("href");
      const profileUrl = toAbsolute(BASE, href);

      // doctorId 추출 (URL 쿼리 파라미터 또는 data-id)
      const doctorId =
        $(el).data("doctorid") as string ??
        $(el).find("[data-doctorid]").data("doctorid") as string ??
        (href ? new URLSearchParams(href.split("?")[1] ?? "").get("doctorId") : null) ??
        null;

      if (!doctorId && !profileUrl) return;

      doctors.push({
        externalId: String(doctorId ?? `amc-${deptCd}-${name}`),
        name,
        department: deptText,
        specialty,
        position,
        profileUrl,
      });
    });

    if (doctors.length > 0) {
      found = true;
      break;
    }
  }

  // fallback: 테이블 기반 파싱
  if (!found) {
    $("table tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;
      const name = extractText($, tds[0]);
      if (!name || name.length < 2 || /이름|성명|name/i.test(name)) return;
      const dept = extractText($, tds[1]) || "미분류";
      doctors.push({
        externalId: `amc-${deptCd}-${name}`,
        name,
        department: dept,
      });
    });
  }

  return doctors;
}

async function fetchSchedule(doctorId: string): Promise<ScheduleRaw | null> {
  const url = `${BASE}/asan/depts/deptDrDetail.do`;
  const $ = await fetchHtml(url, { doctorId });
  if (!$) return null;

  const weekdays: Record<string, ("AM" | "PM" | "휴진")[]> = {};
  const dayMap: Record<string, string> = {
    "월": "월", "화": "화", "수": "수", "목": "목", "금": "금", "토": "토",
  };

  // AMC 진료시간 테이블 파싱
  const scheduleSelectors = [".schedule_table", ".consult_schedule", ".clinic_time", ".tbl_schedule"];
  for (const sel of scheduleSelectors) {
    const table = $(sel).first();
    if (!table.length) continue;

    table.find("tr").each((_, tr) => {
      const cells = $(tr).find("td, th");
      if (cells.length < 2) return;
      const dayText = extractText($, cells[0]).replace(/\s/g, "");
      const day = dayMap[dayText];
      if (!day) return;

      const sessions: ("AM" | "PM" | "휴진")[] = [];
      cells.each((i, cell) => {
        if (i === 0) return;
        const text = extractText($, cell);
        if (/오전|AM|진료/i.test(text)) sessions.push("AM");
        else if (/오후|PM/i.test(text)) sessions.push("PM");
        else if (/휴진|없음|X/i.test(text)) sessions.push("휴진");
      });
      if (sessions.length > 0) weekdays[day] = sessions;
    });

    if (Object.keys(weekdays).length > 0) break;
  }

  // 진료시간 행을 AM/PM 기준으로 파싱하는 다른 패턴
  if (Object.keys(weekdays).length === 0) {
    $("table").each((_, tbl) => {
      const headers: string[] = [];
      $(tbl).find("thead th, tr:first-child th, tr:first-child td").each((_, th) => {
        headers.push(extractText($, th));
      });

      const amRowIdx = headers.findIndex((h) => /오전|AM/i.test(h));
      const pmRowIdx = headers.findIndex((h) => /오후|PM/i.test(h));
      const dayRowIdx = headers.findIndex((h) => /요일|day/i.test(h));

      if (amRowIdx < 0 && pmRowIdx < 0 && dayRowIdx < 0) return;

      $(tbl).find("tbody tr").each((rowIdx, tr) => {
        const cells = $(tr).find("td");
        cells.each((colIdx, cell) => {
          const day = headers[colIdx];
          if (!dayMap[day]) return;
          const text = extractText($, cell);
          if (!weekdays[day]) weekdays[day] = [];
          if (/진료|O|◯/i.test(text)) {
            if (rowIdx === amRowIdx) weekdays[day].push("AM");
            else if (rowIdx === pmRowIdx) weekdays[day].push("PM");
          } else if (/휴진|X|✕/i.test(text)) {
            weekdays[day].push("휴진");
          }
        });
      });
    });
  }

  return { weekdays, updatedAt: todayIso() };
}

export const amcAdapter: HospitalAdapter = {
  code: "AMC",
  name: "서울아산병원",
  region: "서울",
  doctorListUrl: `${BASE}/asan/depts/deptList.do`,

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
      await sleep(800);
    }
    return all;
  },

  async fetchDoctorSchedule(externalId: string): Promise<ScheduleRaw | null> {
    return fetchSchedule(externalId);
  },
};
