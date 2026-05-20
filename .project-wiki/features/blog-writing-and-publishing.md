---
id: feature.blog-writing-and-publishing
type: feature
status: active
owners:
  - BLOG_PUBLISHING.md
updated: 2026-05-20
sources:
  - path: BLOG_PUBLISHING.md
    status: current
related:
  - architecture.blog-publishing-system
  - decision.skill-plus-automation
confidence: medium
---

# Blog Writing And Publishing

## Summary

The project exists to support AI-assisted blog production and publishing. The
writing workflow should produce platform-ready HTML, SEO metadata, category,
tags, summary/excerpt, and cover/content image inputs before calling publishing
APIs.

## Source Of Truth

- User instruction on 2026-05-20: this project is mainly for writing and
  publishing blog posts.
- `BLOG_PUBLISHING.md` for platform publishing requirements.

## Contracts

- Articles should be represented internally before platform mapping.
- Platform-specific field differences must be handled in adapters or preflight.
- API keys are secrets and are not article content.

## Workflows

1. Select target site and topic.
2. Draft article content in a reusable source format.
3. Produce HTML content and SEO metadata.
4. Prepare tags, category, summary/excerpt, and cover image.
5. Validate against the target platform contract.
6. Publish as draft first unless the user explicitly requests live publishing.

## Failure Modes

- Publishing without platform-specific validation.
- Using the wrong tag separator.
- Generating summaries that exceed platform limits.
- Mixing English and Chinese platform/category expectations without review.

## Update Rules

- When a recurring content workflow is added, record topic source, cadence,
  target platform, publishing status, and review requirements.
- Add examples only after a real article workflow exists.

## Open Questions

- What topic sources should drive scheduled posts?
- Should recurring posts require user review before live publication?
- What article source format should be canonical?

