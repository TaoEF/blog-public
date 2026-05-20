# Blog Publishing Platforms

This project publishes blog content to three different platforms. Keep API keys
out of source files and pass them through environment variables or a local secret
file ignored by git.

For operational publishing steps, edge cases, and live-test supplements, read
`API_USAGE.md` first. This file is the compact platform overview.

## Sologo Blog

- Domain: `https://www.sologo.ai/`
- Base endpoint: `api.php?op=blog_post&act={action}`
- Auth header: `X-API-Key: $SOLOGO_BLOG_API_KEY`
- Success shape: `{ "status": 0, "msg": "ok", "data": ... }`

### Main Actions

- `GET act=categories`: list categories.
- `GET act=list`: query articles.
- `POST act=create`: create article.
- `POST act=update`: update article by `id`; send only fields to change.
- `POST act=delete`: soft delete, accepts `id` or `ids`.
- `POST act=publish`: publish or unpublish with `{ "id": 123, "status": 1 }`.
- `POST act=upload_image`: upload one image with `image` or many with `images`.

### Create Fields

Required:

- `title`: string
- `content`: HTML string

Optional:

- `category_id`: int, default `0`
- `tags`: comma-separated string, e.g. `logo,design,tips`
- `summary`: auto-generated from content if empty
- `seo_uri`: auto-generated from title if empty
- `seo_title`
- `seo_keyword`
- `seo_desc`
- `img_cover`: base64 data URI, public URL, or OSS path
- `dict_blog_author`: int, default `1`
- `order_num`: int, default `0`
- `dict_status`: `1` published, `2` draft, default `2`

Validated categories on 2026-05-20:

- `1`: Logo Design
- `5`: Industry Logo Trends
- `3`: Tutorials & Guides
- `6`: Japanese Column
- `4`: Success Story

### Publishing Supplements From Live Test

Observed on 2026-05-20 while publishing Sologo article ID `93`:

- Sologo page templates already wrap API `content` in article containers; do
  not send a nested top-level `<article>`.
- Avoid `<figure>` and `<figcaption>` in API content. Use simple `<p>` wrappers,
  `<img>` tags, and `<p><em>caption</em></p>` instead.
- Upload article images with `act=upload_image` and use returned
  `cdn.sologo.ai` URLs. External SVG redirect URLs caused bad images/layout.
- Convert local graphics to PNG/JPG before upload.
- Escape apostrophes in `content` as `&#39;`; raw apostrophes triggered a SQL
  syntax error during create.
- `dict_status = 2` may still be reachable on the front end by slug; treat
  Sologo drafts as potentially public until the backend behavior is clarified.

## Logomaker Design School

- Domain: `https://www.logomaker.com.cn/`
- Base endpoint: `api.php?op=design_school&act={action}`
- Auth header: `X-APP-Key: $LOGOMAKER_DESIGN_SCHOOL_API_KEY`
- Success shape: `{ "status": 0, "msg": "操作成功", "data": ... }`

### Main Actions

- `GET act=types`: list categories.
- `POST act=upload`: upload content images.
- `POST act=publish`: publish article.
- `POST act=lists`: query articles.
- `POST act=update`: update article.
- `POST act=unpublish`: set article `status = 0`.

### Publish Fields

Required:

- `title`: string, max 50 characters
- `type`: int, must be an existing valid category ID
- `abstract`: string, max 255 characters
- `content`: HTML string

Optional:

- `image_url`: cover image public URL or base64 data URI; preferred over `img_thumb`
- `img_thumb`: existing OSS cover path, used when `image_url` is empty
- `tags`: space-separated string, e.g. `LOGO 配色 设计技巧`
- `is_good`: `0` or `1`, default `0`
- `status`: `0` invalid, `1` valid, default `1`
- `order`: int, default `0`; higher means earlier

Important image rule:

- Content images should be uploaded through `act=upload` first, then inserted into
  `content` with returned OSS URLs. `publish` only handles the cover image.

Important live-test notes:

- `types`, `upload`, `publish`, `lists`, `update`, and `unpublish` are publicly
  supported.
- `publish` creates a new article. Use `update` for existing articles.
- `unpublish` sets `status = 0`.
- Avoid top-level `<article>`, `<figure>`, `<figcaption>`, and custom classes in
  content.

Validated categories on 2026-05-20:

- `1`: LOGO设计攻略
- `2`: 运营物料设计攻略
- `3`: 使用攻略

## Logosj WordPress

- Domain: `https://www.logosj.com/`
- Base endpoint: `/wp-json/ai-publisher/v1`
- Publish endpoint: `POST /wp-json/ai-publisher/v1/publish`
- Auth header: `X-API-Key: $LOGOSJ_WP_API_KEY`
- Success HTTP status: `201`
- Success shape:
  `{ "success": true, "post_id": 123, "post_url": "...", "status": "draft" }`

### Publish Fields

Required:

- `title`: string
- `content`: HTML string

Optional:

- `excerpt`: string
- `categories`: array of category IDs or names; missing categories are created
- `tags`: array of tag names
- `featured_image_url`: public URL; downloaded to media library and set as featured image
- `status`: `draft` or `publish`, default `draft`
- `author`: int

Additional supported actions:

- `GET /categories`: query categories.
- `GET /posts`: query posts.
- `PUT /publish/{id}`: update post.
- `POST /publish/{id}/publish`: set post live.
- `POST /publish/{id}/draft`: set post to draft/down.

Important image rules:

- External images in `content` are automatically downloaded into the WordPress
  media library.
- `featured_image_url` is downloaded and set as the featured image.
- Already downloaded images are deduplicated by `_source_url`.
- Failed content image downloads remove those image tags but do not block publishing.
- Wikimedia SVG redirect URLs failed in testing. Stable PNG/JPG CDN or OSS URLs
  worked.

Validation note:

- On 2026-05-20, posting `{}` returned `missing_title` rather than
  `invalid_api_key`, confirming the configured key passed authentication without
  creating a post.

## Recommended Internal Normal Form

Use a single internal article object and map it to each platform:

```json
{
  "site": "sologo | logomaker | logosj",
  "title": "Article title",
  "contentHtml": "<p>HTML content</p>",
  "summary": "Short summary",
  "category": "category id or name",
  "tags": ["tag1", "tag2"],
  "coverImage": "public URL, base64 data URI, or local generated asset",
  "seo": {
    "slug": "article-slug",
    "title": "SEO title",
    "keywords": ["keyword1", "keyword2"],
    "description": "SEO description"
  },
  "publishStatus": "draft | publish"
}
```

Mapping differences:

- Sologo `tags`: join array with commas.
- Logomaker `tags`: join array with spaces.
- Logosj `tags`: keep as array.
- Sologo published status: `dict_status = 1`; draft: `dict_status = 2`.
- Logomaker active status: `status = 1`.
- Logosj published status: `status = "publish"`; draft: `status = "draft"`.
- Sologo uses `category_id`.
- Logomaker uses `type`.
- Logosj uses `categories`.

## Skill vs Automation

Use a skill when the important work is editorial and procedural:

- keyword/topic selection
- article outline and brand voice
- platform-specific formatting
- image handling
- SEO metadata
- preflight checks before publishing

Use a scheduled automation when the task is time-based:

- create one article every week
- monitor a content queue
- publish drafts at a fixed time
- generate a periodic report of published URLs

Best fit for this project:

- Create a small local publishing CLI/library for the three API adapters.
- Create a project skill that teaches agents how to write and format articles for
  these three platforms.
- Add scheduled automations later to run that workflow on a cadence.
