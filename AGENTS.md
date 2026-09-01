<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment

This repo auto-deploys to Vercel from `master`. **Always commit and push changes to `origin/master` after completing a task, unless the user explicitly says not to.** Use a clear commit message describing the change. Don't ask for permission to commit/push — just do it as the final step of every task.

## Staging rules

- **Never run `git add -A` or `git add .`** — they will sweep up unrelated work-in-progress files the user has open locally.
- Always run `git status` first to see what's modified, then `git add <specific paths>` for the files you actually changed in this turn.
- If `git status` shows files you didn't touch, ask the user before including them. They are likely WIP the user wasn't ready to ship.
