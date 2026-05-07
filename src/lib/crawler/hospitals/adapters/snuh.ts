/**
 * 서울대학교병원 (SNUH) 어댑터
 *
 * 실제 동작 확인된 API:
 *   POST https://www.snuh.org/blog/ajaxBlogSearchDr.do
 *   params: q="", hsp_cd="1", pageUnit=1000
 *   → JSON { searchDrList: [...] } — 817명을 단 1회 호출로 반환
 *
 * 각 의사 항목의 blogDrInterestList[0]에 dept_cd, dept_nm, se_dept_nm, majordesc 포함.
 */
import axios from "axios";
import type { HospitalAdapter, DoctorRaw } from "../types";

const BASE = "https://www.snuh.org";
const AJAX_URL = `${BASE}/blog/ajaxBlogSearchDr.do`;
const UA = "Mozilla/5.0 (compatible; biomice-crawler/0.1; +https://biomice.kr)";

export const snuhAdapter: HospitalAdapter = {
  code: "SNUH",
  name: "서울대학교병원",
  region: "서울",
  doctorListUrl: `${BASE}/main.do`,

  async fetchDoctors(): Promise<DoctorRaw[]> {
    const body = new URLSearchParams({
      q: "",
      hsp_cd: "1",
      pageIndex: "1",
      pageUnit: "1000",
    });

    const res = await axios.post<{ searchDrList?: Record<string, unknown>[] }>(
      AJAX_URL,
      body.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: `${BASE}/main.do`,
          "User-Agent": UA,
        },
        timeout: 20_000,
      },
    );

    const list = res.data?.searchDrList ?? [];

    return list
      .map((d) => {
        const interest = (d.blogDrInterestList as Record<string, string>[] | undefined)?.[0];
        // prefer sub-department (세부전공) over parent department
        const dept = (interest?.se_dept_nm as string) || (interest?.dept_nm as string) || "";
        return {
          externalId: String(d.dr_cd ?? ""),
          name: String(d.kdr_name ?? ""),
          department: dept,
          specialty: (interest?.majordesc as string) || undefined,
          position: (d.lposition as string) || undefined,
          profileUrl: d.dr_cd
            ? `${BASE}/health/doctor/doctorInfoView.do?DR_CD=${d.dr_cd}&hsp_cd=1`
            : undefined,
        } as DoctorRaw;
      })
      .filter((d) => d.name && d.name.length >= 2);
  },

  async fetchDoctorSchedule() {
    return null;
  },
};
