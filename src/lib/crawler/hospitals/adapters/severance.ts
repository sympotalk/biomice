/**
 * 세브란스병원 (SEVERANCE) 어댑터
 *
 * ⚠️  현재 미동작: sev.severance.healthcare 의사 목록은 SSO 로그인 필수
 *    - 외부에서 /sev/doctor/doctor.do 접근 시 sso.severance.healthcare 로 리다이렉트
 *    - 진료과 목록 API (POST /api/department/list.do?typeCode=DP010100 → 184개과) 는
 *      공개 접근 가능하지만, 의사 목록 API는 인증 세션 없이 접근 불가
 *    - fetchDoctors()는 즉시 빈 배열을 반환해 불필요한 타임아웃을 방지
 *
 * TODO: Severance 내부 API 문서 확보 또는 로그인 우회 방법 확인 필요
 */
import type { HospitalAdapter, DoctorRaw, ScheduleRaw } from "../types";
import { todayIso } from "../base";

const BASE = "https://sev.severance.healthcare";

export const severanceAdapter: HospitalAdapter = {
  code: "SEVERANCE",
  name: "세브란스병원",
  region: "서울",
  doctorListUrl: `${BASE}/sev/doctor/doctorList.do`,

  async fetchDoctors(): Promise<DoctorRaw[]> {
    // SSO 로그인 없이 의사 목록 접근 불가 — 빈 배열 즉시 반환
    return [];
  },

  async fetchDoctorSchedule(): Promise<ScheduleRaw | null> {
    return { weekdays: {}, updatedAt: todayIso() };
  },
};
