---
id: feature.weekly-logo-news-publishing
type: feature
status: active
owners:
  - BLOG_PUBLISHING.md
  - .agents/skills/weekly-logo-news-publishing/SKILL.md
updated: 2026-09-24
sources:
  - path: user request on 2026-05-20
    status: current
  - path: BLOG_PUBLISHING.md
    status: current
  - path: .agents/skills/weekly-logo-news-publishing/SKILL.md
    status: current
related:
  - feature.sologo-blog-style-guide
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

- Select at least 3 important logo/brand update items each week.
- Publish the Chinese localization of every successfully verified weekly Sologo story to both Logosj and Logomaker.
- Prioritize famous brands and recognizable industry cases.
- Include rich images in every article.
- Translate the news into Chinese.
- Add concise commentary, viewpoint, and insight.
- Publish to `logosj.com` and `logomaker.com.cn`.
- CTA points to the Logomaker homepage: `https://www.logomaker.com.cn/`.
- CTA should encourage readers to create their own logo.

English Sologo publishing task:

- Write and publish at least 3 opinionated, high-quality English articles based on distinct selected news stories.
- Keep language concise, readable, and clear.
- Include rich images in every article.
- Move from a logo case to analysis, why it matters, broader industry relevance,
  and related examples.
- Use multiple internal links.
- Final CTA points to relevant Sologo generator pages.
- Generator page inventory needs to be gathered and maintained before publishing.
- Sologo articles should use `.project-wiki/features/sologo-blog-style-guide.md`
  as style reference, while improving depth, originality, and SEO structure.

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
- Use deterministic local image processing only for source-based crops,
  before/after grids, contact sheets, resizing, compression, watermarks, and
  image format conversion.
- Use the `imagegen` skill with GPT-Image-2 for high-quality newly generated
  editorial visuals, neutral concept illustrations, mockups, material studies,
  spatial compositions, or visual metaphors that benefit from generative
  composition.
- Do not create text-heavy SVG analysis boards, boxed-card diagrams, simple
  geometric placeholders, wireframes, or slide-like infographics as article
  covers or supporting editorial images. They repeat the prose without adding
  visual value.
- Prefer polished raster editorial imagery with little or no embedded text.
  Keep detailed analysis in the article copy and caption.
- SVG is allowed only when a task genuinely requires a precise reusable vector
  diagram or chart; it is not the default source format for blog imagery.
- Do not fabricate official logos or misleading brand assets. Generated images
  should be clearly editorial/supporting visuals, not fake source evidence.
- When publishing to Logomaker, content images should be uploaded first through
  that platform's upload API and then inserted into HTML with returned URLs.
- When publishing to Sologo, image cover inputs can be base64, public URL, or
  OSS path.
- For Sologo in-article images, prefer Sologo CDN URLs returned by
  `act=upload_image`; avoid SVG redirects and nested semantic wrappers that can
  conflict with the blog template CSS.
- For SologoAI, Logomaker, and Logosj, final article `content` must use complete
  element-level inline styles. External site CSS affects all three platforms,
  so explicitly control typography, spacing, lists, links, images, captions,
  tables, and callouts. Do not rely on classes, `<style>` blocks, inherited CSS,
  or bare semantic HTML.
- When publishing to Logosj WordPress, external images in content and featured
  image URLs are imported by the WordPress plugin.

## Workflows

1. Run the read-only preflight and rebuild the local publication index from all
   three live CMS APIs. Read the latest complete report under
   `reports/weekly-growth/`, especially
   `content-strategy.json`, before researching stories. Use its priority query
   clusters, conversion relevance, semantic gaps, and internal-link targets as
   selection evidence. If current news justifies a different direction, record
   the evidence for the deviation rather than silently ignoring the strategy.
2. Review the past week's relevant logo and brand identity news.
3. Rank candidates by brand familiarity, visual/strategic significance, search
   demand, and usefulness to logo creators.
4. Select at least 3 distinct topics. Publish each English Sologo article first;
   after it succeeds and is verified, localize the same story for both Chinese
   platforms. A normal weekly run therefore publishes at least 9 platform posts.
5. For Chinese posts, summarize and translate the facts, then add a short
   viewpoint and practical insight.
6. Prepare an image set for each article: cover, source/reference images, and
   optional comparison collage or analysis graphic.
7. For Sologo posts, write a broader English analysis with related examples,
   internal links, and generator-specific CTA.
8. Validate each post against its platform contract before publishing.
   For SologoAI, Logomaker, and Logosj, verify every layout-bearing element has
   complete inline rich-text styles.
9. Run an independent pre-publish audit on the exact final payloads after image
   URL substitution. Record reviewer/run ID, payload hashes, image-source
   hashes, per-platform findings, and PASS/FAIL in the weekly package. Any
   content, metadata, cover, image-order, or URL change invalidates PASS.
   Publication is blocked until every target passes.
10. Run the repository adapter in dry-run mode. An active schedule alone does
   not authorize live publication. Live mode additionally needs explicit local
   task authorization, the adapter's `--confirm-live` flag, and the remote
   single-executor lease. Continue independent safe work if one target fails
   and report partial failure without duplicating successful posts.
11. Report selected topics, image sources/assets, published URLs or draft IDs,
   and any skipped items.

Editorial variation requirements:

- Use article-specific headlines, hooks, headings, section order, examples, and
  CTA transitions; do not reuse one visible template across the weekly batch.
- Localize Chinese articles as native editorial writing rather than translating
  English paragraphs sentence by sentence.
- Treat platform cover/featured images as already rendered. The same source
  image must not reappear as the first body image or elsewhere in the body
  without a necessary analytical reason.

## Failure Modes

- Publishing copied or overly close translations of source articles instead of
  original summaries and analysis.
- Selecting low-recognition items when a better-known brand update is available.
- Missing CTA requirements or pointing to the wrong site.
- Publishing Sologo content before Sologo generator CTA URLs are inventoried.
- Forgetting Chinese platform differences: Logomaker tags are space-separated,
  while Logosj tags are arrays.
- Publishing bare semantic HTML to SologoAI, Logomaker, or Logosj and relying
  on external platform CSS to preserve the intended layout.
- Letting the automation publish live without a review gate if publishing code
  is not yet fully tested.
- Running direct platform create/publish requests outside the repository
  adapter, which bypasses the audit hash and single-executor lease.
- Using generated visuals as if they were official source images.
- Publishing image-heavy articles without adapting image handling to the target
  platform.

## Update Rules

- Add or remove news sources here when the weekly monitoring set changes.
- Maintain the Sologo generator URL inventory before enabling direct Sologo
  publishing.
- Record recurring schedule changes in automation settings, not in API
  contracts.
- Keep drafts, reports, rebuilt state, and result files machine-local; the live
  CMS is the canonical record for cross-computer handoff.

## Open Questions

- Which Sologo generator pages should be used as CTA targets?
- Should Chinese posts be identical across Logosj and Logomaker, or should each
  platform have slightly different intros and metadata?
