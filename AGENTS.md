<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project state — read this first

**Read `STATE.md` at the repo root.** It is the single source of truth for:
- Infrastructure (GitHub, Cloudflare, Supabase, Resend) and how they connect
- Environment variables and secrets
- Database schema and Supabase project ID
- Branch strategy (push directly to `main` — no PRs unless asked)
- Mobile responsive rules (★ never use `hidden md:flex` — always use `bm-show-*` custom classes)
- Phase progress and known TODOs
- How to resume work in a new session

Also useful:
- `PROJECT.md` — business/product definition
- `src/app/globals.css` — all design tokens + responsive CSS classes
