# biomice

국내 의학 학술대회 정보의 공식 허브. 대한의학회(KAMS)에 등록된 학술대회를 한 곳에서 검색·관리할 수 있는 플랫폼입니다.

## 스택

- **Next.js 16** (App Router, Turbopack)
- **React 19** + TypeScript
- **Tailwind v4** + CSS 변수 기반 디자인 토큰
- **Supabase** (PostgreSQL + Auth + RLS)
- **cheerio + axios** KAMS 크롤러

## 로컬 개발

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 설정
cp .env.local.example .env.local
# .env.local 에 Supabase 키와 CRAWLER_TOKEN, SUPABASE_SERVICE_ROLE_KEY 입력

# 3) dev 서버 실행
npm run dev
# → http://localhost:3000
```

주요 페이지

- `/` — 메인 (Hero + Featured + 이번 주 + 다가오는)
- `/conferences` — 전체 목록 (q / category / view / page 쿼리 지원)
- `/conferences/[id]` — 상세 페이지 + 사전등록 외부 링크
- `/login`, `/signup` — Supabase Auth

## KAMS 크롤러

```bash
# 수동 실행 (Bearer 인증 필요)
curl -X POST "http://localhost:3000/api/crawl?year=2026&maxPages=5" \
  -H "Authorization: Bearer $CRAWLER_TOKEN"
```

운영에서는 Cloudflare Cron Trigger나 Supabase Edge Function cron으로 매일 새벽 3시에 호출.

## 디렉토리 구조

```
src/
├── app/                    # App Router
│   ├── page.tsx            # 메인
│   ├── conferences/        # 목록 + 상세
│   ├── login/ signup/      # 인증
│   └── api/crawl/          # KAMS 크롤러 엔드포인트
├── components/
│   ├── ui/                 # Button, Card, Badge, ... (디자인 시스템)
│   ├── layout/             # Header, Footer
│   ├── home/               # 메인 페이지 섹션
│   ├── conferences/        # 필터·페이지네이션 클라이언트
│   └── auth/               # AuthCard
├── lib/
│   ├── supabase/           # browser / server / admin 클라이언트
│   ├── crawler/            # KAMS 크롤러
│   ├── queries.ts          # 공용 DB 조회
│   ├── dates.ts            # D-Day 계산 헬퍼
│   └── tokens.ts           # 디자인 토큰 (TS)
└── middleware.ts           # Supabase 세션 갱신
```

## 배포

Cloudflare Workers + OpenNext로 배포합니다. 상세 절차는 [`docs/DEPLOY.md`](./docs/DEPLOY.md) 참조.

```bash
# WSL/Linux/macOS 에서
wrangler login
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put CRAWLER_TOKEN
wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run deploy
```

## 참고

전체 제품 기획·로드맵·수익 모델은 [`PROJECT.md`](./PROJECT.md) 참조.

기술 현재 상태와 재개 절차는 [`STATE.md`](./STATE.md) 참조.

---

## Claude Code 사용 가이드

이 프로젝트는 [Claude Code](https://claude.com/claude-code) 자동화 환경이 구축되어 있습니다.

### 새 세션 시작 시

```
/init-context
```

→ `CLAUDE.md`, 최근 3개 세션 로그, `docs/ISSUES.md`, git log를 자동으로 로드해 컨텍스트를 복원합니다.

### 사용 가능한 슬래시 커맨드

| 명령 | 설명 |
|---|---|
| `/init-context` | 새 세션 시작 — 이전 컨텍스트 + git log + 미해결 이슈 자동 로드 |
| `/save-session` | 작업 내용을 `docs/sessions/`에 문서화 + `CHANGELOG.md` / `ISSUES.md` 갱신 |
| `/sync-github` | Conventional Commits 형식으로 커밋 + 푸시 + GitHub Issue 등록 + PR 초안 |
| `/quick-save` | `save-session` + `sync-github` 한 번에 (세션 종료 시 표준) |
| `/deploy` | 안전한 프로덕션 배포 (검증 → 빌드 → 마이그레이션 → 배포 → health check) |
| `/deploy-preview` | 프리뷰 배포 (프로덕션 영향 0, PR 코멘트 자동 추가) |
| `/rollback` | 긴급 롤백 (직전 안정 버전 식별 → 사용자 승인 후 실행 → 인시던트 기록) |

각 커맨드의 상세 절차는 `.claude/commands/<command>.md` 파일 참조.

### 권한 정책 (`.claude/settings.json`)

- **자동 허용**: git/gh/npm/node 표준 명령, 파일 읽기, src/docs/.claude/.github 쓰기
- **사용자 승인 필요**: `git push --force`, `git reset --hard`, `npm run deploy`, `wrangler deploy`
- **자동 거부**: `rm -rf /`, `sudo`, `curl|sh`, `.env*` 읽기/쓰기, `secrets/` 접근

### 문서 구조

```
docs/
├── DEPLOY.md           # 배포 절차
├── ISSUES.md           # 미해결 이슈 트래커 (P0/P1/P2)
├── CHANGELOG.md        # Keep a Changelog 형식
├── sessions/           # YYYY-MM-DD-HHMM-session.md (작업 로그)
├── deployments/        # YYYY-MM-DD-HHMM-prod.md (배포 기록)
└── incidents/          # YYYY-MM-DD-HHMM-rollback.md (장애 기록)
```

### 첫 사용

1. `/init-context`로 컨텍스트 로드
2. 첫 작업 후 `/quick-save`로 저장 테스트
3. 필요 시 `.claude/settings.json` 추가 커스터마이징

