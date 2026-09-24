Use the repository skill `$weekly-logo-news-publishing` to run this week's logo
and brand-identity news workflow in the current project.

Start with `node scripts/weekly-preflight.mjs` and rebuild the live CMS index.
Treat the CMS results as canonical. Prepare a local weekly package, obtain the
independent audit required by the skill, and run the repository adapter in
`dry-run` mode.

Do not publish live merely because this automation ran. Live publication is
allowed only when this task's locally configured prompt explicitly adds live
authorization and instructs the adapter to use `--mode live --confirm-live`.
The adapter's remote single-executor lock and all audit/hash checks must still
pass. Report partial failures without recreating posts that already exist.
