# TASKS.md

Status legend: `[x]` done · `[~]` in progress · `[ ]` todo. One milestone ≈ one
phase ≈ one small commit. After each milestone, wait for user verification.

## Milestone 1 — Foundation ✅
- [x] Scaffold Vite + React + TS (strict), rename project (Simple)
- [x] HTTPS dev via `vite-plugin-mkcert`; verify dev server serves https (Simple)
- [x] Install deps: wagmi, viem, @tanstack/react-query, accounts; `.npmrc` legacy-peer-deps (Simple)
- [x] Base layout shell with non-custodial banner + phase placeholders (Simple)
- [x] Project operating files (CLAUDE/PRD/PLANNING/TASKS, commands, agents) (Simple)

## Milestone 2 — Wallet + balances (Phase 2)
- [ ] `src/config/wagmi.ts`: createConfig(tempoModerato + tempoWallet), providers in main.tsx (Medium)
- [ ] `src/config/tokens.ts`: AlphaUSD constant (address, decimals=6, symbol) (Simple)
- [ ] Connect / disconnect UI; show address + chain badge; wrong-network prompt (Medium)
- [ ] Read + display AlphaUSD balance (viem/tempo balance action or ERC-20 read) (Medium)
- [ ] Done: connect on Moderato, balance visible; build + lint pass

## Milestone 3 — CSV import + validation (Phase 3)
- [ ] `src/lib/csv.ts`: parse `address,amount,memo` (headers optional, BOM-safe) (Medium)
- [ ] Per-row validation: address, amount>0 & ≤6dp, memo ≤32 bytes, duplicates, Σ vs balance (Medium)
- [ ] `src/lib/memo.ts`: string ↔ bytes32 helpers (Simple)
- [ ] Import UI: file picker, per-row status table, clear errors; nothing executes (Medium)
- [ ] Unit tests for csv + memo (Medium)

## Milestone 4 — Batch preview (Phase 4)
- [ ] Preview: recipient table, total, count, token, fee token (Medium)
- [ ] Fee estimate (gas in AlphaUSD); block proceed if any invalid rows (Medium)

## Milestone 5 — Confirm → sign → broadcast (Phase 5)
- [ ] `src/lib/calls.ts`: rows → `calls[]` (transfer / transferWithMemo) (Medium)
- [ ] Confirmation screen with full package summary (Medium)
- [ ] `useSendTransactionSync({ calls, feeToken })`; verify feeToken+calls; gas-limit chunking (Hard)
- [ ] pending / success / error states (Medium)
- [ ] Unit tests for calls assembly (Medium)

## Milestone 6 — Result + receipt + history (Phase 6)
- [ ] Per-recipient result under tx hash; explorer links (Medium)
- [ ] Downloadable CSV receipt (address, amount, memo, txHash) (Simple)
- [ ] `src/lib/history.ts`: save runs to localStorage; list past runs (Medium)
- [ ] Recipient directory (save/reuse) in localStorage (Medium)

## Open questions to resolve during build
- [ ] Does `useSendTransactionSync` accept `feeToken` alongside `calls`? (Phase 5)
- [ ] Max N calls per `0x76` before gas-limit → chunk threshold? (Phase 5)
- [ ] Exact ABI accessor: `Abis.TIP20` vs `Abis.tip20` in installed `viem/tempo`? (Phase 2/5)
- [ ] Best balance read on Tempo: `viem/tempo` action vs plain ERC-20 `balanceOf`? (Phase 2)
