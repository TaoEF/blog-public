# Blog Public

AI-assisted blog writing and publishing workspace for three platforms:

- Sologo Blog
- 标智客设计攻略
- Logosj WordPress

The durable publishing rules are tracked in `BLOG_PUBLISHING.md` and
`.project-wiki/`. Development process and AI agent routing live in `.harness/`.

## Current State

- Git repository initialized.
- Project AI Wiki harness installed.
- Three publishing API contracts verified on 2026-05-20.
- API keys are intentionally not committed.

## Secret Setup

Create a local `.env` file with:

```sh
SOLOGO_BLOG_API_KEY=
LOGOMAKER_DESIGN_SCHOOL_API_KEY=
LOGOSJ_WP_API_KEY=
```

Do not commit `.env` or real API keys.

## Verification

Run:

```sh
./scripts/check-project.sh
```

