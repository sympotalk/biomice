---
description: save-session + sync-github 한 번에 실행 — 세션 종료 시 표준 절차
---

이 세션을 깔끔하게 마무리합니다. 다음을 순차 실행:

1. **`/save-session` 본체 실행**
   - `docs/sessions/YYYY-MM-DD-HHMM-session.md` 생성
   - `CLAUDE.md` "최근 변경사항" 갱신 (5개 유지)
   - `docs/CHANGELOG.md` `[Unreleased]` 섹션 갱신
   - `docs/ISSUES.md` 신규 이슈 추가 / 해결된 이슈 이동

2. **`/sync-github` 본체 실행**
   - 변경 파일 git add (단, 위 1번 단계의 docs/ 파일들 포함)
   - Conventional Commits 형식으로 커밋 (Co-Authored-By 자동 추가)
   - `git fetch origin main && git rebase origin/main`
   - 사용자 지시에 따라 `git push origin HEAD:main` 또는 `git push origin HEAD`
   - 신규 P0 이슈 GitHub Issue 등록
   - 필요시 PR 초안 파일 갱신

3. **종합 보고**
   ```
   ## ✅ 세션 저장 완료

   📄 세션 로그: docs/sessions/YYYY-MM-DD-HHMM-session.md
   📝 변경 추적: CHANGELOG.md / ISSUES.md / CLAUDE.md
   📦 커밋: <hash> <subject>
   🚀 푸시: origin/main (배포 트리거 됨)
   🔗 GitHub Actions: <URL>
   📋 다음 세션 준비: /init-context
   ```

**주의 사항**:
- 변경사항이 없으면 1번만 실행하고 2번은 skip
- rebase 충돌 시 자동 진행 중단 — 사용자에게 수동 해결 요청
- 빌드 실패가 예상되는 변경 (ts/eslint 에러 등)이면 푸시 전 `npx tsc --noEmit && npm run lint` 자동 실행
