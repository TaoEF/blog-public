---
id: feature.weekly-logo-news-publishing
type: feature
status: active
owners:
  - BLOG_PUBLISHING.md
updated: 2026-05-20
sources:
  - path: user request on 2026-05-20
    status: current
  - path: BLOG_PUBLISHING.md
    status: current
related:
  - feature.blog-writing-and-publishing
  - architecture.blog-publishing-system
  - contract.sologo-blog-api
  - contract.logomaker-design-school-api
  - contract.logosj-wordpress-api
  - decision.skill-plus-automation
confidence: high
---

# Weekly Logo News Publishing

## Summary

Every week, monitor logo and brand identity news sources, select the strongest
recent items, and publish SEO-oriented blog content to three platforms.

Chinese coverage goes to Logosj and Logomaker. English analysis goes to Sologo.
Known brand updates should be prioritized over small or obscure items.

## Source Of Truth

- User request on 2026-05-20.
- Platform publishing contracts in `.project-wiki/contracts/`.
- Current source articles discovered during each weekly run.

## Contracts

News sources to monitor include:

- `https://www.underconsideration.com/brandnew/`
- `https://www.logolounge.com/news`
- `https://www.pentagram.com/`

Additional reputable logo, branding, design, and agency sources may be used if
they help identify higher-value weekly topics.

Chinese publishing task:

- Select the week's 1-2 most important logo/brand update items.
- Publish at least 1 and at most 2 Chinese posts weekly.
- Prioritize famous brands and recognizable industry cases.
- Include rich images in every article.
- Translate the news into Chinese.
- Add concise commentary, viewpoint, and insight.
- Publish to `logosj.com` and `logomaker.com.cn`.
- CTA points to the Logomaker homepage: `https://www.logomaker.com.cn/`.
- CTA should encourage readers to create their own logo.

English Sologo publishing task:

- Write opinionated, high-quality English articles based on the selected news.
- Publish at least 1 and at most 5 English posts weekly.
- Keep language concise, readable, and clear.
- Include rich images in every article.
- Move from a logo case to analysis, why it matters, broader industry relevance,
  and related examples.
- Use multiple internal links.
- Final CTA points to relevant Sologo generator pages.
- Generator page inventory needs to be gathered and maintained before publishing.

SEO rules:

- Titles must include the brand name keyword.
- Titles should include an industry keyword or logo-type keyword when natural.
- Example angle: `Why [Brand] Changed Back to a Monogram Logo`.
- Content should be SEO-oriented without becoming stiff or keyword-stuffed.

Image rules:

- Every article should include a useful cover image plus multiple in-article
  images when source material allows.
- Prefer legitimate source screenshots, official press images, brand newsroom
  images, or article images with attribution/linking where appropriate.
- Use deterministic local image processing for collages, before/after grids,
  crops, resizing, compression, watermarked analysis boards, and image format
  conversion.
- Use the `imagegen` skill for newly generated editorial visuals, neutral
  concept illustrations, mockups, or image edits that benefit from generative
  composition.
- Do not fabricate official logos or misleading brand assets. Generated images
  should be clearly editorial/supporting visuals, not fake source evidence.
- When publishing to Logomaker, content images should be uploaded first through
  that platform's upload API and then inserted into HTML with returned URLs.
- When publishing to Sologo, image cover inputs can be base64, public URL, or
  OSS path.
- When publishing to Logosj WordPress, external images in content and featured
  image URLs are imported by the WordPress plugin.

## Workflows

1. Review the past week's relevant logo and brand identity news.
2. Rank candidates by brand familiarity, visual/strategic significance, search
   demand, and usefulness to logo creators.
3. Select 1-2 Chinese topics and 1-5 English Sologo topics. The same core item
   can be adapted across languages when appropriate.
4. For Chinese posts, summarize and translate the facts, then add a short
   viewpoint and practical insight.
5. Prepare an image set for each article: cover, source/reference images, and
   optional comparison collage or analysis graphic.
6. For Sologo posts, write a broader English analysis with related examples,
   internal links, and generator-specific CTA.
7. Validate each post against its platform contract before publishing.
8. Publish drafts first unless the user has explicitly approved direct
   publishing for that automation.
9. Report selected topics, image sources/assets, published URLs or draft IDs,
   and any skipped items.

## Failure Modes

- Publishing copied or overly close translations of source articles instead of
  original summaries and analysis.
- Selecting low-recognition items when a better-known brand update is available.
- Missing CTA requirements or pointing to the wrong site.
- Publishing Sologo content before Sologo generator CTA URLs are inventoried.
- Forgetting Chinese platform differences: Logomaker tags are space-separated,
  while Logosj tags are arrays.
- Letting the automation publish live without a review gate if publishing code
  is not yet fully tested.
- Using generated visuals as if they were official source images.
- Publishing image-heavy articles without adapting image handling to the target
  platform.

## Update Rules

- Add or remove news sources here when the weekly monitoring set changes.
- Maintain the Sologo generator URL inventory before enabling direct Sologo
  publishing.
- Record recurring schedule changes in automation settings, not in API
  contracts.

## Open Questions

- Should the first automation create drafts only, or publish live after
  generation?
- Which Sologo generator pages should be used as CTA targets?
- Should Chinese posts be identical across Logosj and Logomaker, or should each
  platform have slightly different intros and metadata?
