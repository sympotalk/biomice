---
description: GitHub 동기화 — 커밋 + 푸시 + 미해결 이슈 등록 + PR 초안 생성
---

GitHub과 동기화합니다. 다음을 순서대로:

1. **사전 검증**
   - `git status` — 변경 파일 확인
   - `git diff --stat` — 변경 규모 확인
   - 비어있으면 "변경사항 없음" 출력 후 종료

2. **의미있는 단위로 커밋**
   - 변경사항이 여러 영역(예: components/ + lib/ + docs/)이면 분할 커밋 고려
   - **Conventional Commits 형식**: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, `refactor: ...`
   - 커밋 메시지 마지막 줄에 항상 추가:
     ```
     Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
     ```
   - HEREDOC으로 multi-line message 작성:
     ```bash
     git commit -m "$(cat <<'EOF'
     feat: 기능 한 줄 요약

     - 변경사항 1
     - 변경사항 2

     Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
     EOF
     )"
     ```

3. **원격 동기화**
   - `git fetch origin main`
   - `git rebase origin/main` — 충돌 시 사용자에게 안내 후 중단
   - 사용자가 명시적으로 "메인 직접 푸시" 요청한 경우: `git push origin HEAD:main`
   - 그 외: `git push origin HEAD` (현재 브랜치)

4. **미해결 이슈 GitHub 등록**
   - `docs/ISSUES.md`의 "미해결" P0 항목 중 GitHub Issue로 등록 안 된 것을 추적
   - `gh issue list --state open` 으로 기존 이슈 확인
   - 없으면 `gh issue create --title "[P0] ..." --label "priority/p0,bug" --body "..."` 로 생성
   - 라벨 자동 지정 — `priority/p0`, `priority/p1`, `priority/p2` + 영역별 (`bug`, `enhancement`, `crawler`, `ui` 등)

5. **PR 초안 생성** (현재 브랜치가 main이 아닐 때만)
   - `docs/sessions/latest-pr-draft.md` 파일 생성/덮어쓰기
   - 다음 내용:
     ```markdown
     # PR Draft — <branch>

     ## Summary
     - 1-3 bullet points

     ## Test plan
     - [ ] ...

     ## Related issues
     - #N

     🤖 Generated with [Claude Code](https://claude.com/claude-code)
     ```
   - 사용자가 명시적으로 PR 생성 요청 시 `gh pr create`로 실제 PR 생성

6. **요약 보고**
   - 푸시한 커밋 hash 목록
   - 등록한 이슈 번호
   - PR 초안 파일 경로 (해당 시)
   - GitHub Actions 빌드 URL (`gh run list --limit 1`)

**보안**: 커밋 메시지에 토큰/API 키 포함 여부 자동 검사. `secret`, `token`, `api[_-]?key`, `password` 등의 단어가 값과 함께 나타나면 경고하고 사용자 확인 요청.
