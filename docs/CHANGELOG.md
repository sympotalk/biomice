# Changelog

본 프로젝트의 모든 주요 변경사항을 기록합니다.
[Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식을 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

> `/save-session` 또는 `/quick-save` 실행 시 자동으로 항목이 추가됩니다.

## [Unreleased]

### Added
- 국제 학술대회 크롤러 인프라 — 11개 어댑터 (ESC/AHA/ASCO/ACC/ADA/RSNA/ESMO/EULAR/KAMS인정/AllConferenceAlert/mConferences)
- `/admin/crawlers` server action 기반 트리거 (CRAWLER_TOKEN 불필요)
- KAMS 국내개최 국제학술대회 인정 어댑터
- DB 컬럼: `is_kams_certified`, `related_korean_society`, `cme_credits_kr`
- Cloudflare Cron Trigger (매주 일요일 18:00 UTC = KST 월 03:00)

### Changed
- 학회 페이지 specialty 100% 자동 매핑 (이전 5%)
- 학술대회 카드 영문 약자 (KAIM/KSC/KOA) 통일

### Fixed
- Cloudflare cron string `0 18 * * 0` → `0 18 * * SUN` (Cloudflare가 day-of-week 0 거부)
- 갤럭시 S25 카드 우측 잘림 — `minmax(0, 1fr)` + 전역 `box-sizing: border-box`
- /societies/[slug] 학회명 한 글자씩 깨짐 — 모바일에서 flex column 강제

## [0.4.0] — 2026-04-27 (Phase 4 Polish)

### Added
- 모바일 가로형 row 카드 (1열 stack, 영문 약자 박스, 진료과별 색상)
- 학술대회 상세 페이지 데스크톱 3열 레이아웃 + 좌측 메타 (학회 + 지도)
- 마감 임박 강조 (D-7 이내 + registration_url) 빨간 테두리 + pulse
- 모바일 햄버거 드로어 + 빠른 접근 섹션
- viewport meta 태그 (모바일 미디어 쿼리 정상 동작)
- 글로벌 box-sizing border-box (운영 빌드 누락 보강)

### Changed
- 학회 카드 디자인 — myfair.co 스타일 적용
- Header 단순화 (5→3 메뉴)
- 학회 약자 표시 한글→영문 (KAIM, KSC, KOA 등 130+ 매핑)

## [0.3.0] — 2026-04-26 (검색 + 캘린더 + 광고)

### Added
- 학술대회 검색 고도화 (도시 필터, 날짜 범위, 캘린더 뷰)
- 학회 프로필 페이지 + 제약사 광고 문의 폼
- D-7 / D-1 이메일 알림 시스템 (Resend)
- 사용자 프로필 (의사/제약사 구분, 알림 설정)

### Changed
- 도메인 `biomice.kr` → `biomice.xyz`

## [0.2.0] — 2026 (즐겨찾기)

### Added
- 회원가입/로그인 (Supabase Auth)
- 학술대회 즐겨찾기 + 마이페이지
- iCal `.ics` 다운로드

## [0.1.0] — 2026 (MVP)

### Added
- 학술대회 목록·상세 페이지
- KAMS 크롤러 (axios + cheerio)
- 광고 배너 슬롯 3곳 (메인 / 사이드 / 상세)
- 관리자 기본 (Supabase 대시보드 직접 사용)
- Cloudflare Workers 배포 (OpenNext 어댑터)
