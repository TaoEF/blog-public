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

## Workflows

- Build the publishing adapter/CLI first.
- Create or refine a project skill once the writing workflow has repeatable
  rules.
- Add scheduled automations after the workflow can run safely on demand.
- On a new computer, clone the repository, configure local credentials, invoke
  the repository skill, and query live list APIs before publishing.

## Failure Modes

- Putting all content rules directly into an automation prompt makes future
  changes brittle.
- Copying a personal skill without committing it leaves other clones unable to
  reproduce the workflow.
- Treating machine-local automation memory as canonical history can cause
  duplicate topics or posts after a computer change.
- Creating automation before preflight/publishing adapters can cause live
  publishing mistakes.
- Building a skill too early can encode untested editorial assumptions.

## Update Rules

- Revisit this decision after the first successful end-to-end article publish.
- Record any recurring schedule as a separate automation, not as an API contract.
- Update the repository skill and routed wiki/contracts together whenever the
  workflow changes.

## Open Questions

- Should schedule settings eventually have a repository template, or remain
  entirely machine-local?
