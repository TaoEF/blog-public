# Portable weekly automations

The repository owns the workflow; Codex automations are machine-local thin
triggers. Install both tasks from this directory on each executor instead of
copying `$CODEX_HOME/automations` or an old task memory file.

## Templates

| Task | Recommended schedule | Prompt |
| --- | --- | --- |
| Weekly logo news publishing | Monday 09:00, Asia/Shanghai | [`weekly-logo-news-publishing.prompt.md`](weekly-logo-news-publishing.prompt.md) |
| Logo blog growth strategy | Tuesday 10:00, Asia/Shanghai | [`logo-blog-growth-strategy.prompt.md`](logo-blog-growth-strategy.prompt.md) |

The Tuesday task is read-only against production systems. The Monday task
defaults to an audited dry run; live publication additionally requires the
repository gate described below.

## Install on another computer

1. Pull the repository and add its clone as a local Codex project. Do not copy
   a project ID or absolute path from another computer.
2. Configure the three API keys and a stable, non-secret executor name in the
   local environment:

   ```text
   SOLOGO_BLOG_API_KEY
   LOGOMAKER_DESIGN_SCHOOL_API_KEY
   LOGOSJ_WP_API_KEY
   WEEKLY_EXECUTOR_ID
   ```

3. Run `node scripts/weekly-preflight.mjs`. This performs only dependency,
   credential-presence, repository, remote-lock, and read-only list checks.
4. Create the Tuesday automation in the cloned project using its prompt file
   and the recommended local schedule. Run it once and confirm its output is
   under the ignored `reports/weekly-growth/` directory.
5. Create the Monday automation with its prompt file. Keep it in dry-run mode
   until a complete package passes the independent audit and
   `node scripts/weekly-publish.mjs --package <path> --mode dry-run`.
6. To transfer live ownership, pause the old computer's Monday automation,
   confirm `node scripts/weekly-executor-lock.mjs status` has no active lease,
   then enable live mode on the new computer. The adapter acquires the remote
   lock again for every live run.

The Codex app stores schedules, project selection, model, and notifications on
the local computer. Recreate those values from this document; never commit the
generated machine-local automation configuration.

## State and live-publish gate

The CMS APIs are canonical for published articles. Rebuild a portable local
index at any time:

```sh
node scripts/rebuild-weekly-state.mjs \
  --output .weekly-logo-news/publications.json
```

The output is deliberately ignored by Git. The dry run queries the same live
lists and rejects duplicate titles or Sologo slugs.

Live publication requires all of the following:

- `--mode live --confirm-live` on the adapter;
- a stable `WEEKLY_EXECUTOR_ID`;
- exact payload SHA-256 values with current independent `PASS` entries;
- successful live duplicate checks;
- an active lease acquired by an atomic push to
  `refs/heads/automation/weekly-logo-news-lock` on `origin`.

The lock branch keeps an append-only commit history of acquisition and release
events. A lease is released in `finally`, including after partial failure. Use
`WEEKLY_LOCK_REMOTE` or `WEEKLY_LOCK_REF` only when the repository administrator
has intentionally chosen another remote or ref.

## Weekly package contract

The publishing adapter consumes a machine-local package with:

```text
<package>/
  manifest.json
  prepublish-audit.json
  payloads/*.json
```

`manifest.json` uses `schema_version: 1`, a `week`, and `stories`. Each story
has a unique `key`, `source_url`, and `payloads` object containing `sologo`,
`logosj`, and `logomaker`. Every payload entry has a package-relative `file`
and lowercase SHA-256 `sha256`. The audit file follows the repository skill's
`references/prepublish-audit.md` contract.

Run `node scripts/weekly-publish.mjs --help` for exact commands. Uploading and
substituting image URLs happens before the audit; the adapter never changes an
audited payload.
