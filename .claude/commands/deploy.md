---
description: 안전한 프로덕션 배포 — 검증 → 빌드 → 마이그레이션 → 배포 → health check
---

biomice를 프로덕션(Cloudflare Workers)에 배포합니다. 각 단계를 순서대로:

## 1. 사전 검증

- `git status` — 작업 디렉토리 clean인지 확인 (uncommitted 파일 있으면 중단)
- 현재 브랜치 확인 — main이 아니면 사용자에게 "main이 아닌데 배포할까요?" 묻기
- `git fetch origin main && git log HEAD..origin/main --oneline` — origin/main에 새 커밋이 있는지
- `npm run lint` — ESLint 통과 확인
- `npx tsc --noEmit` — TypeScript 타입 검사 통과 확인
- 실패 시 즉시 중단

## 2. 빌드 검증

- `npm run build` — Next.js 빌드
- 결과물 크기 비교: `du -sh .next` (이전 빌드와 비교 — 30%+ 증가 시 경고)
- 실패 시 중단

## 3. 환경변수 검증

- `.env.local.example`의 모든 변수가 Cloudflare Worker에 등록되어 있는지 확인
- `npx wrangler secret list` 실행 (가능 시) — 누락 시 사용자 알림
- 필수 secrets:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CRAWLER_TOKEN`
  - `RESEND_API_KEY`

## 4. DB 마이그레이션 (Supabase)

- 최근 커밋에 DB 스키마 변경(`ALTER TABLE`, `CREATE TABLE`)이 있는지 검출
- 있으면 사용자에게 SQL 명세 표시 + **승인 요청**
- 승인 시 Supabase MCP `apply_migration` 실행
- `npx supabase gen types typescript ...` → `src/lib/database.types.ts` 갱신

## 5. 배포 실행

- 배포 방식: GitHub Actions 자동 트리거 (`.github/workflows/deploy.yml`)
- 또는 직접 `npm run deploy` (사용자 명시 요청 시만)
- `git push origin HEAD:main`로 자동 트리거
- `gh run watch` 또는 `gh run list --limit 1` 로 진행 상황 추적
- 배포 실패 시 즉시 알림

## 6. 배포 후 검증 (Health Check)

- `https://biomice.xyz` GET → 200 응답 + `<title>` 포함 확인
- `https://biomice.xyz/conferences` GET → 200 응답
- `https://biomice.xyz/api/cron/intl?token=...` GET → `unauthorized` 응답 (인증 정상)
- 한 페이지라도 5xx면 즉시 사용자에게 알림 + 롤백 옵션 제시

## 7. 배포 기록

- `docs/deployments/YYYY-MM-DD-HHMM-prod.md` 파일 생성:
  ```markdown
  # Deploy YYYY-MM-DD HH:MM (production)

  ## 커밋
  - <hash> <subject>

  ## 변경 영역
  - ...

  ## 마이그레이션
  - 실행 / skip

  ## 빌드 크기
  - .next: NN MB
  - .open-next/worker.js: NN KB

  ## Health check
  - / 200 ✅
  - /conferences 200 ✅
  - /api/cron/intl 401 ✅ (정상 인증)

  ## GitHub Actions
  - URL: ...

  ## Cloudflare Deployment
  - ID: ...
  ```

- Git tag 생성: `git tag -a v<MAJOR.MINOR.PATCH>-YYYYMMDD -m "deploy"` (사용자 확인 후)
- GitHub Release 생성: `gh release create ...` (CHANGELOG의 `[Unreleased]` 섹션을 release notes로 사용)

## 8. 종합 보고

```
## 🚀 배포 완료

✅ 빌드: success (size: NN MB → NN MB, +N%)
✅ 마이그레이션: applied / skipped
✅ Cloudflare 배포: <deployment-id>
✅ Health check: all 200

📝 배포 로그: docs/deployments/YYYY-MM-DD-HHMM-prod.md
🏷️  Git tag: v<X.Y.Z>-YYYYMMDD
🔗 GitHub Release: <URL>
🌐 Live: https://biomice.xyz
```

**롤백이 필요하면 `/rollback` 즉시 실행**.
