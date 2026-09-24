---
id: decision.skill-plus-automation
type: decision
status: active
owners:
  - BLOG_PUBLISHING.md
  - .agents/skills/weekly-logo-news-publishing/SKILL.md
updated: 2026-09-24
sources:
  - path: BLOG_PUBLISHING.md
    status: current
  - path: .agents/skills/weekly-logo-news-publishing/SKILL.md
    status: current
related:
  - architecture.blog-publishing-system
  - feature.blog-writing-and-publishing
  - feature.weekly-logo-news-publishing
confidence: high
---

# Skill Plus Automation

## Summary

For this project, durable writing and publishing rules live in the repository:
the project wiki owns domain knowledge and the repository skill owns the
repeatable workflow. Scheduled automations are machine-local thin triggers.

## Source Of Truth

- User asked whether future recurring blog-writing tasks should become a skill
  or a scheduled automation.
- Current recommendation recorded in `BLOG_PUBLISHING.md`.

## Contracts

- Skill/workflow owns editorial rules, SEO requirements, platform formatting,
  image handling, and preflight checks.
- Automation owns schedule, target workspace, and trigger prompt.
- Publishing code owns API calls and field mapping.
- `.agents/skills/weekly-logo-news-publishing/` is the portable skill location.
- Live CMS/API results are canonical for already-published content. Automation
  memory and local run packages are optional diagnostics, not transfer state.
- `automations/` owns portable thin-prompt templates and installation/cutover
  instructions; it does not contain machine-generated automation config.
- `scripts/rebuild-weekly-state.mjs` reconstructs a local publication index
  from read-only CMS/list APIs. No committed publication ledger is required.
- `scripts/weekly-publish.mjs` is the only supported live publish entry point.
  It enforces audited payload hashes, live duplicate checks, explicit live
  confirmation, and the remote single-executor lease.
- The lease lives on `refs/heads/automation/weekly-logo-news-lock` by default.
  Atomic compare-and-swap pushes prevent concurrent acquisition across clones;
  the ref's commit history is the audit trail.

## Workflows

- On a new computer, clone the repository, configure local credentials and a
  stable `WEEKLY_EXECUTOR_ID`, and run the read-only preflight.
- Install both local automations from `automations/README.md`. Keep the Monday
  task in dry-run mode during verification.
- Rebuild state from the CMS before selecting topics and again through the
  adapter immediately before publishing.
- Pause the old Monday task before enabling live mode on the new computer. The
  live adapter must still acquire the remote lease on every run.

## Failure Modes

- Putting all content rules directly into an automation prompt makes future
  changes brittle.
- Copying a personal skill without committing it leaves other clones unable to
  reproduce the workflow.
- Treating machine-local automation memory as canonical history can cause
  duplicate topics or posts after a computer change.
- Creating automation before preflight/publishing adapters can cause live
  publishing mistakes.
- Relying only on “pause the old task” is not an enforceable cross-computer
  gate; live writes must pass the remote lease.
- Building a skill too early can encode untested editorial assumptions.

## Update Rules

- Revisit this decision after the first successful end-to-end article publish.
- Record any recurring schedule as a separate automation, not as an API contract.
- Update the repository skill and routed wiki/contracts together whenever the
  workflow changes.

## Open Questions

- Should the lock ref eventually be protected by a dedicated GitHub App rather
  than each executor's existing Git credentials?
