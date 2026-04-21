# biomice · Cloudflare 배포 가이드

Next.js 16 앱을 Cloudflare Workers(OpenNext 어댑터)로 배포하고, KAMS 크롤러를 Cloudflare Cron Trigger로 매일 돌리는 절차입니다.

- **메인 앱**: `biomice` Worker — SSR 페이지 + API 라우트
- **크롤러 Cron**: `biomice-cron` Worker — 매일 KST 03:00에 `biomice`의 `/api/cron`을 호출
- **DB/Auth**: Supabase (이미 구성됨)

---

## 아키텍처 한눈에

```
  ┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
  │ biomice-cron │──fetch─▶│ biomice (Worker) │──HTTP──▶│ Supabase PG  │
  │  (CF Cron)   │         │  Next.js + SSR   │         │  + Auth      │
  └──────────────┘         └──────────────────┘         └──────────────┘
      매일 03시 KST           /api/cron, /api/crawl      kams crawler upsert
```

OpenNext가 `fetch` 핸들러만 export 하기 때문에 cron은 같은 Worker에 둘 수 없습니다. 대신 `workers/cron.ts`라는 작은 Worker가 메인 앱을 HTTP로 호출합니다.

---

## 0. 사전 준비 (한 번만)

1. **Cloudflare 계정**: https://dash.cloudflare.com/sign-up
2. **도메인 연결** (선택이지만 권장):
   - Workers는 기본으로 `biomice.<계정명>.workers.dev` 서브도메인 제공
   - 커스텀 도메인이 필요하면 Cloudflare에 도메인 등록하거나 네임서버 위임
3. **WSL 또는 Linux/macOS 환경**: OpenNext는 Windows 네이티브를 지원하지 않음. CI에서 빌드하거나 로컬에서는 WSL 사용.

---

## 1. wrangler 로그인

로컬에서 한 번 실행해 OAuth 인증:

```bash
# WSL 또는 macOS/Linux 터미널
npx wrangler login
```

브라우저가 열리고 권한 승인하면 `~/.wrangler/config` 에 인증 토큰이 저장됩니다.

---

## 2. 시크릿(Secrets) 주입

민감한 값은 `wrangler.jsonc`의 `vars`에 두지 말고 `wrangler secret put`으로 넣습니다:

```bash
# 메인 biomice Worker에 주입
wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
# 프롬프트에 붙여넣기:
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...service_role...

wrangler secret put CRAWLER_TOKEN
# a0f80691d624d02cfcc55f0ed9c245ecdff9a5898ae4c20ba2c51e62f4e28b9e
```

> **공개해도 되는 값**은 `wrangler.jsonc`의 `vars`에 이미 들어있습니다: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

### 시크릿 확인/삭제

```bash
wrangler secret list
wrangler secret delete NAME
```

---

## 3. 메인 앱 배포

```bash
# 깨끗한 빌드 + 배포 (package.json 스크립트)
npm run deploy
```

내부적으로:
1. `opennextjs-cloudflare build` → `.open-next/` 번들 생성
2. `opennextjs-cloudflare deploy` → `wrangler deploy` 래핑

배포가 성공하면 출력에 URL이 나옵니다:
```
Published biomice (1.2 MiB)
  https://biomice.<계정명>.workers.dev
```

### 프리뷰 (배포 없이 로컬 시뮬레이션)

```bash
npm run preview
# → http://localhost:8787 에서 Workers runtime으로 실제 앱 구동
```

---

## 4. 커스텀 도메인 연결 (예: biomice.kr)

### 방법 A — Cloudflare에 도메인이 이미 있는 경우

1. Cloudflare Dashboard → **Workers & Pages** → `biomice` Worker 선택
2. **Settings → Triggers → Custom Domains → Add Custom Domain**
3. `biomice.kr` 또는 `www.biomice.kr` 입력 → Cloudflare가 자동으로 DNS 레코드 생성

### 방법 B — 도메인이 외부에 있는 경우

1. Cloudflare에 도메인 추가: **Websites → Add a Site**
2. 네임서버를 도메인 등록업체(가비아/후이즈/GoDaddy 등)에서 Cloudflare가 알려준 ns로 변경
3. 전파(최대 24시간) 후 Worker에 Custom Domain 추가

---

## 5. Supabase Auth Redirect URL 업데이트

도메인이 확정되면 Supabase 이메일 확인·비밀번호 재설정 링크가 올바른 도메인을 가리키도록 설정:

