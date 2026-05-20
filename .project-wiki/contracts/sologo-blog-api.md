---
id: contract.sologo-blog-api
type: contract
status: active
owners:
  - BLOG_PUBLISHING.md
updated: 2026-05-20
sources:
  - path: https://www.sologo.ai/api/blog_post.md
    status: current
  - path: BLOG_PUBLISHING.md
    status: current
related:
  - architecture.blog-publishing-system
confidence: high
---

# Sologo Blog API

## Summary

Sologo Blog exposes a JSON API for creating, updating, soft-deleting,
publishing, listing categories, and uploading images for blog posts.

## Source Of Truth

- API documentation: `https://www.sologo.ai/api/blog_post.md`
- Local summary: `BLOG_PUBLISHING.md`
- Verified with `GET act=categories` on 2026-05-20.

## Contracts

- Domain: `https://www.sologo.ai/`
- Base endpoint: `api.php?op=blog_post&act={action}`
- Auth header: `X-API-Key: $SOLOGO_BLOG_API_KEY`
- Create action: `POST act=create`
- Required create fields: `title`, `content`
- Optional category field: `category_id`
- Tags format: comma-separated string
- Draft/publish field: `dict_status`, where `1` means published and `2` means
  draft
- Cover field: `img_cover`, accepting base64 data URI, public URL, or OSS path

Validated categories on 2026-05-20:

- `1`: Logo Design
- `5`: Industry Logo Trends
- `3`: Tutorials & Guides
- `6`: Japanese Column
- `4`: Success Story

## Workflows

- List categories with `GET act=categories`.
- Create drafts with `POST act=create` and default `dict_status = 2`.
- Publish with either `dict_status = 1` during create or `POST act=publish`.
- Upload images with `POST act=upload_image`.

## Failure Modes

- `9003`: API key error.
- `9009`: invalid data such as duplicate `seo_uri`.
- Tags sent as an array will not match this contract.
- Confusing `delete` with physical deletion; it is a soft delete to draft/down.

## Update Rules

- Re-verify categories before using a category ID in an automated workflow.
- Keep API key only in local secrets or environment variables.

## Open Questions

- Which author dictionary IDs should recurring tasks use?
- Should default status be draft for all automated posts?

