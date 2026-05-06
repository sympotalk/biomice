---
description: 프리뷰 배포 — 현재 브랜치를 staging URL로 안전 배포
---

현재 브랜치를 프리뷰 환경에 배포합니다 (프로덕션 영향 0).

## 1. 사전 확인

- 현재 브랜치 확인 (`git branch --show-current`)
- main 브랜치면 "프리뷰 대신 `/deploy` 사용 권장" 알림
- 작업 디렉토리 clean인지 확인 (uncommitted 있으면 사용자에게 커밋/스태시 확인)

## 2. 빠른 검증

- `npx tsc --noEmit` (타입 에러 시 중단)
- `npm run lint` (lint 에러 시 사용자 확인 후 진행)

## 3. 프리뷰 빌드

- `npm run preview` 실행 — OpenNext 빌드 + 로컬 시뮬레이터 (`http://localhost:8787`)
- 또는 (Cloudflare에 별도 preview namespace가 있을 경우):
  - `npx wrangler deploy --env=preview` — wrangler.jsonc에 preview 환경 정의되어 있어야 함
  - 현재 프로젝트는 preview env 미정의 → 로컬 시뮬레이터 fallback

## 4. PR과 연결

- 현재 브랜치에 열린 PR 검색: `gh pr list --head <branch>`
- 있으면 PR 코멘트로 프리뷰 URL 추가:
  ```
  gh pr comment <num> --body "🔍 Preview: http://localhost:8787 (local simulator)"
  ```
- 없으면 `docs/sessions/latest-pr-draft.md`에 프리뷰 정보 추가

## 5. 보고

```
## 🔍 프리뷰 빌드 완료

브랜치: <current-branch>
빌드 크기: .next NN MB / .open-next NN KB
프리뷰 URL: http://localhost:8787
PR: #N (코멘트 추가됨)

이 빌드는 production에 영향 없습니다. 검증 완료 후 /deploy 로 main 배포.
```

**프로덕션 배포는 절대 자동으로 진행하지 않습니다** — 사용자가 명시적으로 `/deploy` 호출해야 함.
