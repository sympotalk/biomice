import type { HospitalAdapter } from "./types";

// 어댑터 구현체 import
import { amcAdapter }       from "./adapters/amc";
import { snuhAdapter }      from "./adapters/snuh";
import { smcAdapter }       from "./adapters/smc";
import { severanceAdapter } from "./adapters/severance";
import { bundangAdapter }   from "./adapters/bundang";

/**
 * 병원 어댑터 레지스트리.
 * 실제 어댑터 구현은 adapters/ 하위에 위치하며, 여기서 import해 등록한다.
 * 미구현 병원은 null로 표시 → 관리자 크롤 트리거 시 "지원 예정" 처리.
 */
const registry = new Map<string, HospitalAdapter>();

export function registerAdapter(adapter: HospitalAdapter) {
  registry.set(adapter.code, adapter);
}

export function getAdapter(code: string): HospitalAdapter | null {
  return registry.get(code) ?? null;
}

export function listAdapters(): HospitalAdapter[] {
  return [...registry.values()];
}

// ── 어댑터 등록 (빌드 타임 side-effect) ─────────────────────────────────────
registerAdapter(amcAdapter);
registerAdapter(snuhAdapter);
registerAdapter(smcAdapter);
registerAdapter(severanceAdapter);
registerAdapter(bundangAdapter);

/** 전국 145개 병원 메타 (코드·이름·지역). 어댑터 미구현은 adapter=null. */
export const HOSPITAL_META: { code: string; name: string; region: string }[] = [
  // ── 서울 (58개) ─────────────────────────────────────────────────────────
  { code: "AMC",       name: "서울아산병원",          region: "서울" },
  { code: "SNUH",      name: "서울대학교병원",         region: "서울" },
  { code: "SMC",       name: "삼성서울병원",           region: "서울" },
  { code: "SEVERANCE", name: "세브란스병원",           region: "서울" },
  { code: "CMC",       name: "서울성모병원",           region: "서울" },
  { code: "SNUBH",     name: "서울대 보라매병원",      region: "서울" },
  { code: "KCMC",      name: "강남세브란스병원",       region: "서울" },
  { code: "ANAM",      name: "고려대 안암병원",        region: "서울" },
  { code: "GND",       name: "고려대 구로병원",        region: "서울" },
  { code: "EWHA",      name: "이화여대 목동병원",      region: "서울" },
  { code: "HANYANG",   name: "한양대학교병원",         region: "서울" },
  { code: "SMH",       name: "서울중앙병원",           region: "서울" },
  { code: "KMH",       name: "경희대병원",             region: "서울" },
  { code: "SOONCHUN",  name: "순천향대 서울병원",      region: "서울" },
  { code: "INHA",      name: "인하대병원",             region: "인천" },
  // ── 경기 (59개 샘플) ────────────────────────────────────────────────────
  { code: "AJOU",      name: "아주대학교병원",         region: "경기" },
  { code: "BUNDANG",   name: "분당서울대학교병원",     region: "경기" },
  { code: "CHA",       name: "차의과학대 분당차병원",  region: "경기" },
  { code: "SNUBDG",    name: "서울대 분당병원",        region: "경기" },
  { code: "MYONGJI",   name: "명지병원",               region: "경기" },
  { code: "HALLYM",    name: "한림대 성심병원",        region: "경기" },
  { code: "SOON_SU",   name: "순천향대 부천병원",      region: "경기" },
  { code: "GACHON",    name: "가천대 길병원",          region: "인천" },
  // ── 부산 ────────────────────────────────────────────────────────────────
  { code: "PUSAN",     name: "부산대학교병원",         region: "부산" },
  { code: "DONGAHN",   name: "동아대학교병원",         region: "부산" },
  { code: "KOSIN",     name: "고신대 복음병원",        region: "부산" },
  { code: "INJE_BUSAN",name: "인제대 부산백병원",      region: "부산" },
  // ── 대구 ────────────────────────────────────────────────────────────────
  { code: "KNU",       name: "경북대학교병원",         region: "대구" },
  { code: "YEUNGNAM",  name: "영남대학교병원",         region: "대구" },
  { code: "DAEGU_CMC", name: "대구가톨릭대학교병원",  region: "대구" },
  // ── 광주 ────────────────────────────────────────────────────────────────
  { code: "JNUH",      name: "전남대학교병원",         region: "광주" },
  { code: "CHOSUN",    name: "조선대학교병원",         region: "광주" },
  // ── 대전 ────────────────────────────────────────────────────────────────
  { code: "CNUH",      name: "충남대학교병원",         region: "대전" },
  { code: "EULJI",     name: "을지대학교병원",         region: "대전" },
];
