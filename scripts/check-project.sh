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
"

for path in $required_paths; do
  if [ ! -e "$path" ]; then
    echo "Missing required project path: $path" >&2
    exit 1
  fi
done

echo "Project harness and wiki checks passed."
