# Claude Code — biomice

> 새 세션에서는 먼저 `/init-context`를 실행해 컨텍스트를 복원하세요.

## 1. 프로젝트 개요

**biomice (바이오마이스)** — 국내 의학 학술대회 정보를 모은 플랫폼.
대한의학회(KAMS) 데이터를 매일 크롤링해 의사·제약사 직원에게 제공하고,
Featured 슬롯과 배너로 광고 수익을 낸다.

- 운영 도메인: https://biomice.xyz
- 레퍼런스: https://myfair.co
- 비즈니스 정의서: [`PROJECT.md`](./PROJECT.md)
- 기술 현재 상태: [`STATE.md`](./STATE.md)
- legacy 작업 규칙: [`AGENTS.md`](./AGENTS.md)

## 2. 기술 스택 및 아키텍처

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16.2.4 (App Router) + React 19.2.4 |
| 언어 | TypeScript 5 (strict) |
| 스타일 | Tailwind v4 (`@import "tailwindcss"`, no config file) |
| DB / Auth | Supabase (PostgreSQL, SSR cookies) |
| 배포 | Cloudflare Workers via OpenNext.js Cloudflare 1.19.3 |
| Email | Resend |
| 크롤러 | axios + cheerio (KAMS 국내 + 11개 국제 어댑터) |
| 빌드 | wrangler 4.84 |
| Node | 22 (GitHub Actions 명시) |

## 3. 외부 서비스

