---
id: contract.logomaker-design-school-api
type: contract
status: active
owners:
  - BLOG_PUBLISHING.md
updated: 2026-05-20
sources:
  - path: https://www.logomaker.com.cn/api/design_school.md
    status: current
  - path: BLOG_PUBLISHING.md
    status: current
related:
  - architecture.blog-publishing-system
confidence: high
---

# Logomaker Design School API

## Summary

标智客设计攻略 exposes a JSON API for listing design-school categories,
uploading article images, and publishing design-school articles.

## Source Of Truth

- API documentation: `https://www.logomaker.com.cn/api/design_school.md`
- Local summary: `BLOG_PUBLISHING.md`
- Verified with `GET act=types` on 2026-05-20.

## Contracts

- Domain: `https://www.logomaker.com.cn/`
- Base endpoint: `api.php?op=design_school&act={action}`
- Auth header: `X-APP-Key: $LOGOMAKER_DESIGN_SCHOOL_API_KEY`
- Publish action: `POST act=publish`
- Required publish fields: `title`, `type`, `abstract`, `content`
- Title max length: 50 characters
- Abstract max length: 255 characters
- Tags format: space-separated string
- Active status field: `status`, where `1` means valid and `0` means invalid
- Cover fields: `image_url` preferred; fallback `img_thumb`
- Publicly supported actions are `types`, `upload`, and `publish`.
- Tested but unsupported actions: `update`, `delete`, `remove`, `unpublish`,
  `status`, and `offline`.
- `publish` always creates a new article. Passing an `id` does not update an
  existing article.

Validated categories on 2026-05-20:

- `1`: LOGO设计攻略
- `2`: 运营物料设计攻略
- `3`: 使用攻略

## Workflows

- List categories with `GET act=types`.
- Upload content images first with `POST act=upload`.
- Insert returned OSS URLs into `content`.
- Publish with `POST act=publish`.
- Use `image_url` for cover images. Do not pass a full external URL as
  `img_thumb`; it can produce malformed duplicated URLs.
- Use simple HTML only. Avoid top-level `<article>`, `<figure>`,
  `<figcaption>`, and custom classes.
- If the page CSS makes H2 spacing too tight, use a spacer paragraph before H2
  or fix the platform stylesheet.

## Failure Modes

- `10301`: missing required parameter.
- `10302`: invalid parameter, including invalid `type`.
- `10304`: external image request failed.
- Sending content image URLs that were not uploaded first can break the intended
  content-image workflow.
- Mistakes cannot currently be fixed through the public API. Cleanup requires
  the management backend.
- Page CSS/scripts can conflict with rich HTML structures or custom classes.
- The page script transforms `.d_s_details_container .template` images into
  template-editor widgets, so never use `class="template"` in API content.
- Mixed Chinese/English title length validation may behave closer to byte length
  than visible character count; keep titles short.

## Update Rules

- Re-verify categories before scheduled publishing.
- Keep title and abstract length checks in any adapter or preflight.
- Treat published Logomaker articles as immutable from this API until an update
  or status endpoint is added.

## Open Questions

- Should recurring posts default to `is_good = 0`?
- Should generated covers be uploaded as base64 or hosted first?
