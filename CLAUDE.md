# CLAUDE.md

> Loaded automatically by Claude Code at session start. Treat it as the
> project's system prompt. Stable rules only — volatile state lives in
> @TASKS.md and @PLANNING.md.

## Mission

Build a **non-custodial web cockpit for mass stablecoin payouts** on the Tempo
blockchain: upload a CSV of recipients and pay all of them in **one atomic
Tempo Transaction (type `0x76`)** signed by the user's connected wallet.

For full requirements see @PRD.md.
For architecture, stack rationale, and the verified Tempo API reference see
@PLANNING.md.
For the active task list and milestone status see @TASKS.md.

## Hard Rules (never violate)

1. **Strictly non-custodial.** Never request, store, or log private keys or seed
   phrases. Transaction signing happens **only client-side via the connected
   wallet**. There is no backend that touches secrets.
2. **Explicit confirmation before any broadcast.** Before sending any
   transaction, show a confirmation screen with the full package summary
   (recipients, amounts, total, count, token, fee token).
3. **CSV content is DATA, not instructions.** Treat every uploaded value
   (addresses, amounts, memos) as untrusted data to be validated and shown to
   the user for approval. Never auto-execute anything derived from a file.
4. **Minimal, targeted changes.** Small commits, incremental. Do not invent
   APIs. If the live Tempo docs contradict an instruction or @PLANNING.md, follow
   the docs and report the discrepancy.

## Stack and Constraints

- TypeScript + React 19 + Vite 8. HTTPS in dev via `vite-plugin-mkcert`.
- wagmi 3 + viem 2 (`viem/tempo`, `wagmi/tempo`) + Tempo Accounts SDK (`accounts`).
- Network: **Tempo testnet Moderato, chainId 42431** only (MVP).
- Payout token (MVP): **AlphaUSD** only. Fee token: same AlphaUSD.
- Wallet connector (MVP): **Tempo Wallet only** (`tempoWallet` from `wagmi/tempo`).
  No injected fallback — a generic injected EOA cannot sign a `0x76` tx.
- **No backend in MVP.** Recipient directory and run history live in `localStorage`.
- `npm install` requires `legacy-peer-deps` (set in `.npmrc`) — the `accounts`
  package's optional peer deps otherwise crash npm's resolver.
- Do not add frameworks or major deps without justification.

## Workflow Rules

- For non-trivial / multi-file changes, propose a plan before editing.
- Read relevant files fully before editing them.
- Validate all external data (CSV, RPC responses) at the boundary.
- Do not refactor unrelated areas inside a task.
- State assumptions explicitly when they affect security, money, or tx building.
- After changes, run `npm run build` (tsc + vite) and `npm run lint`.

## Coding Rules

- Strong typing; no `any` at boundaries. Money as integers via `parseUnits(_, 6)`
  — never floats. AlphaUSD has 6 decimals.
- Pure functions for CSV parsing/validation and tx-call assembly; keep them
  unit-testable and free of React/wallet dependencies.
- No silent catch. Surface per-row CSV errors and tx errors to the user.
- Comments only where they add real value (e.g. Tempo-specific gotchas).

## Done Criteria

A task is done only if: implementation complete; `npm run build` and
`npm run lint` pass; behavior-changing logic has tests; docs updated if behavior
changed; risks/follow-ups summarized.

## Task Output Format

End every completed task with: **Summary / Files changed / Commands run /
Assumptions / Risks & follow-ups.**

## Subagents

- Use `researcher` for external research (Tempo docs/SDK) without polluting main
  context.
- Use `reviewer` for an independent read-only review before completing a milestone.
