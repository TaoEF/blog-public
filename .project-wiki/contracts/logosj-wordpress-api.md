---
id: contract.logosj-wordpress-api
type: contract
status: active
owners:
  - BLOG_PUBLISHING.md
updated: 2026-05-20
sources:
  - path: https://www.logosj.com/docs/wp_publisher_api.md
    status: current
  - path: BLOG_PUBLISHING.md
    status: current
related:
  - architecture.blog-publishing-system
confidence: high
---

# Logosj WordPress API

## Summary

Logosj uses a WordPress REST plugin named `wp-ai-publisher` to create draft or
published posts and import external images into the WordPress media library.

## Source Of Truth

- API documentation: `https://www.logosj.com/docs/wp_publisher_api.md`
- Local summary: `BLOG_PUBLISHING.md`
- Verified on 2026-05-20 by posting `{}` and receiving `missing_title` rather
  than `invalid_api_key`; no post was created.

## Contracts

- Domain: `https://www.logosj.com/`
- Base endpoint: `/wp-json/ai-publisher/v1`
- Publish endpoint: `POST /wp-json/ai-publisher/v1/publish`
- Auth header: `X-API-Key: $LOGOSJ_WP_API_KEY`
- Required publish fields: `title`, `content`
- Categories format: array of IDs or names
- Tags format: array of names
- Publish status: `draft` or `publish`, default `draft`
- Featured image field: `featured_image_url`
- Success HTTP status: `201`

## Workflows

- Create drafts with `status = "draft"`.
- Publish live posts with `status = "publish"`.
- Send `categories` and `tags` as arrays.
- Let the plugin import external images in `content` and `featured_image_url`.

## Failure Modes

- `invalid_api_key`: auth failure.
- `missing_title` or `missing_content`: request validation failure.
- Failed content-image downloads remove the image tags but do not block post
  creation.
- Missing categories by name may be auto-created, which can create taxonomy
  drift if names are inconsistent.

## Update Rules

- Treat WordPress categories as controlled vocabulary before recurring tasks.
- Keep real API key in local secrets only.

## Open Questions

- Which category names should be canonical for scheduled publishing?
- Should auto-created categories be allowed?

