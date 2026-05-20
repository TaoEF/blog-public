---
id: architecture.blog-publishing-system
type: architecture
status: active
owners:
  - BLOG_PUBLISHING.md
updated: 2026-05-20
sources:
  - path: BLOG_PUBLISHING.md
    status: current
related:
  - contract.sologo-blog-api
  - contract.logomaker-design-school-api
  - contract.logosj-wordpress-api
  - feature.blog-writing-and-publishing
  - decision.skill-plus-automation
confidence: high
---

# Blog Publishing System

## Summary

This repository is the workspace for writing blog content and publishing it to
three platforms with different API contracts: Sologo Blog, 标智客设计攻略, and
Logosj WordPress.

The intended architecture is a shared internal article shape plus per-platform
adapters. The shared shape preserves title, HTML content, summary, category,
tags, cover image, SEO metadata, and draft/publish state. Each adapter maps that
shape into the target platform's required fields.

## Source Of Truth

- Current source files in this repository.
- `BLOG_PUBLISHING.md` for the current API summary.
- Contract pages under `.project-wiki/contracts/`.
- Original online API docs listed in each contract page.

## Contracts

- Sologo uses `X-API-Key`, `category_id`, comma-separated tags, and
  `dict_status`.
- Logomaker uses `X-APP-Key`, `type`, space-separated tags, and requires
  `abstract`.
- Logosj uses `X-API-Key`, WordPress REST, array tags/categories, and string
  `status`.

## Workflows

1. Write or import article content into the internal article shape.
2. Validate required fields for the selected platform.
3. Normalize tags, category, image, SEO, and publish state.
4. Use the platform adapter to publish or draft.
5. Record returned IDs/URLs when a publishing log exists.

## Failure Modes

- Leaking API keys into committed files or logs.
- Reusing one platform's tag/category/status format for another platform.
- Publishing live content when a draft was intended.
- Sending Logomaker content images directly in `content` without pre-uploading.
- Assuming WordPress image failures block publishing; they do not.

## Update Rules

- Update `BLOG_PUBLISHING.md` and the relevant contract page whenever an API
  field, endpoint, auth header, or validation rule changes.
- Add adapter code only after preserving this normal form and platform mapping.
- Keep generated/published IDs out of durable docs unless they are needed for a
  repeatable workflow.

## Open Questions

- Which format will authored articles use first: Markdown, HTML, or structured
  JSON/YAML?
- Should publishing logs be committed, local-only, or stored in an external
  system?
- Which platform should be the default target for recurring tasks?

