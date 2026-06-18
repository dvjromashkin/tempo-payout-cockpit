# Tempo Payout Cockpit

A **non-custodial** web dApp for mass stablecoin payouts on the **Tempo** blockchain:
upload a CSV of recipients and pay all of them in **one atomic Tempo Transaction
(type `0x76`)**, signed by your connected wallet. MVP targets the **Moderato testnet
(chainId 42431)** with the **AlphaUSD** stablecoin.

> Non-custodial by design: private keys/seed are never requested, stored, or logged.
> Signing happens only in your wallet. Nothing from a CSV executes without an explicit
> confirmation screen.

## Stack

React 19 · Vite 8 · TypeScript 6 · wagmi 3 · viem 2 (`viem/tempo`, `wagmi/tempo`) ·
Tempo Accounts SDK (`accounts`) · TanStack Query 5. No backend — recipient directory
and run history live in `localStorage`.

## Prerequisites

- Node.js **≥ 22.13** recommended (22.12 works but emits EBADENGINE warnings from eslint).
- A Tempo Wallet. Fund a test account via the faucet:
  ```bash
  curl -X POST https://docs.tempo.xyz/api/faucet \
    -H "Content-Type: application/json" -d '{"address": "<your_address_lowercase>"}'
  ```

## Getting started

```bash
npm install      # .npmrc pins legacy-peer-deps (required — see note below)
npm run dev      # HTTPS dev server at https://localhost:5173 (mkcert)
```

First `npm run dev` is slow: `vite-plugin-mkcert` downloads its helper and installs a
local CA to issue a trusted dev certificate. Subsequent runs are fast.

### Scripts

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server over HTTPS |
| `npm run build` | `tsc -b` typecheck + production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |

> **Why `.npmrc` sets `legacy-peer-deps=true`:** the `accounts` package declares
> optional peer deps (Privy, Expo, React Native) that crash npm's default resolver
> ("Cannot read properties of null (reading 'edgesOut')"). Legacy resolution avoids
> the crash and does not pull in those unused peers.

## Project structure

```
src/                 React app (see PLANNING.md for the target layout)
CLAUDE.md            Project memory — auto-loaded by Claude Code each session
PRD.md               Product requirements
PLANNING.md          Architecture + the Verified Tempo API Reference (Phase 0)
TASKS.md             Milestones / task status
.claude/commands/    Slash commands: /new-task /resume /review /research
.claude/agents/      Subagents: researcher, reviewer
```

## Development workflow (Claude Code)

`CLAUDE.md` is auto-loaded at session start. Available commands:

- `/new-task <task from TASKS.md>` — start one bounded task under the project rules.
- `/resume` — reconcile docs vs code and propose the next task in a fresh session.
- `/review` — independent review of the current diff (no edits).
- `/research <target>` — research a Tempo API and propose precise PLANNING.md updates.

Each phase ships as a small commit; verify before moving on.

## Network

Moderato testnet · chainId `42431` · RPC `https://rpc.moderato.tempo.xyz` ·
explorer `https://explore.testnet.tempo.xyz`. See PLANNING.md for the full,
source-verified API reference (tokens, batch tx format, memo encoding, fee token).
