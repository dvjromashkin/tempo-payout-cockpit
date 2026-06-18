---
name: research
description: Research an external system/API/library. Update PLANNING.md with confirmed findings only.
---

Do NOT modify application code in this command.

Research target: $ARGUMENTS

CLAUDE.md is already loaded. Pull in @PRD.md and @PLANNING.md for context (the
"Verified Tempo API Reference" section is the source of truth to extend/correct).

Research steps:
1. Prefer official sources: docs.tempo.xyz, accounts.tempo.xyz, and the source repos
   (`wevm/viem`, `wevm/wagmi`, `tempoxyz/*`). Quote APIs verbatim.
2. Distinguish public API vs RPC vs UI-derived behavior.
3. Note version/SDK constraints; what is confirmed vs probable vs unknown.
4. Do NOT invent undocumented APIs. If unclear, say so.

Output:
- Structured research summary with verbatim signatures + source URLs.
- Proposed precise edits to PLANNING.md's API reference, marked confirmed/assumption.

If a `researcher` subagent exists, delegate the bulk of the work to keep context clean.
