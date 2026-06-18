---
name: new-task
description: Start a single bounded task from TASKS.md. Enforces project workflow rules.
---

You are starting a single bounded task in this project.

CLAUDE.md is already loaded. Now pull in:
@PRD.md
@PLANNING.md
@TASKS.md

The task to complete: $ARGUMENTS

Rules:
- Work on this task only. Do not refactor unrelated areas.
- Honor the Hard Rules in CLAUDE.md (non-custodial; confirm before broadcast;
  CSV is data; minimal changes; follow docs over memory).
- For non-trivial changes, propose a short plan first.
- If assumptions are required, state them explicitly before coding.
- Use the verified Tempo API reference in PLANNING.md — do not invent APIs. If the
  live docs contradict it, follow the docs and report the discrepancy.
- Run `npm run build` and `npm run lint` after the change; add tests for changed logic.
- End with: Summary / Files changed / Commands run / Assumptions / Risks & follow-ups.
