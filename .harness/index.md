# Harness Index

This is the AI development harness entry for this blog writing and publishing
repository.

## Read Order

1. Read the root agent entry file.
2. Read this file.
3. Use `.harness/catalog.md` to route the task.
4. Read relevant `.project-wiki/` entities.
5. Inspect current code and tests.
6. Choose a workflow:
   - `.harness/workflows/small-change.md`
   - `.harness/workflows/large-change.md`
   - `.harness/workflows/review-sync.md`
   - `.harness/workflows/wiki-update.md`

## Responsibility Split

- `.harness/` owns process.
- `.project-wiki/` owns durable project knowledge.
- Root entry files are launchers only.

## Large Change Gate

Large changes require an implementation plan, test cases, and user confirmation
before implementation.

## Project Baseline

- Keep API keys out of committed files and command output.
- Treat `BLOG_PUBLISHING.md` and `.project-wiki/contracts/` as the durable API
  reference for publishing behavior.
- Use the three-platform normal form from `BLOG_PUBLISHING.md` before adding
  publishing code or automations.
