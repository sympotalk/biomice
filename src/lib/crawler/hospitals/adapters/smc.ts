/**
 * 삼성서울병원 (SMC) 어댑터
 *
 * 실제 동작 확인된 구조:
 *   초기: POST /home/reservation/doctorDetailInfo.do (SW=검색어, HTML 응답)
 *   페이징: GET /home/reservation/doctorInfoLists.do?cPage=N&SW=검색어&SUB_DEPT_YN=A
 *
 * HTML 카드 선택자:
 *   article.card-content → .text-blue (이름), .treatment-parts (진료과),
 *                          a[href*="DR_NO"] (의사번호), .card-content-body p (전문분야)
 *
 * 전략: 주요 진료과 키워드 검색 후 DR_NO 기준 중복 제거
 */
import axios from "axios";
import * as cheerio from "cheerio";
import type { HospitalAdapter, DoctorRaw } from "../types";

const BASE = "https://www.samsunghospital.com";
const DETAIL_URL = `${BASE}/home/reservation/doctorDetailInfo.do`;
const LIST_URL = `${BASE}/home/reservation/doctorInfoLists.do`;
const UA = "Mozilla/5.0 (compatible; biomice-crawler/0.1; +https://biomice.kr)";
const PAGE_SIZE = 6; // SMC 페이지당 의사 수 (확인됨)

// 전체 의사 커버를 위한 광범위 검색 키워드
// "과" 단독으로는 진료과명(내과·외과 등)에 모두 매칭되어 대부분의 의사를 커버
const SEARCH_TERMS = [
  "내과", "외과", "신경과", "정형외과", "흉부외과", "성형외과",
  "마취통증", "산부인과", "소아청소년과", "안과", "이비인후과",
  "비뇨의학과", "피부과", "영상의학과", "재활의학과", "정신건강",
  "가정의학과", "응급의학과", "핵의학과", "진단검사", "방사선",
];

const http = axios.create({
  timeout: 20_000,
  headers: { "User-Agent": UA, Referer: BASE },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseDoctors(html: string, seen: Set<string>): DoctorRaw[] {
  const $ = cheerio.load(html);
  const doctors: DoctorRaw[] = [];

  $("article.card-content").each((_, card) => {
    const name = $(card).find(".text-blue").text().trim();
    const dept = $(card)
      .find(".treatment-parts")
      .text()
      .replace(/[[\]]/g, "")
      .trim();
    const drNo = $(card)
      .find('a[href*="DR_NO"]')
      .attr("href")
      ?.match(/DR_NO=(\d+)/)?.[1];
    const specialty = $(card).find(".card-content-body p").text().trim();
    const position = $(card)
      .find("h3.card-content-title span:nth-child(2)")
      .text()
      .trim();

    if (!name || name.length < 2 || !drNo) return;
    if (seen.has(drNo)) return;
    seen.add(drNo);

    doctors.push({
      externalId: drNo,
      name,
      department: dept || "미분류",
      specialty: specialty || undefined,
      position: position || undefined,
      profileUrl: `${BASE}/home/reservation/common/doctorProfile.do?DR_NO=${drNo}`,
    });
  });

  return doctors;
}

async function fetchBySearchTerm(
  sw: string,
  seen: Set<string>,
): Promise<DoctorRaw[]> {
  const collected: DoctorRaw[] = [];

  // 1st page: POST
  const initBody = new URLSearchParams({ SW: sw });
  const initRes = await http.post<string>(DETAIL_URL, initBody.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    responseType: "text",
  });

  const firstPage = parseDoctors(initRes.data, seen);
  collected.push(...firstPage);

  // 총 건수 추출
  const totalMatch = initRes.data.match(/총\s*<[^>]*>(\d+)/);
  const total = totalMatch ? parseInt(totalMatch[1]) : firstPage.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // 2nd page 이후: GET AJAX
  for (let page = 2; page <= Math.min(totalPages, 100); page++) {
    const res = await http.get<string>(LIST_URL, {
      params: {
        cPage: page,
        SW: sw,
        SUB_DEPT_YN: "A",
        DP_CODE: "",
        DP_TYPE: "",
        _: Date.now(),
      },
      responseType: "text",
    });
    const pageDoctors = parseDoctors(res.data, seen);
    collected.push(...pageDoctors);
    if (pageDoctors.length === 0) break;
    await sleep(300);
  }

  return collected;
}

export const smcAdapter: HospitalAdapter = {
  code: "SMC",
  name: "삼성서울병원",
  region: "서울",
  doctorListUrl: DETAIL_URL,

  async fetchDoctors(): Promise<DoctorRaw[]> {
    const all: DoctorRaw[] = [];
    const seen = new Set<string>();

    for (const term of SEARCH_TERMS) {
      const doctors = await fetchBySearchTerm(term, seen);
      all.push(...doctors);
      await sleep(500);
    }

    return all;
  },

  async fetchDoctorSchedule() {
    return null;
  },
};
