#!/usr/bin/env sh
set -eu

required_paths="
AGENTS.md
CODEX.md
CLAUDE.md
BLOG_PUBLISHING.md
API_USAGE.md
README.md
.harness/index.md
.harness/catalog.md
.project-wiki/index.md
.project-wiki/schema.md
.project-wiki/architecture/blog-publishing-system.md
.project-wiki/contracts/sologo-blog-api.md
.project-wiki/contracts/logomaker-design-school-api.md
.project-wiki/contracts/logosj-wordpress-api.md
.project-wiki/features/blog-writing-and-publishing.md
.project-wiki/features/sologo-blog-style-guide.md
.project-wiki/features/weekly-logo-news-publishing.md
.project-wiki/decisions/skill-plus-automation.md
.agents/skills/weekly-logo-news-publishing/SKILL.md
.agents/skills/weekly-logo-news-publishing/agents/openai.yaml
.agents/skills/weekly-logo-news-publishing/references/prepublish-audit.md
automations/README.md
automations/weekly-logo-news-publishing.prompt.md
automations/logo-blog-growth-strategy.prompt.md
scripts/weekly-preflight.mjs
scripts/rebuild-weekly-state.mjs
scripts/weekly-publish.mjs
scripts/weekly-executor-lock.mjs
"

for path in $required_paths; do
  if [ ! -e "$path" ]; then
    echo "Missing required project path: $path" >&2
    exit 1
  fi
done

node --test scripts/tests/weekly-workflow.test.mjs

echo "Project harness and wiki checks passed."
