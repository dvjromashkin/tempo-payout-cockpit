# Tempo Payout Cockpit

A **non-custodial** web dApp for mass stablecoin payouts on the **Tempo** blockchain:
upload a CSV of recipients and pay all of them in **one atomic Tempo Transaction
(type `0x76`)**, signed by your connected wallet. MVP targets the **Moderato testnet
(chainId 42431)** with the **AlphaUSD** stablecoin.

> Non-custodial by design: private keys/seed are never requested, stored, or logged.
> Signing happens only in your wallet. Nothing from a CSV executes without an explicit
> confirmation screen.

## Status

**MVP complete and verified live on Moderato.** A real 3-recipient payout went out as a
single atomic `0x76` transaction (receipt status `0x1`, gas paid in AlphaUSD):
[explore.testnet.tempo.xyz/tx/0x4bae…8fd9](https://explore.testnet.tempo.xyz/tx/0x4bae6aaa117d00dfb47b9c0cfedaf80650ae6931aa0873f413a92574d7dc8fd9).

## Why this exists

Tempo's batch primitive (the `0x76` `calls` vector) is exposed today only as a developer
code recipe, an agent/MCP tool, or B2B orchestration — there is no **human-operated**,
non-custodial UI for it. This fills that gap:

- **Atomic** — all N transfers settle in one `0x76` transaction, or none do (no partial-payout reconciliation).
- **Non-custodial, no backend** — signing happens in your wallet; the CSV, directory, and run history never leave the browser.
- **Operationally safe** — per-row CSV validation (checksum, ≤6-decimal amounts, 32-byte memos, duplicates), a Σ-vs-balance gate, and an explicit confirmation screen before any broadcast.
- **Auditable** — downloadable CSV receipt with the tx hash, plus a local run history.

## How it works

1. Connect the Tempo Wallet (passkey) on Moderato; see your AlphaUSD balance.
2. Upload a CSV (`address, amount, memo`) — every row is validated and shown for review.
3. Review the package preview (recipients, total, fee token) and the proceed gate.
4. Confirm → sign one atomic `0x76` batch in your wallet.
5. Download the receipt; the run is saved to a local history.

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

## Known limitations (MVP scope)

- **Testnet + AlphaUSD only**, single connector (**Tempo Wallet**). A generic injected EOA
  cannot sign a `0x76` transaction, so it is intentionally not offered.
- **Regional availability:** the hosted Tempo Wallet (`wallet.tempo.xyz`) is geo-restricted
  in some regions (HTTP 451). The chain/RPC/faucet/explorer stay reachable; only the wallet
  dialog is blocked. A region-independent connector (app-managed `webAuthn` passkeys) is the
  planned fix — see [TASKS.md](TASKS.md).
- **Batch size:** ~1,900 transfers fit one `0x76` on Moderato (block gas limit 500M, ~205k
  gas/transfer); a chunking warning above ~1,000 is on the backlog.
- Spreadsheet import (`.xlsx/.xls/.ods`) and a saved recipient directory are post-MVP (backlog).

## License

[MIT](LICENSE)
