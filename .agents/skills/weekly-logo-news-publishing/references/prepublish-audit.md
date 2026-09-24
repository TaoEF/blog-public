# Independent pre-publish audit

Run this audit after non-publishing image uploads and after the exact final
payloads are ready, but before any create, update, or publish request.

Use a fresh subagent, separate review task, or isolated review run. The writer
must not approve the package they produced. Give the reviewer the raw payloads,
source notes, image manifest, and a contact sheet or rendered first-screen
preview rather than the writer's rationale.

Require a written `PASS` or `FAIL` for every article and platform. Store a
`prepublish-audit.json` in the local weekly package containing:

- timestamp and reviewer task/run ID;
- live-authorization reference;
- article key, platform, and title;
- SHA-256 of the exact serialized API payload;
- cover source SHA-256 and ordered body-image source SHA-256 values;
- checklist results, findings, and verdict.

Any later content, metadata, cover, image-order, or URL change invalidates the
verdict. Recompute and match the recorded payload hash immediately before the
publishing request.

The reviewer must check:

- article-specific title, hook, headings, order, examples, and conclusion;
- batch similarity against the current batch and recent live CMS/API results;
- natural Chinese localization rather than sentence-by-sentence translation;
- cover/body and near-duplicate image sequencing using source hashes;
- image truthfulness, attribution, captions, alt text, and useful placement;
- platform HTML, inline styles, metadata, CTA, limits, and URL domains;
- title and slug deduplication against live list APIs;
- the rendered first screen for duplicate hero imagery, empty space, repeated
  title, broken hierarchy, or broken images.

A `FAIL` blocks that payload until it is revised and independently re-audited.

## Machine-readable fields

The publish adapter requires an `entries` array. Every target entry must contain
`article_key`, `platform`, `reviewer_id`, `reviewed_at`, `payload_sha256`, and a
`verdict` equal to `PASS`. `payload_sha256` is the lowercase SHA-256 of the exact
bytes in the payload file, not a re-serialized JSON object. The matching
`manifest.json` format is documented in `automations/README.md`.
