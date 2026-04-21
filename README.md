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
