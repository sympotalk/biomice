# BioMICE — Project State

> 새 Claude 세션이 막힘 없이 이어서 작업할 수 있도록 작성된 단일 진실 문서.
> 마지막 업데이트: 2026-04-26

---

## 1. 프로젝트 한 줄 요약

국내 의학 학술대회 정보를 한 곳에 모은 플랫폼. 대한의학회(KAMS) 데이터를 매일 크롤링해서 의사·제약사 직원에게 제공하고, Featured/배너로 광고 수익을 낸다. 레퍼런스: [myfair.co](https://myfair.co/).

**도메인:** https://biomice.xyz

---

## 2. 인프라 한눈에

| 영역 | 서비스 | 식별자 |
|---|---|---|
| 코드 | GitHub | `sympotalk/biomice` |
| 배포 | Cloudflare Workers (OpenNext 어댑터) | Worker 이름 `biomice` |
| 호스팅 도메인 | Cloudflare | `biomice.xyz` |
| DB / Auth | Supabase | 프로젝트 `vmbctjfygimsbirlsaxk` |
| 이메일 | Resend | D-7 / D-1 알림용 |

**배포 방식:** `main` 브랜치에 푸시 → GitHub Actions(`.github/workflows/deploy.yml`) → `npm run deploy` → `opennextjs-cloudflare deploy` → Cloudflare Workers 갱신.

**필수 GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID` (이전에 한 번 잘못 입력한 적 있음 — 올바른 값: `f087bbc76f41c6930be82c69f516e3fc`)

**브랜치 전략:**
- 현재 작업 브랜치: `claude/phase-4-polish`
- 사용자 요청 시 머지 PR 만들지 말고 `git push origin HEAD:main`로 메인에 직접 푸시
- 푸시 전 `git fetch origin main && git rebase origin/main`로 동기화

---

## 3. 기술 스택

```
Next.js 16.2.4 (App Router)
React 19.2.4
TypeScript 5
Tailwind v4.2.3 (@import "tailwindcss" — config 파일 없음)
@tailwindcss/postcss

Supabase JS 2.104 + @supabase/ssr 0.10
date-fns 4
axios + cheerio (KAMS 크롤러)
resend 6 (이메일)

OpenNext.js Cloudflare 1.19.3 (어댑터)
wrangler 4.84
```

**Node 버전:** 22 (GitHub Actions에서 명시)

---

## 4. 디렉토리 구조

```
biomice/
├── .github/workflows/
│   └── deploy.yml             # main 푸시 → Cloudflare 자동 배포
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # ★ viewport meta는 여기 <head>에 있음
│   │   ├── globals.css        # ★ 모든 디자인 토큰 + 반응형 CSS
│   │   ├── page.tsx           # 홈
│   │   ├── conferences/
│   │   │   ├── page.tsx       # 학술대회 목록 (검색·필터·캘린더 뷰)
│   │   │   └── [id]/page.tsx  # 학술대회 상세 (2단 레이아웃)
│   │   ├── societies/
│   │   │   ├── page.tsx       # 학회 목록 (탭 필터 + 카드 그리드)
│   │   │   └── [slug]/page.tsx # 학회 상세
│   │   ├── login/             # 로그인
│   │   ├── signup/            # 회원가입
│   │   ├── auth/callback/     # Supabase Auth 콜백
│   │   ├── mypage/            # 즐겨찾기 + 알림 설정
│   │   ├── pharma/            # 제약사 광고 문의
│   │   ├── admin/             # 관리자 대시보드 (sympotalk@gmail.com만)
│   │   │   ├── conferences/   # CRUD + CSV 업로드
│   │   │   ├── societies/
│   │   │   └── banners/
│   │   ├── api/
│   │   │   ├── crawl/         # POST: 수동 크롤링 (Bearer CRAWLER_TOKEN)
│   │   │   ├── cron/          # GET: 주기적 실행용
│   │   │   └── ics/[id]/      # GET: 학술대회 .ics 다운로드
│   │   ├── actions/           # Server Actions (auth, bookmark)
│   │   ├── sitemap.ts         # 자동 생성
│   │   └── robots.ts
│   ├── components/
│   │   ├── auth/              # LoginForm, SignupForm, AuthShell
│   │   ├── conferences/       # FilterPanel, ListSidebar, CalendarView, ViewToggle, PaginationClient
│   │   ├── home/              # Hero, ConferenceGrid, SectionHeader
│   │   ├── layout/            # Header, HeaderServer, Footer, UserMenu
│   │   ├── societies/         # SocietyList, SocietyGrid
│   │   └── ui/                # Button, Badge, Chip, SearchBar, Icon, ConferenceCard, FavoriteHeart, AdBanner, EmptyState, Modal, Dropdown
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # 브라우저 클라이언트 (publishable key)
│   │   │   ├── server.ts      # 서버 컴포넌트 클라이언트 (cookies 처리)
│   │   │   └── admin.ts       # 서비스 롤 — 관리자/크롤러 전용
│   │   ├── queries.ts         # 모든 read 쿼리 (listConferences, getConference, getMyBookmarkIds, etc.)
│   │   ├── database.types.ts  # Supabase 자동 생성 타입
│   │   ├── crawler/kams.ts    # KAMS 크롤러 본체
│   │   ├── dates.ts           # formatKoreanDate, computeDDay, isRegistrationOpen
│   │   ├── email.ts           # Resend 발송
│   │   ├── ics.ts             # iCal .ics 생성
│   │   ├── tokens.ts          # 디자인 토큰 (radius 등)
│   │   └── admin.ts
│   └── middleware.ts          # Supabase 세션 갱신 (모든 요청)
├── public/
│   └── logo.png               # ★ BioMICE 공식 로고 (헤더·푸터·드로어에 사용)
├── AGENTS.md                  # ★ Claude Code 작업 지침 (CLAUDE.md가 이걸 import)
├── CLAUDE.md                  # → @AGENTS.md 한 줄
├── PROJECT.md                 # 프로젝트 개요 + 비즈니스 모델 (이전부터 있던 문서)
├── STATE.md                   # ← 이 파일
├── README.md
├── package.json
├── next.config.ts             # OpenNext context 초기화
├── open-next.config.ts        # 어댑터 옵션 (캐시 등)
├── postcss.config.mjs         # @tailwindcss/postcss
├── tsconfig.json
└── wrangler.jsonc             # Cloudflare Worker 설정 (vars / secrets)
```

---

## 5. 환경 변수

**런타임 (서버):**
- `NEXT_PUBLIC_SUPABASE_URL` — `https://vmbctjfygimsbirlsaxk.supabase.co` (wrangler.jsonc vars에 박혀 있음)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — `sb_publishable_cFeGnZPq1UJJnInGOPtq_g_PjqQMvWX` (wrangler vars)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — fallback (publishable key가 없을 때)
- `NEXT_PUBLIC_APP_URL` — `https://biomice.xyz` (wrangler vars)
- `SUPABASE_SERVICE_ROLE_KEY` — Cloudflare Secret (`wrangler secret put`)
- `CRAWLER_TOKEN` — Cloudflare Secret (수동 크롤링 인증)
- `RESEND_API_KEY` — Cloudflare Secret (이메일 알림)

**로컬 개발:** 위 값들을 `.env.local`에 같은 이름으로 둔다 (gitignore 됨).

---

## 6. Supabase 스키마

**프로젝트 ID:** `vmbctjfygimsbirlsaxk` (Supabase 대시보드 URL: https://supabase.com/dashboard/project/vmbctjfygimsbirlsaxk)

**테이블:**

| 테이블 | 용도 | 핵심 컬럼 |
|---|---|---|
| `conferences` | 학술대회 | `id`, `kams_id` (UNIQUE), `society_name`, `event_name`, `start_date`, `end_date`, `venue`, `city`, `category`, `detail_url`, `registration_url`, `description`, `is_featured`, `view_count` |
| `societies` | 학회 메타 | `id`, `slug`, `name`, `specialty`, `logo_url`, `home_url`, `description` |
| `banners` | 광고 슬롯 | `id`, `slot_name` (`main_top`/`list_sidebar`/`detail_bottom`), `image_url`, `link_url`, `advertiser_name`, `start_date`, `end_date`, `is_active`, `priority` |
| `bookmarks` | 즐겨찾기 | `user_id`, `conference_id` (UNIQUE 쌍) |
| `users_profile` | 회원 메타 | `id` (= `auth.users.id`), `user_type` (`doctor`/`pharma`/`other`), `specialty`, `organization`, `newsletter_opt_in` |

**자동 생성 타입:** `src/lib/database.types.ts`. 테이블 스키마 변경 시 Supabase CLI로 재생성 필요:
```bash
npx supabase gen types typescript --project-id vmbctjfygimsbirlsaxk > src/lib/database.types.ts
```

---

## 7. 크롤러

- 본체: `src/lib/crawler/kams.ts` (axios + cheerio)
- 호출: `POST /api/crawl` (Bearer `CRAWLER_TOKEN`) 또는 `GET /api/cron`
- 주기 실행: Cloudflare Cron Trigger (현재 wrangler.jsonc에 cron 없음 — 트리거 추가 필요)
- 동작: KAMS 목록(`?code=ws&start_y=YYYY&page=N`) → 상세(`&number=ID&mode=view`) → `kams_id` 기준 upsert
- 학회별 try-catch — 하나 실패해도 다음 진행

---

## 8. 인증 흐름

- Supabase Auth (이메일+비밀번호 + OAuth)
- `src/middleware.ts` — 모든 요청에서 세션 토큰 갱신 (Server Component 동작 필수 조건)
- 페이지: `/login`, `/signup`, `/auth/callback`
- Server Actions: `src/app/actions/` (로그인·로그아웃·회원가입)
- 관리자 판별: 하드코딩 `ADMIN_EMAILS = ["sympotalk@gmail.com"]` (`Header.tsx` 상단)

**보호 라우트:**
- `/mypage` — 비로그인 시 `/login`으로 리다이렉트
- `/admin/*` — 관리자 이메일만 접근

---

## 9. 디자인 시스템

**디자인 토큰:** `src/app/globals.css` `:root`에 모두 정의. 다크모드는 `html[data-theme="dark"]`.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bm-primary` | `#1A6FAA` | 의료계 신뢰감 블루 |
| `--bm-accent` | `#B46A1A` | Featured 앰버 |
| `--bm-success` | `#2E8B57` | 등록 가능 등 |
| `--bm-favorite` | `#E05151` | 즐겨찾기 하트 |
| `--bm-radius-card` | `8px` | 카드 모서리 |
| `--bm-header-h` | `64px` (모바일 56px) | 헤더 높이 |

**폰트:** Pretendard Variable (CDN로드, `layout.tsx` `<head>`에 `<link>`로).

**반응형 브레이크포인트:**
- 데스크톱 ≥1280px (max-width 1280)
- 태블릿 ≤1024px
- 모바일 ≤768px (헤더 56px, 패딩 14px)
- 소형 ≤420px (그리드 1열)

---

## 10. 모바일 반응형 — 핵심 원칙 (★ 매우 중요 ★)

### 사용 금지: `hidden md:flex`, `md:hidden` 등 Tailwind 응답형 유틸리티

**이유:** Tailwind v4가 src 디렉토리 자동 스캔에 의존하는데, 운영 빌드에서 일부 유틸이 누락되어 모바일에서 데스크톱 nav가 그대로 보이는 버그가 있었다 (스크린샷에서 "학 술 대 회"가 세로로 쌓여 보였던 사건).

**대신 항상 사용:** `bm-show-mobile`, `bm-show-mobile-flex`, `bm-show-desktop`, `bm-show-desktop-flex`, `bm-show-desktop-inline` (모두 `globals.css`에 명시 정의됨).

```tsx
// ❌ 절대 사용 금지
<div className="hidden md:flex">...</div>
<div className="md:hidden">...</div>

// ✅ 이렇게 사용
<div className="bm-show-desktop-flex">...</div>
<div className="bm-show-mobile">...</div>
```

### 모든 응답형 패딩/여백은 CSS 클래스로 (인라인 스타일 X)

인라인 `style={{ padding: ... }}`은 미디어 쿼리로 못 덮어씀. 반응형이 필요한 패딩은 `globals.css`의 클래스로:
- `.bm-hero` — 히어로 섹션 패딩
- `.bm-main` — 메인 래퍼 (max-width + padding)
- `.bm-section`, `.bm-section-last` — 섹션 상하 패딩
- `.bm-list-hero` — 목록 페이지 hero bar
- `.bm-detail-grid` — 상세 페이지 2단 그리드 (모바일에서 1단으로)
- `.bm-list-layout` — 목록 페이지 사이드바 + 콘텐츠 (모바일에서 스택)
- `.bm-card-grid` — 학술대회 카드 그리드 (자동 + 768/420 강제 변경)
- `.bm-society-grid` — 학회 카드 그리드
- `.bm-scroll-row` + `.bm-scroll-card` — 가로 스크롤 스트립
- `.bm-header-inner` — 헤더 내부 (높이/패딩 모바일 변경)

### viewport meta tag

`src/app/layout.tsx`의 `<head>`에 반드시 있어야 함:
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```
이게 없으면 모바일 브라우저가 980px 데스크톱 너비로 렌더링해서 모든 미디어 쿼리가 안 걸린다.

### 모바일 네비게이션

`Header.tsx` — 데스크톱은 풀 nav, 모바일은 로고 + 햄버거만. 햄버거 클릭 시 `bm-drawer` 슬라이드 인 (오른쪽에서). 드로어 안에 검색 + 메뉴 + 로그인/회원가입 모두.

### Tailwind Preflight 함정

`<img>` 태그에 `height={28}` HTML 속성을 줘도 Tailwind v4 Preflight가 `img { height: auto }`로 덮어씀. 반드시 인라인 `style={{ height: 28, width: "auto" }}`로 적용.

---

## 11. Phase별 진행 현황

- ✅ **Phase 1 (MVP)** — 학술대회 목록·상세 + 광고 슬롯 + 샘플 데이터
- ✅ **Phase 2** — 회원가입/로그인 + 즐겨찾기 + 마이페이지 + .ics 캘린더
- ✅ **Phase 3B (Email)** — Resend로 D-7 / D-1 알림
- ✅ **Phase 3C** — 학회 프로필 페이지 + 제약사 광고 문의 폼
- ✅ **Phase 3D** — 검색 고도화 (도시 필터, 날짜 범위, 캘린더 뷰)
- 🔄 **Phase 4 (Polish)** — 진행 중
  - ✅ 관리자 대시보드 (배너/학술대회/학회 CRUD)
  - ✅ Sitemap / robots
  - ✅ 학회 로고 (DuckDuckGo favicon fallback + DB `logo_url`)
  - ✅ 인증 페이지 디자인 통일 (`uiux/auth-pages.jsx` 스펙)
  - ✅ BioMICE PNG 로고로 텍스트 로고 전부 교체
  - ✅ 학술대회 상세 페이지 2단 레이아웃 + sticky CTA
  - ✅ 학술대회 목록 사이드바 필터 (`ListSidebar`)
  - ✅ 학회 목록 페이지 카드 그리드 + 탭 필터 (`SocietyList`)
  - ✅ **모바일 완전 재설계** ← 마지막 작업 (이 커밋)

---

## 12. 알려진 제약 / 미해결 항목

### TODO

- [ ] Cloudflare Cron Trigger를 별도 Worker로 추가 (현재 wrangler.jsonc에 cron 설정 없음 — 수동 호출만 가능)
- [ ] 학회 프로필 페이지 디자인 (`/societies/[slug]`) — 기본 형태만 구현됨
- [ ] 제약사 대시보드 (광고 성과 리포트) — Phase 3
- [ ] 지도 뷰 (카카오맵) — Phase 3
- [ ] PWA 매니페스트 추가 (의사들이 홈 화면 추가하도록)
- [ ] `users_profile` 테이블 마이그레이션 — 회원가입 시 자동 INSERT가 잘 되는지 확인 필요
- [ ] 다크모드 토글 UI 미구현 (CSS 토큰은 준비됨)

### 알려진 버그

- 없음 (마지막 모바일 재설계로 해결)

### 의사결정 노트

- **머지 PR 만들지 않음** — 사용자가 명시적으로 "메인에 직접 푸시" 요청. PR 만들 때만 만들 것.
- **Tailwind 유틸리티 회피** — 응답형 클래스(`md:*`)는 운영에서 누락 가능성 있어 모두 `bm-*` 커스텀 클래스로 교체 완료. 새로 추가할 때도 같은 원칙.
- **인라인 스타일 OK** — Next.js Server Components 호환을 위해 인라인 스타일 패턴 유지 (Tailwind utility 의존도 최소화). 단 반응형 동작이 필요한 속성만 CSS 클래스로.
- **도메인** — `biomice.kr`로 시작했다가 `biomice.xyz`로 변경됨 (`4133b3d` 커밋). `metadataBase`가 `layout.tsx`에 `https://biomice.kr`로 남아있을 수 있음 — 확인 필요.

---

## 13. 작업 재개 방법

새 세션에서 시작 시:

```bash
# 1. 최신 main을 받음
cd C:\Users\이경민\source\repos\biomice
git fetch origin main
git checkout main
git pull

# 2. 또는 phase-4-polish 브랜치 계속 사용
git checkout claude/phase-4-polish
git fetch origin main
git rebase origin/main

# 3. 의존성 설치 (lockfile 변경 있을 때만)
npm install

# 4. 로컬 개발
npm run dev   # http://localhost:3000

# 5. 변경 후 푸시 (직접 main으로)
git add <files>
git commit -m "..."
git push origin HEAD:main
```

**자주 쓰는 명령:**
- `npm run build` — 로컬 빌드 검증
- `npm run preview` — Cloudflare Worker 환경 시뮬레이션 로컬 실행
- `npm run deploy` — Cloudflare로 즉시 배포 (보통 GitHub Actions가 함)
- `npm run cf-typegen` — Cloudflare 환경 타입 재생성

---

## 14. 자주 참조하는 외부 링크

- **Live 사이트:** https://biomice.xyz
- **GitHub:** https://github.com/sympotalk/biomice
- **Cloudflare 대시보드:** https://dash.cloudflare.com (Account ID: `f087bbc76f41c6930be82c69f516e3fc`)
- **Supabase 대시보드:** https://supabase.com/dashboard/project/vmbctjfygimsbirlsaxk
- **KAMS (데이터 소스):** https://www.kams.or.kr/bbs/?code=ws
- **레퍼런스 사이트:** https://myfair.co/popular-exhibition/details?category=27
- **Resend 대시보드:** https://resend.com/

---

*PROJECT.md = 비즈니스/제품 정의서. STATE.md(이 문서) = 기술적 현재 상태 + 재개 방법. AGENTS.md = Claude Code 작업 규칙.*
