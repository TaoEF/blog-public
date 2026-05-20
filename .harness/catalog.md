# Harness Catalog

Map task types to workflows and wiki pages.

| Task type | Workflow | Knowledge |
| --- | --- | --- |
| Copy/string edit | Direct after root rules | Target file |
| Small local change | `.harness/workflows/small-change.md` | Relevant wiki page |
| Large/cross-domain change | `.harness/workflows/large-change.md` | Architecture, feature, contract, and decision pages |
| Project knowledge update | `.harness/workflows/wiki-update.md` | `.project-wiki/schema.md` |
| Review/handoff | `.harness/workflows/review-sync.md` | Relevant wiki pages |

## Project-Specific Routing

| Task type | Workflow | Knowledge |
| --- | --- | --- |
| Blog platform API change | `.harness/workflows/wiki-update.md` | `.project-wiki/contracts/*.md`, `BLOG_PUBLISHING.md` |
| Publishing adapter or CLI work | `.harness/workflows/large-change.md` | `.project-wiki/architecture/blog-publishing-system.md`, relevant API contracts |
| Blog writing workflow | `.harness/workflows/small-change.md` | `.project-wiki/features/blog-writing-and-publishing.md` |
| Scheduled blog task | `.harness/workflows/large-change.md` | `.project-wiki/decisions/skill-plus-automation.md` |