- **GitHub**: [`sympotalk/biomice`](https://github.com/sympotalk/biomice)
  - 작업 브랜치: `claude/phase-4-polish` → `git push origin HEAD:main` 직접 푸시
- **Cloudflare Workers**: 워커 이름 `biomice`, Account ID는 GitHub Secrets로 관리
- **Supabase**: 프로젝트 `vmbctjfygimsbirlsaxk`
- **Resend**: D-7 / D-1 알림 이메일

MCP 연결 (Claude Code agent용):
- `supabase` — 스키마 변경, SQL 실행, 타입 생성

## 4. 환경변수 (`.env.local.example` 기반)

> 변수명만. 실제 값은 `.env.local` (gitignore) 또는 Cloudflare Worker Secret으로 관리.

```
NEXT_PUBLIC_SUPABASE_URL              # 빌드 포함 (공개)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  # 빌드 포함 (공개)
NEXT_PUBLIC_SUPABASE_ANON_KEY         # legacy fallback
NEXT_PUBLIC_APP_URL                   # 빌드 포함 (공개)
SUPABASE_SERVICE_ROLE_KEY             # 서버 전용
CRAWLER_TOKEN                         # 서버 전용 (Cron Trigger 인증)
RESEND_API_KEY                        # 서버 전용
ADMIN_EMAILS                          # 하드코딩 (Header.tsx)
```

## 5. 디렉토리 구조

```
biomice/
├── .claude/
│   ├── agents/            # 서브 에이전트 정의
│   │   ├── claude-md-curator.md  # CLAUDE.md 자동 정리
│   │   └── git-historian.md      # Git 이력 조회
│   ├── commands/          # 슬래시 커맨드 정의
│   ├── settings.json      # 권한 + 훅 (커밋됨)
│   └── settings.local.json  # 로컬 사용자 권한 (gitignore)
├── .github/workflows/
│   ├── ci.yml             # PR/push 시 lint + type-check + build
│   └── deploy.yml         # main 푸시 시 Cloudflare 배포
├── docs/
│   ├── DEPLOY.md
│   ├── ISSUES.md          # 미해결 이슈 트래킹
│   ├── CHANGELOG.md       # Keep a Changelog 형식
│   ├── sessions/          # YYYY-MM-DD-HHMM-session.md
│   ├── deployments/       # 배포 기록
│   └── incidents/         # 롤백 / 장애 기록
├── src/
│   ├── app/               # Next.js App Router (페이지 + API + admin)
│   ├── components/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── crawler/
│   │   │   ├── kams.ts
│   │   │   └── intl/      # 11개 국제 학술대회 어댑터
│   │   ├── queries.ts
│   │   ├── society.ts
│   │   └── database.types.ts
│   └── middleware.ts
├── public/
├── AGENTS.md              # Claude 작업 지침 (legacy 한 줄)
├── PROJECT.md             # 비즈니스/제품 정의서
├── STATE.md               # 기술 현재 상태 + 재개 절차
├── README.md
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── wrangler.jsonc         # Cloudflare Worker + Cron Trigger
├── open-next.config.ts
└── postcss.config.mjs
```

## 6. 주요 명령어 (`package.json` scripts)

```bash
npm run dev          # http://localhost:3000 로컬 개발
npm run build        # Next.js 프로덕션 빌드 (검증용)
npm run start        # 프로덕션 모드 로컬 실행
npm run lint         # ESLint
npm run preview      # OpenNext 빌드 + Cloudflare 시뮬레이터 로컬 실행
npm run deploy       # Cloudflare Workers 배포 (CI에서 호출)
npm run cf-typegen   # Cloudflare 환경 타입 재생성
```

## 7. 코딩 컨벤션

- ESLint flat config (`eslint.config.mjs`) + `eslint-config-next` (core-web-vitals + typescript)
- TypeScript **strict** (tsconfig 기본값)
- Prettier 사용 안 함 (감지 안 됨)
- Tailwind v4 — **응답형 유틸리티 (`md:flex`, `md:hidden` 등) 사용 금지**.
  운영 빌드에서 누락된 사례 있어 모두 `bm-show-mobile` / `bm-show-desktop`
  커스텀 클래스로 통일됨 (자세한 규칙은 [`STATE.md`](./STATE.md))
- 컴포넌트 스타일: 인라인 `style={...}` 또는 `globals.css`의 `bm-*` 클래스
- 커밋 메시지: **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`)
- 자동 커밋 마지막 줄: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

## 8. 최근 변경사항 (최근 5개)

> `/save-session` 또는 `/quick-save` 실행 시 자동 갱신.

- **2026-04-29** · `9e9a9b9` fix(deploy): cron string + admin session 기반 크롤러 트리거
- **2026-04-28** · `49365c3` fix(admin): CRAWLER_TOKEN 진단 메시지 + localStorage 저장
- **2026-04-28** · `315f7d9` feat(crawler): KAMS 인정 어댑터 + 범용 어그리게이터 + 인라인 에디터
- **2026-04-27** · `b9a20ed` feat: 국제 학술대회 크롤러 어댑터 7개 추가 + admin 트리거 UI
- **2026-04-27** · `8bd2b77` feat: 국제 학술대회 헤더/페이지/크롤러 인프라 + CME 평점

## 9. 알려진 이슈

> 자세한 목록과 해결 절차는 [`docs/ISSUES.md`](./docs/ISSUES.md).

- KAMS 인정 어댑터 selector 미검증 — 실제 게시판 HTML 구조 매칭 후 튜닝 필요
- `metadataBase` (`src/app/layout.tsx`)에 `https://biomice.kr` 잔존 — `https://biomice.xyz`로 정합성 확인
- 학회 self-edit 권한 미구현 (Phase 3+ 예정)

---

## 🤖 모델 사용 전략

| 작업 유형 | 모델 | 이유 |
|---|---|---|
| 일반 코딩 / 컴포넌트 수정 / 버그픽스 | **Sonnet (기본)** | 속도↑ 비용↓, 대부분의 작업 커버 |
| 복잡한 아키텍처 설계 / 난이도 높은 디버깅 / 새 기능 설계 | **Opus** | 추론 깊이 필요 시 |
| 빠른 조회 / 단순 텍스트 / 형식 변환 | **Haiku** | 초경량 단순 작업 |

> **기본값 항상 Sonnet.** Opus는 명시적으로 필요할 때만.  
> 자동 모드에서는: 새 기능 설계·난해한 버그·리팩터링 계획 → Opus, 그 외 → Sonnet.

환경 변수 (불필요한 모델 호출 제한):
```bash
export DISABLE_NON_ESSENTIAL_MODEL_CALLS=1
```

---

## 🔍 에이전트 활용

### Git 이력 조회 → `@agent-git-historian`
```
@agent-git-historian 지난주 변경사항 요약해줘
@agent-git-historian main에 머지된 최근 커밋 목록 보여줘
@agent-git-historian src/lib/crawler/kams.ts 변경 이력 추적해줘
```

### CLAUDE.md 정리 → `@agent-claude-md-curator`
다음 조건 충족 시 호출:
- 변경 이력 **20줄 초과** / 파일 **150줄 초과** / 3개월 이상 이력 누적
```
@agent-claude-md-curator 이 CLAUDE.md를 정리해줘
```

---

## 📋 세션 흐름

```
세션 시작
  └─ /init-context  (이전 세션 + git log + ISSUES.md 자동 로드)
  └─ 새 주제면 /clear, 이어가면 바로 시작

작업 중
  └─ Plan Mode로 계획 먼저 검토
  └─ Git 조회 필요 → @agent-git-historian
  └─ 토큰 80% → /compact (중요 맥락 보존)

작업 완료
  └─ /quick-save  (/save-session + /sync-github)
  └─ 다음 작업과 무관하면 /clear
  └─ CLAUDE.md 20줄+ 이력 → @agent-claude-md-curator
```

---

## 🚫 .claudeignore 권장 패턴
```
node_modules/
dist/
.next/
.open-next/
*.log
*.lock
coverage/
.env*
```

---

## Claude Code 사용 규칙

1. **새 세션 시작** → `/init-context` (이전 세션 + git log + ISSUES.md 자동 로드)
2. **작업 마무리** → `/quick-save` (`/save-session` + `/sync-github` 한 번에)
3. **배포** → `/deploy` (live) 또는 `/deploy-preview` (안전)
4. **긴급 롤백** → `/rollback`
5. **민감정보 절대 기록 금지** — API 키 / 토큰 / 비밀번호는 Cloudflare Secret 또는 `.env.local`만
6. **Tailwind `md:*` 사용 금지** — `bm-show-mobile` / `bm-show-desktop` 커스텀 클래스만
7. **메인 푸시 직접** — 사용자 명시 요청 시 PR 만들지 말고 `git push origin HEAD:main`
