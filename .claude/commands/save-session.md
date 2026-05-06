---
description: 세션 종료 — 작업 내용을 docs/sessions/에 문서화 + CLAUDE.md/CHANGELOG.md/ISSUES.md 갱신
---

이 세션에서 진행한 작업을 문서화합니다. 다음을 순서대로 수행:

1. **세션 로그 파일 생성**
   - 파일명: `docs/sessions/YYYY-MM-DD-HHMM-session.md` (KST 기준, `date +%Y-%m-%d-%H%M` 활용)
   - 다음 형식으로 작성:
     ```markdown
     # Session YYYY-MM-DD HH:MM

     ## 작업 목표
     - (사용자가 이 세션에서 시킨 일 요약 1-3줄)

     ## 변경 파일
     - `path/to/file.tsx` — 변경 내용 요약
     - ...

     ## 주요 결정
     - (아키텍처/디자인 차원 결정사항)

     ## 에러 및 해결
     - 에러 메시지 / 원인 / 해결 절차

     ## 테스트 결과
     - `npm run lint` 결과
     - `npx tsc --noEmit` 결과
     - (필요시) `npm run build` 결과

     ## 커밋 / 배포
     - `<hash>` <subject>
     - 배포: success / failure / skip

     ## TODO (다음 세션)
     - [ ] ...
     ```

2. **CLAUDE.md "최근 변경사항" 섹션 갱신**
   - 이번 세션의 커밋 1-2개를 맨 위에 추가.
   - 6번째 항목부터 잘라내 5개만 유지.
   - 형식: `- **YYYY-MM-DD** · \`hash\` <subject>`

3. **docs/CHANGELOG.md 갱신**
   - `## [Unreleased]` 섹션에 변경사항 추가.
   - 분류: Added / Changed / Fixed / Removed / Deprecated / Security 중 적절한 곳.

4. **docs/ISSUES.md 갱신**
   - 이 세션에서 새로 발견한 이슈가 있으면 "미해결" 섹션 P0/P1/P2 적절한 곳에 추가.
   - 이 세션에서 해결한 이슈가 있으면 "미해결"에서 빼고 "해결됨"으로 이동 (커밋 hash 명시).

5. **요약 보고**
   - 생성된 세션 로그 파일 경로
   - CLAUDE.md / CHANGELOG.md / ISSUES.md 갱신 여부
   - 다음 추천 액션 (`/sync-github` 등)

**주의**: 이 명령은 GitHub 푸시를 하지 않습니다. 푸시까지 한 번에 하려면 `/quick-save` 사용.
