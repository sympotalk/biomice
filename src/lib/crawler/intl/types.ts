/**
 * 국제 학술대회 크롤러 — 공통 타입 / 어댑터 인터페이스.
 *
 * 새 학회 소스를 추가하려면:
 *   1. src/lib/crawler/intl/sources/{source}.ts 작성 — IntlAdapter 구현
 *   2. src/lib/crawler/intl/registry.ts 의 ADAPTERS 배열에 추가
 *   3. /api/cron/intl 호출 (또는 Cloudflare Cron Trigger 자동 실행)
 */

/** 정규화된 국제 학술대회 데이터 — Adapter들이 이 형식으로 반환 */
export type IntlEvent = {
  /** 어댑터 내부 unique 식별자 (예: "esc-congress-2026") — DB의 source_id로 사용 */
  sourceId: string;

  /** 행사명 (영문 풀네임) */
  title: string;

  /** 한글 풀네임 (있으면) */
  titleKo?: string;

  /** 약자 (예: "ESC", "AHA SS", "ASCO 2026") */
  acronym?: string;

  /** 주최 학회명 (영문) */
  societyName: string;

  /** 주최 학회 사이트 */
  societyUrl?: string;

  /** ISO 시작일 YYYY-MM-DD */
  startDate: string;

  /** ISO 종료일 YYYY-MM-DD */
  endDate?: string;

  /** 도시 (예: "Barcelona", "Chicago, IL") */
  city?: string;

  /** 컨벤션센터/호텔 등 */
  venue?: string;

  /** ISO-3166-1 alpha-2 (예: "ES", "US") */
  countryCode?: string;

  /** 국가 풀네임 (예: "Spain") */
  countryName?: string;

  /** 위도·경도 */
  lat?: number;
  lng?: number;

  /** 사전등록 페이지 URL */
  registrationUrl?: string;

  /** 공식 행사 상세 URL (학회 페이지) */
  detailUrl?: string;

  /** 사전등록 마감일 */
  registrationDeadline?: string;

  /** 초록 마감일 */
  abstractDeadline?: string;

  /** 얼리버드 마감일 */
  earlyBirdDeadline?: string;

  /** 행사 모드 */
  mode?: "offline" | "online" | "hybrid";

  /** 한 줄 설명 (KO 권장) */
  description?: string;

  /** 토픽/카테고리 키워드 (영문 OK) — classify에 사용 */
  topics?: string[];

  /** 주요 진료과 (KO) — society/topics 기반 매칭 결과 */
  primarySpecialty?: string;
};

export type IntlAdapter = {
  /** 짧은 식별자 — DB의 source_type 컬럼에 들어감. 영문 소문자/하이픈만. */
  key: string;

  /** 사람용 이름 (예: "ESC (European Society of Cardiology)") */
  label: string;

  /** 어댑터가 다루는 진료과/도메인 — 빠른 분류 힌트 */
  defaultSpecialty: string;

  /** 우선순위 — P0 = weekly, P1 = monthly, P2 = quarterly */
  priority: "P0" | "P1" | "P2";

  /** 학회의 학술대회 일정 페이지를 fetch & parse하여 IntlEvent[] 반환 */
  fetchEvents: () => Promise<IntlEvent[]>;
};

export type CrawlResult = {
  source: string;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
};
