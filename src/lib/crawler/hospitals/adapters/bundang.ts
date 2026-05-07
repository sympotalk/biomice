/**
 * 분당서울대학교병원 (SNUBH) 어댑터
 *
 * 실제 동작 확인된 구조:
 *   GET https://www.snubh.org/medical/drMedicalTeam.do?DP_TP=O&DP_CD={CODE}
 *   → 서버 렌더링 HTML — 과별 의사 목록 공개 접근 가능
 *
 * HTML 구조 (확인됨):
 *   각 의사 카드에 이름, [전문진료분야] 레이블, 세부전공 텍스트 포함
 *   선택자: .dr_list li, .doctor-list li, dl.doctor_info dt/dd 등
 *
 * 전략: 34개 진료과 코드를 순회하며 HTML 파싱 후 이름+과코드로 ID 생성
 */
import type { HospitalAdapter, DoctorRaw, ScheduleRaw } from "../types";
import { fetchHtml, sleep, extractText, todayIso } from "../base";

const BASE = "https://www.snubh.org";
const LIST_URL = `${BASE}/medical/drMedicalTeam.do`;

// DevTools 네트워크탭으로 확인한 진료과 코드 목록 (드롭다운 <select> 파싱)
const DEPT_CODES: { code: string; name: string }[] = [
  { code: "FM",  name: "가정의학과" },
  { code: "IMI", name: "감염내과" },
  { code: "GM",  name: "임상유전체의학과" },
  { code: "IME", name: "내분비내과" },
  { code: "IMJ", name: "류마티스내과" },
  { code: "AN",  name: "마취통증의학과" },
  { code: "TR",  name: "방사선종양학과" },
  { code: "PA",  name: "병리과" },
  { code: "UR",  name: "비뇨의학과" },
  { code: "OG",  name: "산부인과" },
  { code: "PS",  name: "성형외과" },
  { code: "PED", name: "소아청소년과" },
  { code: "IMG", name: "소화기내과" },
  { code: "IMN", name: "신장내과" },
  { code: "TS",  name: "심장혈관흉부외과" },
  { code: "OT",  name: "안과" },
  { code: "IMA", name: "알레르기면역내과" },
  { code: "DR",  name: "영상의학과" },
  { code: "GS",  name: "외과" },
  { code: "EM",  name: "응급의학과" },
  { code: "OL",  name: "이비인후과" },
  { code: "RH",  name: "재활의학과" },
  { code: "NP",  name: "정신건강의학과" },
  { code: "OS",  name: "정형외과" },
  { code: "LM",  name: "진단검사의학과" },
  { code: "DS",  name: "치과" },
  { code: "DM",  name: "피부과" },
  { code: "NM",  name: "핵의학과" },
  { code: "GC",  name: "노인병내과" },
  { code: "CVC", name: "심장혈관센터" },
  { code: "RC",  name: "폐센터" },
  { code: "JRC", name: "관절센터" },
  { code: "SPC", name: "척추센터" },
  { code: "AAC", name: "소화기센터" },
];

async function fetchDoctorsByDept(
  deptCode: string,
  deptName: string,
): Promise<DoctorRaw[]> {
  const $ = await fetchHtml(LIST_URL, { DP_TP: "O", DP_CD: deptCode });
  if (!$) return [];

  const doctors: DoctorRaw[] = [];

  // 다중 selector fallback — SNUBH HTML 구조에 맞게 우선순위 순
  const cardSelectors = [
    ".dr_list li",
    ".doctor-list li",
    ".doctor_list li",
    ".doc_list li",
    ".staff-list li",
    ".physician-list li",
  ];

  let parsed = false;
  for (const sel of cardSelectors) {
    if ($(sel).length === 0) continue;

    $(sel).each((_, el) => {
      // 이름: strong, .name, .dr_name, h4, dt 등 첫 번째 요소
      const nameEl = $(el).find("strong, .name, .dr_name, .dr-name, h4, h3, dt").first();
      const name = extractText($, nameEl[0] ?? null);
      if (!name || name.length < 2) return;

      // 전문분야: [전문진료분야] 레이블 다음 텍스트, 또는 .specialty/.field/.care 요소
      let specialty: string | undefined;
      const specEl = $(el).find(".specialty, .field, .care, .subject, dd");
      if (specEl.length) {
        specialty = extractText($, specEl.first()[0]) || undefined;
      } else {
        // 텍스트 전체에서 [전문진료분야] 다음 텍스트 추출
        const fullText = $(el).text();
        const specMatch = fullText.match(/\[전문진료분야\]\s*([^[]+)/);
        if (specMatch) {
          specialty = specMatch[1].split("진료예약")[0].trim() || undefined;
        }
      }

      const position = $(el).find(".position, .rank, .title, .grade").text().trim() || undefined;

      const href = $(el).find("a[href]").first().attr("href");
      const profileUrl = href
        ? href.startsWith("http") ? href : `${BASE}${href}`
        : undefined;

      doctors.push({
        externalId: `snubh-${deptCode}-${name}`,
        name,
        department: deptName,
        specialty,
        position,
        profileUrl,
      });
    });

    if (doctors.length > 0) {
      parsed = true;
      break;
    }
  }

  // fallback: 테이블 기반 파싱
  if (!parsed) {
    $("table tbody tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length < 2) return;
      const name = extractText($, tds[0]);
      if (!name || name.length < 2 || /이름|성명|name/i.test(name)) return;
      const specialty = extractText($, tds[1]) || undefined;
      const href = $(tds[0]).find("a").attr("href");
      const profileUrl = href
        ? href.startsWith("http") ? href : `${BASE}${href}`
        : undefined;
      doctors.push({
        externalId: `snubh-${deptCode}-${name}`,
        name,
        department: deptName,
        specialty,
        profileUrl,
      });
    });
  }

  return doctors;
}

export const bundangAdapter: HospitalAdapter = {
  code: "BUNDANG",
  name: "분당서울대학교병원",
  region: "경기",
  doctorListUrl: LIST_URL,

  async fetchDoctors(): Promise<DoctorRaw[]> {
    const all: DoctorRaw[] = [];
    const seen = new Set<string>();

    for (const { code, name } of DEPT_CODES) {
      const doctors = await fetchDoctorsByDept(code, name);
      for (const doc of doctors) {
        if (!seen.has(doc.externalId)) {
          seen.add(doc.externalId);
          all.push(doc);
        }
      }
      await sleep(500);
    }
    return all;
  },

  async fetchDoctorSchedule(): Promise<ScheduleRaw | null> {
    return { weekdays: {}, updatedAt: todayIso() };
  },
};
