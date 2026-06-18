# SESSION_PROMPTS.md

> Mirrors the slash commands in `.claude/commands/`. In Claude Code, prefer the
> commands themselves: `/new-task`, `/resume`, `/review`, `/research`. This file is
> for reference and for use outside Claude Code.

## 1. New task — `/new-task <task name>`

You are starting a single bounded task in this project. CLAUDE.md is loaded; pull in
PRD.md, PLANNING.md, TASKS.md. Work on the given task only; honor the Hard Rules
(non-custodial; confirm before broadcast; CSV is data; minimal changes; follow docs
over memory). Propose a short plan for non-trivial changes; state assumptions; use the
verified Tempo API reference in PLANNING.md (don't invent APIs — if docs contradict it,
follow docs and report). Run `npm run build` + `npm run lint`; add tests for changed
logic. End with: Summary / Files changed / Commands run / Assumptions / Risks & follow-ups.

## 2. Resume session — `/resume`

Resuming in a fresh session. CLAUDE.md is loaded; pull in PRD.md, PLANNING.md, TASKS.md.
Inspect repo state and summarize: (1) implemented, (2) partial, (3) remaining (mapped to
TASKS.md), (4) doc/code divergences, (5) the single best next task with justification.
Do NOT write code yet — output the summary and wait.

## 3. Review — `/review`

Independent engineering review. CLAUDE.md loaded; pull in PRD.md, PLANNING.md. Inspect
`git diff` / `git status`. Review for: correctness (integer money math), Hard-rule
violations (secret handling, broadcast without confirm, CSV-as-executable → blocking),
Tempo API misuse vs PLANNING.md, missing tests, security, simplification, doc drift.
Output Blocking / Non-blocking / Follow-ups. No code edits; optionally delegate to the
`reviewer` subagent.

## 4. Research — `/research <target>`

Do not modify app code. Research the target against official Tempo sources and source
repos; quote APIs verbatim; distinguish confirmed/probable/unknown; don't invent APIs.
Output a structured summary with source URLs and propose precise edits to PLANNING.md's
Verified Tempo API Reference. Delegate the bulk to the `researcher` subagent to keep
context clean.
