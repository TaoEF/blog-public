# Blog API Usage Guide

Operational publishing playbook for the three blog platforms. Keep API keys in
environment variables only:

```sh
SOLOGO_BLOG_API_KEY=
LOGOMAKER_DESIGN_SCHOOL_API_KEY=
LOGOSJ_WP_API_KEY=
```

## Shared Rules

Use conservative HTML in API content:

- `p`
- `h2`
- `h3`
- `ul`
- `ol`
- `li`
- `strong`
- `em`
- `a`
- `img`

Avoid:

- top-level `article`
- `section`
- `figure`
- `figcaption`
- custom classes that may collide with platform CSS or scripts

Recommended image markup:

```html
<p><img src="https://..." alt="..." /></p>
<p><em>Short caption.</em></p>
```

If platform CSS makes H2 spacing too tight, a content-level workaround is:

```html
<p>&nbsp;</p>
<h2>Section title</h2>
```

The long-term fix is platform CSS for article-body `h2` margins.

## Sologo Blog

- Base: `https://www.sologo.ai/api.php?op=blog_post&act={action}`
- Auth: `X-API-Key: $SOLOGO_BLOG_API_KEY`

Actions:

- `GET categories`
- `GET list`
- `POST create`
- `POST update`
- `POST delete`
- `POST publish`
- `POST upload_image`

Create:

```json
{
  "title": "Why Peacock Changed Its Streaming Logo",
  "content": "<p>HTML content</p>",
  "category_id": 1,
  "tags": "Peacock,streaming logo design,logo redesign",
  "summary": "Short summary",
  "seo_uri": "why-peacock-changed-streaming-logo",
  "seo_title": "SEO title",
  "seo_keyword": "keyword 1, keyword 2",
  "seo_desc": "SEO description",
  "img_cover": "2026/05/example.png",
  "dict_blog_author": 1,
  "dict_status": 2
}
```

Status:

- `dict_status = 1`: publish
- `dict_status = 2`: documented as draft, but live testing showed it can still
  be reachable by slug

Update:

```json
{
  "id": 93,
  "content": "<p>Updated content</p>",
  "img_cover": "2026/05/example.png"
}
```

Publish:

```json
{ "id": 93, "status": 1 }
```

Image upload:

```json
{
  "images": [
    "data:image/png;base64,...",
    "https://example.com/image.png"
  ]
}
```

List:

```http
GET api.php?op=blog_post&act=list&keyword=Peacock&page=1&pagesize=5
```

Useful filters include `category_id`, `tag`, `dict_blog_author`,
`dict_status`, `keyword`, `start_time`, `end_time`, `page`, `pagesize`, and
`orderby`.

Sologo live-test rules:

- Do not send a top-level `<article>`.
- Avoid `<figure>` and `<figcaption>`.
- Upload local/generated graphics as PNG/JPG first, then use returned
  `cdn.sologo.ai` URLs.
- Do not use Wikimedia `Special:Redirect` or SVG redirect image URLs.
- Escape apostrophes in `content` as `&#39;` before create/update.

Validated categories:

- `1`: Logo Design
- `5`: Industry Logo Trends
- `3`: Tutorials & Guides
- `6`: Japanese Column
- `4`: Success Story

## Logomaker Design School

- Base: `https://www.logomaker.com.cn/api.php?op=design_school&act={action}`
- Auth: `X-APP-Key: $LOGOMAKER_DESIGN_SCHOOL_API_KEY`

Supported actions:

- `GET types`
- `POST upload`
- `POST publish`
- `POST lists`
- `POST update`
- `POST unpublish`

Tested unsupported actions:

- `delete`
- `remove`
- `status`
- `offline`

Important: `publish` creates a new article. Use `update` for existing articles.

Publish:

```json
{
  "title": "Peacock新Logo设计分析",
  "type": 1,
  "abstract": "摘要，控制在255字符内。",
  "content": "<p>HTML content</p>",
  "image_url": "https://pro.upload.logomaker.com.cn/design_school/example.png",
  "tags": "Peacock 流媒体Logo 品牌更新 Logo设计",
  "is_good": 0,
  "status": 1,
  "order": 0
}
```

Status:

- `status = 1`: valid/live
- `status = 0`: invalid, but only at create time