Supabase Dashboard → **Authentication → URL Configuration**
- **Site URL**: `https://biomice.kr`
- **Redirect URLs**: `https://biomice.kr/**`, `https://biomice.<계정명>.workers.dev/**`

이게 안 되어 있으면 이메일 링크 클릭 시 `http://localhost:3000`으로 리다이렉트될 수 있습니다.

---

## 6. 크롤러 Cron Worker 배포

`workers/` 폴더에 있는 별도 Worker를 배포합니다.

```bash
cd workers

# 1) 먼저 메인 Worker의 URL 확인 후 wrangler.cron.jsonc의 BIOMICE_ORIGIN 업데이트
#    (기본값은 https://biomice.kr — 커스텀 도메인 없으면 workers.dev URL 로 변경)

# 2) 시크릿 주입
wrangler secret put CRAWLER_TOKEN --config wrangler.cron.jsonc
# (메인 앱과 동일한 값)

# 3) 배포
wrangler deploy --config wrangler.cron.jsonc
```

### Cron 스케줄 수동 실행 (테스트)

```bash
wrangler dev --config workers/wrangler.cron.jsonc --test-scheduled
# 다른 터미널에서:
curl "http://localhost:8787/__scheduled?cron=0+18+*+*+*"
```

### 로그 확인

```bash
wrangler tail biomice-cron
```

또는 Cloudflare Dashboard → Workers → `biomice-cron` → **Logs** 에서 실시간 확인.

---

## 7. CI/CD: GitHub Actions로 자동 배포 (선택)

`main` 브랜치에 push할 때마다 자동 배포하려면 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

GitHub Repo → **Settings → Secrets → Actions** 에 두 값을 등록:
- `CLOUDFLARE_API_TOKEN`: Cloudflare Dashboard → My Profile → API Tokens → `Edit Cloudflare Workers` 템플릿으로 발급
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Dashboard 오른쪽 사이드바에 표시되는 Account ID

---

## 8. 운영 중 확인 체크리스트

배포 직후:

- [ ] `https://<도메인>/` 메인 페이지 렌더링
- [ ] `/conferences?q=내과` 검색 동작
- [ ] `/conferences/1` 상세 페이지
- [ ] `/signup` 가입 후 `/` 에서 Header에 UserMenu 노출
- [ ] `curl -H "Authorization: Bearer $CRAWLER_TOKEN" https://<도메인>/api/crawl?maxPages=2` 크롤러 200 응답
- [ ] Cron Worker 로그에서 다음 KST 03:00에 스케줄 실행 확인

---

## 9. 알려진 제약 / 주의사항

| 이슈 | 대응 |
|---|---|
| Windows 네이티브 `npm run deploy` 실패 | WSL 또는 CI에서 빌드. 기본 개발·테스트는 `next dev`로 충분. |
| Workers CPU 시간 제한 | Free: 10ms, Paid: 30초(번들 실행). `/api/crawl`은 `fetchDetailPages=true`일 때 1분+ 걸릴 수 있으므로 유료 플랜 권장. |
| Middleware Node.js API 미지원 | `nodejs_compat` 플래그가 켜져있어 대부분 OK. 단, `fs` 등 파일시스템 접근은 불가. |
| Next.js ISR 캐시 | 기본은 메모리 — Worker 인스턴스 간 공유 안 됨. 필요하면 `open-next.config.ts`에 `incrementalCache: kvIncrementalCache` 추가 + KV 바인딩 설정. |
| KAMS IP 차단 우려 | Workers 요청은 CF IP에서 나감. 동일 IP 대역에서 너무 자주 요청하면 차단될 수 있음 — cron 주기를 하루 1회로 유지. |

---

## 10. 비용 추정 (2026년 기준)

| 플랜 | 비용 | 포함 | biomice에 적합? |
|---|---|---|---|
| Workers Free | $0 | 100k req/day, CPU 10ms | MVP 트래픽 감당 가능. 크롤러가 10ms 넘으면 unbound 필요 |
| Workers Paid | $5/월 | 10M req/월, CPU 30s | **권장** — 크롤러 상세수집 여유 + 안정성 |
| R2 Object Storage | $0.015/GB | ISR 캐시 저장용 | 트래픽 10만/월 넘을 때 |

---

## 부록: 로컬 개발 루프

WSL 기준:

```bash
# 1) Next.js dev (포트 3000)
npm run dev

# 2) Workers runtime으로 로컬 프리뷰 (포트 8787)
npm run preview

# 3) 원격 리소스와 연결된 프리뷰 (실제 secrets 사용)
wrangler dev --remote
```
