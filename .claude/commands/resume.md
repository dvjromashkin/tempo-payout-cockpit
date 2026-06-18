---
name: resume
description: Resume the project in a fresh session. Reconcile docs vs code, propose next task.
---

You are resuming work on this project in a fresh session.

CLAUDE.md is already loaded. Now pull in:
@PRD.md
@PLANNING.md
@TASKS.md

Then inspect the repository state and produce a structured summary:

1. What is already implemented (with file references).
2. What is partially done.
3. What remains unfinished (map to TASKS.md milestones).
4. Whether code and docs have diverged. If so, list specific mismatches.
5. The single best next task to pick up, with justification.

Do NOT write any code yet. Output the summary first, then wait for my decision.