Use `update` to edit existing articles and `unpublish` to set `status = 0`.

Image upload:

```json
{
  "images": [
    "https://cdn.sologo.ai/2026/05/example.png",
    "data:image/png;base64,..."
  ]
}
```

Use returned `https://pro.upload.logomaker.com.cn/design_school/...` URLs inside
`content`.

List:

```json
{
  "page": 1,
  "pagesize": 10,
  "type": 1,
  "status": 1,
  "keyword": "Peacock",
  "order": "id",
  "sortby": "desc"
}
```

Endpoint:

```http
POST api.php?op=design_school&act=lists
```

Update:

```json
{
  "id": 324,
  "title": "Peacock新Logo设计分析",
  "content": "<p>Updated HTML</p>",
  "status": 1
}
```

Endpoint:

```http
POST api.php?op=design_school&act=update
```

Only send fields that need changing.

Unpublish:

```json
{ "id": 322 }
```

Endpoint:

```http
POST api.php?op=design_school&act=unpublish
```

This sets `status = 0`. It was used successfully to unpublish old Peacock test
articles `322`, `323`, and `325`.

Cover image:

- Prefer `image_url` with a fetchable public image URL.
- Do not set `img_thumb` to a full external URL. Testing produced a malformed
  duplicated URL.

Logomaker live-test rules:

- Do not send a top-level `<article>`.
- Avoid `<figure>` and `<figcaption>`.
- Avoid custom classes, especially `template`, because page scripts transform
  `.d_s_details_container .template` images into template-editor widgets.
- Use simple HTML only: `p`, `h2`, `ul`, `li`, `strong`, `em`, `a`, `img`.
- Upload images first through `act=upload`, then insert returned OSS URLs.
- Keep titles short. Mixed Chinese/English title validation may behave closer to
  byte length than visible character count.

Validated categories:

- `1`: LOGO设计攻略
- `2`: 运营物料设计攻略
- `3`: 使用攻略

## Logosj WordPress

- Endpoint: `https://www.logosj.com/wp-json/ai-publisher/v1/publish`
- Auth: `X-API-Key: $LOGOSJ_WP_API_KEY`

Additional endpoints:

- `PUT /wp-json/ai-publisher/v1/publish/{id}`: update post
- `POST /wp-json/ai-publisher/v1/publish/{id}/publish`: set post live
- `POST /wp-json/ai-publisher/v1/publish/{id}/draft`: set post to draft/down
- `GET /wp-json/ai-publisher/v1/categories`: query categories
- `GET /wp-json/ai-publisher/v1/posts`: query posts

Publish:

```json
{
  "title": "Peacock新Logo：流媒体品牌为什么少了一个彩色圆点？",
  "content": "<p>HTML content</p>",
  "excerpt": "Short excerpt",
  "categories": ["Logo设计"],
  "tags": ["Peacock", "流媒体Logo", "品牌更新", "Logo设计"],
  "featured_image_url": "https://cdn.sologo.ai/2026/05/example.png",
  "status": "publish"
}
```

Status:

- `draft`
- `publish`

Image handling:

- WordPress imports external images from `content` and `featured_image_url`.
- Stable PNG/JPG CDN or OSS URLs worked.
- Wikimedia SVG redirect URLs failed import in live testing.
- Check `images_processed` and `images_failed` after publish.

Categories and tags:

- `categories` is an array.
- `tags` is an array.
- Category names may be auto-created if missing, so use controlled names.

## Preflight Checklist

- Confirm target platform and status.
- Validate required fields.
- Validate title length.
- Ensure content has no top-level `<article>`.
- Ensure content has no `<figure>` or `<figcaption>`.
- Ensure images are PNG/JPG or known-good CDN/OSS URLs.
- Upload Logomaker images through `act=upload`.
- Upload Sologo images through `act=upload_image`.
- Use arrays for Logosj categories/tags.
- Escape Sologo apostrophes as `&#39;`.
- Decide whether H2 spacer paragraphs are needed.

## Post-Publish Checklist

- Record returned ID and URL.
- Fetch the public URL when available.
- Check title, images, and H2 spacing.
- For Logosj, verify `images_failed = 0`.
- For Logomaker, use `update` or `unpublish` rather than creating replacement
  articles for fixable mistakes.
