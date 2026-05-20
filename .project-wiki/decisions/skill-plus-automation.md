---
id: decision.skill-plus-automation
type: decision
status: active
owners:
  - BLOG_PUBLISHING.md
updated: 2026-05-20
sources:
  - path: BLOG_PUBLISHING.md
    status: current
related:
  - architecture.blog-publishing-system
  - feature.blog-writing-and-publishing
confidence: medium
---

# Skill Plus Automation

## Summary

For this project, durable writing and publishing rules should live in a project
skill or harness/wiki-backed workflow, while scheduled automations should only
trigger that workflow on a cadence.

## Source Of Truth

- User asked whether future recurring blog-writing tasks should become a skill
  or a scheduled automation.
- Current recommendation recorded in `BLOG_PUBLISHING.md`.

## Contracts

- Skill/workflow owns editorial rules, SEO requirements, platform formatting,
  image handling, and preflight checks.
- Automation owns schedule, target workspace, and trigger prompt.
- Publishing code owns API calls and field mapping.

## Workflows

- Build the publishing adapter/CLI first.
- Create or refine a project skill once the writing workflow has repeatable
  rules.
- Add scheduled automations after the workflow can run safely on demand.

## Failure Modes

- Putting all content rules directly into an automation prompt makes future
  changes brittle.
- Creating automation before preflight/publishing adapters can cause live
  publishing mistakes.
- Building a skill too early can encode untested editorial assumptions.

## Update Rules

- Revisit this decision after the first successful end-to-end article publish.
- Record any recurring schedule as a separate automation, not as an API contract.

## Open Questions

- What review gate is required before an automation publishes live?
- How should generated article drafts be stored?
