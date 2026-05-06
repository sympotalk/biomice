---
description: 긴급 롤백 — 직전 안정 배포로 되돌리기
---

⚠️ **이 명령은 프로덕션 배포를 변경합니다. 신중히 진행.**

## 1. 현재 상태 파악

- `gh run list --branch main --limit 10 --workflow deploy.yml` — 최근 배포 이력
- `git log --oneline -10 origin/main` — 최근 커밋 흐름
- 현재 https://biomice.xyz 의 health check (200/5xx) 확인

## 2. 안정 버전 식별

- 최근 successful deploy 중 시간이 가장 가까운 commit hash 식별
  ```bash
  gh run list --branch main --workflow deploy.yml --status success --limit 5 --json headSha,conclusion,createdAt
  ```
- 문제 발생 직전 커밋을 후보로 제시

## 3. 롤백 계획 출력 (실행 전 사용자 승인)

```
## 🚨 롤백 계획

현재 main HEAD: <current-hash> "<subject>"
문제 발생 시점: <broken-hash> 이후

→ 롤백 대상: <safe-hash> "<subject>" (YYYY-MM-DD)

방식 (택1):
  A. revert  : git revert <broken-hash>..<current-hash> → 새 커밋으로 되돌림 (이력 보존)
  B. tag deploy : <safe-hash>로 git tag → Cloudflare에 직접 배포 (빠르지만 main 미변경)

DB 마이그레이션이 있으면 별도 SQL 롤백 스크립트 필요 — 자동 미수행.

진행 여부: yes/no
```

## 4. 사용자 승인 후 실행

- **방식 A (revert)**:
  ```bash
  git revert --no-edit <broken-hash>..<current-hash>
  git push origin HEAD:main
  ```
  → GitHub Actions가 자동으로 안정 버전 재배포

- **방식 B (직접 배포)**:
  ```bash
  git checkout <safe-hash>
  npm ci && npm run build && npm run deploy
  git checkout -
  ```
  → main HEAD는 그대로, Cloudflare만 옛 버전 실행

## 5. 사후 검증

- `https://biomice.xyz` health check (200 응답)
- 주요 페이지 3개 (`/`, `/conferences`, `/societies`) 로 200 검증
- 사용자에게 "롤백 완료, 영향 페이지 확인 부탁" 보고

## 6. 인시던트 기록

- `docs/incidents/YYYY-MM-DD-HHMM-rollback.md` 파일 생성:
  ```markdown
  # Incident YYYY-MM-DD HH:MM — Rollback

  ## 감지
  - 시점: ...
  - 증상: ...

  ## 원인
  - 문제 커밋: <hash> <subject>
  - 추정 근거: ...

  ## 조치
  - 롤백 방식: revert / direct deploy
  - 롤백 대상: <safe-hash>
  - 실행자: Claude (사용자 승인)

  ## 영향
  - 다운타임: NN초
  - 영향 사용자: 추정 N명

  ## 후속 조치
  - [ ] 문제 커밋 분석 후 재시도 PR 작성
  - [ ] postmortem 회의

  ## 참고
  - GitHub Action: <URL>
  - Cloudflare deployment: <ID>
  ```

## 7. GitHub Issue 자동 생성

```bash
gh issue create \
  --title "🚨 [Incident] Rollback YYYY-MM-DD" \
  --label "incident,priority/p0" \
  --body "$(cat docs/incidents/YYYY-MM-DD-HHMM-rollback.md)"
```

## 8. 보고

```
## ✅ 롤백 완료

이전 HEAD: <broken-hash>
롤백 후 HEAD: <safe-hash>
방식: revert / direct
다운타임: NN초
Health check: all 200 ✅

📝 인시던트 로그: docs/incidents/YYYY-MM-DD-HHMM-rollback.md
🐛 GitHub Issue: #N

다음 단계:
- 문제 커밋 분석 (<broken-hash>)
- 수정 PR 작성 후 재배포
```
