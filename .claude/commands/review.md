---
name: review
description: Engineering review of recent changes. No code edits, only findings.
---

Perform an independent engineering review.

CLAUDE.md is already loaded. Now pull in:
@PRD.md
@PLANNING.md

Inspect the latest unmerged changes (use `git diff` and `git status`).

Review for:
- Correctness bugs (especially money math: integer `parseUnits(_, 6)`, no floats).
- Hard-rule violations: any secret/key handling? broadcast without explicit confirm?
  CSV data treated as executable? → these are blocking.
- Tempo API misuse vs PLANNING.md (calls[] shape, memo bytes32, feeToken, chain id).
- Missing tests for changed behavior (csv/validation/calls/memo).
- Security: external input validation, error handling, no silent catch.
- Simplification opportunities and documentation drift.

Output a structured report (Blocking / Non-blocking / Follow-ups). Do not modify code.
If the `reviewer` subagent is configured, delegate an independent second pass to it.
