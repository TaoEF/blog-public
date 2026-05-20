# Harness Rules

## Source Of Truth Order

1. Current code behavior.
2. Explicit user instruction.
3. Harness rules.
4. Project wiki.
5. Historical docs.

## Production Risk Priorities

1. Backward compatibility is usually the highest risk.
2. Architecture mistakes are high risk.
3. Local, reversible issues are usually more tolerable.

## Progressive Development

Prefer the easiest valid step first. Keep one main variable changing at a time.

## Minimalism

Reuse existing components, helpers, flows, and styles when they fit. Do not add
new abstractions unless they reduce real complexity or are required.

## Surgical Changes

Every changed line should trace to the request, approved plan, compatibility
fix, or required verification/doc sync.

## Uncertainty

If material uncertainty remains after reading code and wiki, ask before encoding
the assumption into code or durable docs.
