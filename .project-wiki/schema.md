# Project Wiki Schema

## Entity Types

- `architecture`: system-level structure.
- `module`: source file, package, service, or subsystem ownership.
- `feature`: user-facing or domain behavior.
- `contract`: API, data, tool, schema, protocol, or integration contract.
- `decision`: durable design choice or policy.

## Required Frontmatter

```yaml
---
id: feature.example
type: feature
status: active
owners:
  - path/to/source
updated: 2026-01-01
sources:
  - path: docs/source.md
    status: current
related:
  - decision.example
confidence: high
---
```

## Source Status

- `current`: agrees with current code or active process.
- `historical`: useful background, not authoritative.
- `conflict`: disagrees with current truth.
- `needs-verification`: potentially useful but not checked.

## Required Sections

Every entity should include:

1. `Summary`
2. `Source Of Truth`
3. `Contracts`
4. `Workflows`
5. `Failure Modes`
6. `Update Rules`
7. `Open Questions`
