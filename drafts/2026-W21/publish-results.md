# Publish Results

Date: 2026-05-20

## Sologo

- API status: success
- Article ID: `93`
- Requested status: `dict_status = 2` draft
- URL checked:
  - `https://www.sologo.ai/blog/why-peacock-changed-streaming-logo-one-less-dot/`
- Note: Although the API uses `dict_status = 2` for draft, the slug URL returned
  HTTP 200 and appears reachable on the front end.
- First attempt failed because the API did not safely handle apostrophes in HTML
  content. The successful retry converted apostrophes in the body to HTML
  entities.
- 2026-05-20 layout fix: updated the article body to remove nested `<article>`,
  `<figure>`, and `<figcaption>` tags, because the published page already wraps
  API content in `<article class="blog-article"><div class="article-content">`.
- 2026-05-20 image fix: replaced Wikimedia SVG redirect images with three PNGs
  uploaded through `act=upload_image` to Sologo CDN:
  - `https://cdn.sologo.ai/2026/05/2605200551204988.png`
  - `https://cdn.sologo.ai/2026/05/2605200551208652.png`
  - `https://cdn.sologo.ai/2026/05/2605200551201483.png`
- Update API response for the layout/image fix: `{ "status": 0, "msg": "ok" }`
- Follow-up verification note: immediately after the update, repeated page fetch
  attempts from the local environment failed with DNS resolution errors for
  `www.sologo.ai`, so a final automated front-end re-check is still pending.

## Logosj WordPress

- API status: success
- Post ID: `20378`
- Requested status: `draft`
- Returned post URL:
  - `https://www.logosj.com/?p=20378`
- Public URL check: HTTP 404, which is expected for a draft without authenticated
  preview access.
- Image import result: `images_processed = 0`, `images_failed = 4`
- Note: Wikimedia SVG redirect URLs were not imported by the WordPress plugin.
  Replace with direct PNG/JPG URLs or uploaded media before final publishing.

## Logomaker Design School

- API status: success
- Article ID: `321`
- Requested status: `0` invalid/non-public because the API does not document a
  draft mode.
- Draft URL: not returned by API.
- Cover image: omitted after the API failed to fetch the Wikimedia SVG redirect.
- Note: The API rejected the original title as too long despite being under 50
  visible characters, likely due to byte-length validation. The accepted title
  was shortened to `Peacock新Logo少了一个点`.
- 2026-05-20 update after API docs changed: old error/test articles `322`,
  `323`, and `325` were successfully unpublished through `act=unpublish`, each
  returning `status = 0`. Correct article `324` remains live.

## Follow-Ups Before Final Publishing

- Convert or upload source images to stable PNG/JPG URLs for Logosj and
  Logomaker.
- Update Logomaker with a cover image after uploading it through the platform's
  image workflow or using a URL it can fetch.
- Decide whether Sologo `dict_status = 2` should be treated as public-facing on
  this site, since the slug was reachable.
