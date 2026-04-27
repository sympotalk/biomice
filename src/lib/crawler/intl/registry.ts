import type { IntlAdapter } from "./types";
import { esmoAdapter } from "./sources/esmo";
import { escAdapter } from "./sources/esc";
import { ahaAdapter } from "./sources/aha";
import { ascoAdapter } from "./sources/asco";
import { accAdapter } from "./sources/acc";
import { adaAdapter } from "./sources/ada";
import { rsnaAdapter } from "./sources/rsna";
import { eularAdapter } from "./sources/eular";
import { kamsCertifiedAdapter } from "./sources/kams-certified";
import {
  allConferenceAlertAdapter,
  mConferencesAdapter,
} from "./sources/generic-aggregator";

/**
 * 등록된 국제 학술대회 어댑터 목록.
 *
 * 새 어댑터 추가 절차:
 *   1. src/lib/crawler/intl/sources/{key}.ts 작성 (IntlAdapter 구현)
 *   2. 여기에 import + 배열에 push
 *   3. /api/cron/intl 호출하면 자동으로 모든 어댑터 실행
 *
 * 우선순위 (priority):
 *   P0 — 주 1회 (월 03:00 KST)  · 한국 의사 관심도 가장 높음
 *   P1 — 월 1회                 · 보조 학회
 *   P2 — 분기 1회                · 보강용
 */
export const ADAPTERS: IntlAdapter[] = [
  // P0 — 한국 의사 관심도 최상
  kamsCertifiedAdapter,  // 대한의학회 인정 학술대회 (한국 의사 핵심 데이터)
  escAdapter,            // 심장내과
  ahaAdapter,            // 심장내과
  ascoAdapter,           // 종양 (내과)
  accAdapter,            // 심장내과
  adaAdapter,            // 당뇨/내분비 (내과)
  rsnaAdapter,           // 영상의학
  esmoAdapter,           // 종양 (내과)

  // P1 — 보조
  eularAdapter,          // 류마티스 (내과)

  // P2 — 범용 어그리게이터 (한국 키워드 필터링)
  allConferenceAlertAdapter,
  mConferencesAdapter,

  // TODO: P1+ 추가
  // - AACR (https://www.aacr.org/meeting/aacr-annual-meeting/)
  // - ASH (https://www.hematology.org/meetings/annual-meeting)
  // - AAOS (https://www.aaos.org/annual)
  // - IDSA / ID Week (https://idsociety.org/idweek)
  // - APASL / AASLD (https://www.aasld.org/the-liver-meeting)
  // - UEG Week (https://ueg.eu/week)
  // - AAN (https://www.aan.com/events/annual-meeting)
];

export function getAdapter(key: string): IntlAdapter | undefined {
  return ADAPTERS.find((a) => a.key === key);
}

export function listAdapters(): { key: string; label: string; priority: string; specialty: string }[] {
  return ADAPTERS.map((a) => ({
    key: a.key,
    label: a.label,
    priority: a.priority,
    specialty: a.defaultSpecialty,
  }));
}
