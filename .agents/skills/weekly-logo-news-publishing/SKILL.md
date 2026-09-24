---
name: weekly-logo-news-publishing
description: Research, write, audit, publish, and verify the repository's recurring logo and brand-identity news articles.
---

# Weekly Logo News Publishing

Run the weekly editorial workflow for Sologo, Logosj, and Logomaker. Repository
rules define how to write and publish; the live platform APIs/CMS are canonical
for what has already been published.

## Load the relevant project context

Always read:

- `.project-wiki/features/weekly-logo-news-publishing.md`
- `.project-wiki/decisions/skill-plus-automation.md`

For Sologo writing, also read:

- `.project-wiki/features/sologo-blog-style-guide.md`
- `.project-wiki/contracts/sologo-blog-api.md`

Before preparing or sending a target-platform payload, read that platform's
contract under `.project-wiki/contracts/`.

For a scheduled run or a computer handoff, also read
`automations/README.md`. Use the repository scripts named there; do not copy an
old computer's automation configuration or memory.

Use the latest complete `reports/weekly-growth/*/content-strategy.json` when it
exists locally. Its absence on a fresh clone does not block the news workflow;
record the missing data and rank stories using verified current evidence.

## Workflow

1. Run `node scripts/weekly-preflight.mjs`, then rebuild the local live index
   with `node scripts/rebuild-weekly-state.mjs --output
   .weekly-logo-news/publications.json`. Treat those CMS/API results as the
   canonical publication record.
2. Research the last seven days of logo and brand-identity news from the source
   set in the weekly feature page plus official brand or agency sources.
3. Select at least three distinct, high-value stories. Reject duplicates by
   topic, title, slug, and live platform result.
4. Write each English Sologo article as original analysis. Derive its title,
   opening, headings, examples, order, and CTA transition from the actual case.
5. Build useful visuals from legitimate source evidence. Use image generation
   only for clearly supporting editorial imagery; never fabricate an official
   logo, campaign, package, or brand asset.
6. Upload images through non-publishing endpoints and build exact final
   payloads with platform URLs, metadata, inline-styled HTML, categories, tags,
   internal links, and CTA.
7. Run the independent audit in
   [references/prepublish-audit.md](references/prepublish-audit.md). A current
   `PASS` is required for every payload that may be published.
8. Validate the package with `node scripts/weekly-publish.mjs --package <path>
   --mode dry-run`. Publish only when the current task or locally configured
   automation has explicit live-publish authorization; then use `--mode live
   --confirm-live`. Never call platform create/publish endpoints around the
   adapter.
9. Verify every live URL, status, title, listing visibility, and retained image.
10. Record the run locally for diagnostics, but rely on the live CMS/API when a
    later run or another computer needs to reconstruct publication state.

## Non-negotiable safeguards

- Only one computer may run the live-publishing automation at a time.
- Every live run must acquire the repository adapter's remote Git lease. A
  paused task, executor name, or local lock file is not a substitute.
- Never treat a clone, schedule, or API credential as live-publish permission.
- Never publish a payload whose content, metadata, image order, cover, or URLs
  changed after its audit hash was recorded.
- Continue safe independent work after a partial failure, but do not recreate a
  post that already succeeded.
- Keep credentials in environment variables; never write or print their values.
- Keep `drafts/`, `reports/`, downloaded sources, previews, screenshots, and
  automation memory machine-local. Do not copy them into the repository merely
  to transfer the workflow.
- Do not commit rebuilt publication state. Another computer must reconstruct
  it from the CMS with the read-only state command.
