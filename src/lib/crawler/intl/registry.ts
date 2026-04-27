import type { IntlAdapter } from "./types";
import { esmoAdapter } from "./sources/esmo";

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
  esmoAdapter,
  // TODO: ESC, AHA, ASCO, ACC, RSNA, ADA, EULAR 등 추가 예정
];

export function getAdapter(key: string): IntlAdapter | undefined {
  return ADAPTERS.find((a) => a.key === key);
}
