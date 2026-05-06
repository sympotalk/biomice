# Issues — biomice

> 미해결 이슈 트래커. `/save-session`, `/sync-github` 실행 시 자동으로 항목 추가/제거.
>
> 우선순위: **P0** 즉시 / **P1** 다음 sprint / **P2** 백로그

## 미해결 (Open)

### P0

- [ ] **KAMS 어댑터 selector 검증**
  - 위치: `src/lib/crawler/intl/sources/kams-certified.ts`
  - 현상: 실제 KAMS 게시판 HTML 구조 미확인. dry-run 시 fetched 0 가능
  - 해결: `/admin/crawlers`에서 dry-run → 결과 0건이면 selector 수정
  - 등록일: 2026-04-28

### P1

- [ ] **`metadataBase` 도메인 불일치**
  - 위치: `src/app/layout.tsx`
  - 현상: `metadataBase: new URL("https://biomice.kr")` ← 운영 도메인은 `biomice.xyz`
  - 해결: 한 줄 수정 + OG 이미지 절대 URL 검증
  - 등록일: 2026-04-29

- [ ] **국제 어댑터 selector 검증 (8개)**
  - 위치: `src/lib/crawler/intl/sources/{esc,aha,asco,acc,ada,rsna,esmo,eular,...}.ts`
  - 현상: 학회 사이트 HTML 구조 추정 기반. 실제 fetched 결과 미검증
  - 해결: 어댑터별 dry-run → fetched 수 확인 → 0이면 selector 수정
  - 등록일: 2026-04-28

### P2

- [ ] **학회 self-edit 권한 (Phase 3)**
  - 검증된 학회 admin이 본인 페이지 직접 수정
- [ ] **CME 평점 자동 매핑** (KMA 교육센터 cross-reference)
- [ ] **카카오톡/이메일 다이제스트** (즐겨찾기 학회 신규 일정 자동 알림)
- [ ] **세션/연자 단위 데이터 모델** (myfair / monews 차별화 기능)

## 해결됨 (Closed)

> `/save-session` 시 close된 항목은 여기로 이동.

- [x] **2026-04-29** Cloudflare cron string `0 18 * * 0` 거부 → `0 18 * * SUN` (`9e9a9b9`)
- [x] **2026-04-28** /admin/crawlers 토큰 의존성 — server action 기반으로 전환 (`9e9a9b9`)
- [x] **2026-04-28** 학회 specialty NULL 168개 → 자동 매핑 100% 채움 (`2a85ea6`)
- [x] **2026-04-27** 갤럭시 S25 카드 잘림 — minmax(0,1fr) + box-sizing 글로벌 적용
- [x] **2026-04-27** /societies/[slug] 학회명 한 글자씩 깨짐 — flex column on mobile
