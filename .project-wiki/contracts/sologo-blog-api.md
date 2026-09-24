---
id: contract.sologo-blog-api
type: contract
status: active
owners:
  - BLOG_PUBLISHING.md
updated: 2026-09-24
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
- List action: `GET act=list`
- Required create fields: `title`, `content`
- Optional category field: `category_id`
- Tags format: comma-separated string
- Draft/publish field: `dict_status`, where `1` means published and `2` means
  draft
- Cover field: `img_cover`, accepting base64 data URI, public URL, or OSS path

### Observed Publishing Supplements

These are production observations from publishing article ID `93` on
2026-05-20. Treat them as API contract supplements until the upstream API or
template behavior changes.

- The blog template already wraps API-provided `content` in
  `<article class="blog-article"><div class="article-content">...</div>`.
- Do not include a top-level `<article>` tag inside API content.
- Avoid `<figure>` and `<figcaption>` in Sologo API content because they can
  interact poorly with the current blog CSS.
- Preferred safe HTML subset for article content:
  - `<p>`
  - `<h2>`
  - `<h3>`
  - `<ul>`
  - `<ol>`
  - `<li>`
  - `<strong>`
  - `<em>`
  - `<a href="...">`
  - `<img src="..." alt="..." style="width:100%;max-width:100%;height:auto;...">`
- SologoAI article rendering is affected by external site CSS. Complete inline
  styling is mandatory in stored HTML. Put typography, spacing, lists, links,
  images, captions, tables, and callouts on the elements' `style` attributes.
  Do not rely on classes, `<style>` blocks, inherited CSS, or bare semantic HTML.
- Put images inside a `<p>` wrapper and captions in a following `<p><em>...`.
- Use Sologo CDN image URLs returned by `act=upload_image` for in-article
  images. Do not rely on Wikimedia `Special:Redirect` URLs or SVG redirects in
  published content.
- Convert local editorial graphics to PNG/JPG before upload. PNG worked through
  `act=upload_image` with base64 data URI input.
- The API create endpoint exposed a server-side SQL escaping issue when article
  body HTML contained apostrophes. Convert apostrophes in API `content` to
  `&#39;` before create/update unless the backend is fixed.
- `dict_status = 2` was documented as draft, but article ID `93` was reachable
  on the front end by slug. Treat Sologo draft status as potentially public
  until verified otherwise.
- If H2 spacing looks too tight, add a spacer paragraph before H2 or fix the
  platform CSS.
- If heading-to-body spacing looks too tight in Sologo rendering, insert an
  explicit blank line right after the heading:
  - `<p><br /></p>`
  This matches the spacing behavior seen in native Sologo richtext articles.

Validated categories on 2026-05-20:

- `1`: Logo Design
- `5`: Industry Logo Trends
- `3`: Tutorials & Guides
- `6`: Japanese Column
- `4`: Success Story

## Workflows

- List categories with `GET act=categories`.
- List articles with `GET act=list`.
- Create drafts with `POST act=create` and default `dict_status = 2`.
- Publish with either `dict_status = 1` during create or `POST act=publish`.
- For homepage/category-list inclusion, verify `ptime` after publishing. A
  direct create with `dict_status = 1` can make the article reachable by slug
  while leaving `ptime` empty; calling `POST act=publish` with
  `{ "id": post_id, "status": 1 }` populated `ptime` and made article ID `95`
  appear in the Tutorials & Guides list on 2026-06-22.
- Upload images with `POST act=upload_image`.

## Failure Modes

- `9003`: API key error.
- `9009`: invalid data such as duplicate `seo_uri`.
- Tags sent as an array will not match this contract.
- Confusing `delete` with physical deletion; it is a soft delete to draft/down.
- Broken in-article images if using external SVG redirect URLs instead of
  uploaded CDN images.
- Poor layout if content includes nested semantic wrappers that conflict with
  the Sologo blog template CSS.
- SQL error on create/update if raw apostrophes appear in HTML content.

## Update Rules

- Re-verify categories before using a category ID in an automated workflow.
- Keep API key only in local secrets or environment variables.
- For every Sologo article, run a post-publish HTML check and verify there are
  no `Special:Redirect` image URLs, no nested top-level `<article>`, no
  `<figure>` tags, and that key rich-text elements retain inline styles.
- For posts expected to appear on `/blog/` category sections, verify the
  category list API returns the post and that homepage cards have a non-empty
  `img_cover`.

## Open Questions

- Which author dictionary IDs should recurring tasks use?
- Should default status be draft for all automated posts?

## Observed Rendering — 2026-09-14

Verified with live articles 120–122 and the public blog homepage. Re-query the
live list API and public pages when the template behavior may have changed.

- The current detail template starts with article body text and does not display
  `img_cover` as a hero. The cover remains required for homepage/category cards.
  Do not assume a missing detail hero means the cover upload failed, and do not
  insert the cover into the body automatically.
- Homepage HTML emits card images as Vue `v-img` elements. Read their `src`
  attributes, verify the generated CDN thumbnail URLs, and inspect browser
  rendering; a server-HTML check limited to `img` can incorrectly report missing
  covers.
