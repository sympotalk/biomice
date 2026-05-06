---
description: 새 세션 시작 — 이전 세션 + git log + ISSUES.md 자동 로드
---

새 Claude Code 세션을 시작합니다. 다음 작업을 순서대로 수행해주세요:

1. **CLAUDE.md 읽기**
   - 루트의 `CLAUDE.md`를 읽고, 현재 프로젝트 상태와 주요 명령어를 파악합니다.

2. **최근 세션 로그 검토**
   - `docs/sessions/` 디렉토리에서 가장 최근 3개 파일을 읽습니다.
   - 마지막 세션에서 진행 중이던 작업과 미해결 TODO를 확인합니다.
   - 디렉토리가 비어있으면 "이전 세션 기록 없음 — 새 프로젝트로 시작" 표시.

3. **미해결 이슈 확인**
   - `docs/ISSUES.md`의 "미해결 (Open)" 섹션을 읽습니다.
   - P0 항목이 있으면 우선 알림.

4. **Git 상태 확인**
   - `git log --oneline -20` 실행 — 최근 커밋 흐름 파악.
   - `git status` 실행 — 작업 디렉토리 상태 확인.
   - 현재 브랜치 + main 대비 commits ahead/behind 확인.

5. **MCP 서버 상태 확인**
   - 연결된 MCP 서버 (Supabase 등) 사용 가능 여부 확인.
   - 실패해도 무시하고 진행.

6. **요약 보고서 출력**
   - 다음 형식으로 한 화면에 요약:
     ```
     ## 컨텍스트 복원 완료

     **프로젝트**: biomice (Next.js 16 + Supabase + Cloudflare Workers)
     **현재 브랜치**: claude/phase-4-polish (origin/main 대비 N commits ahead)
     **마지막 세션**: YYYY-MM-DD-HHMM (요약 1줄)

     ### 이어서 할 작업 후보
     1. [P0] ...
     2. [P1] ...

     ### 최근 5개 커밋
     - hash subject

     ### MCP 상태
     - supabase: ✅ 연결
     ```

요약 후 사용자에게 "어떤 작업부터 시작할까요?" 묻고 대기.
