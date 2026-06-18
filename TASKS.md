# TASKS.md

Status legend: `[x]` done · `[~]` in progress · `[ ]` todo. One milestone ≈ one
phase ≈ one small commit. After each milestone, wait for user verification.

## Milestone 1 — Foundation ✅
- [x] Scaffold Vite + React + TS (strict), rename project (Simple)
- [x] HTTPS dev via `vite-plugin-mkcert`; verify dev server serves https (Simple)
- [x] Install deps: wagmi, viem, @tanstack/react-query, accounts; `.npmrc` legacy-peer-deps (Simple)
- [x] Base layout shell with non-custodial banner + phase placeholders (Simple)
- [x] Project operating files (CLAUDE/PRD/PLANNING/TASKS, commands, agents) (Simple)

## Milestone 2 — Wallet + balances (Phase 2) ✅ (pending user runtime verification)
- [x] `src/config/wagmi.ts`: createConfig(tempoModerato + tempoWallet), providers in main.tsx (Medium)
- [x] `src/config/tokens.ts`: AlphaUSD constant (address, decimals=6, symbol) (Simple)
- [x] Connect / disconnect UI; show address + chain badge; wrong-network prompt (Medium)
- [x] Read + display AlphaUSD balance via ERC-20 `balanceOf` + `formatUnits(_, 6)` (Medium)
- [~] Done: connect on Moderato + balance visible — build + lint pass; on-chain connect to be
      verified by the user in a real browser (headless preview can't load the mkcert HTTPS dev)

## Milestone 3 — CSV import + validation (Phase 3) ✅
- [x] `src/lib/csv.ts`: parse `address,amount,memo` (headers optional, BOM-safe, quoted fields) (Medium)
- [x] Per-row validation: address (checksum), amount>0 & ≤6dp, memo ≤32 bytes, duplicates (warning) (Medium)
- [x] `src/lib/memo.ts`: string ↔ bytes32 helpers (right-pad, verified by test) (Simple)
- [x] Import UI: file picker, summary, per-row status table, clear errors; nothing executes (Medium)
- [x] Unit tests for csv + memo — 15 tests, all green (Medium)
- [~] Σ vs balance check moved to Phase 4 preview (needs the connected wallet balance)

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
- [x] ABI accessor is `Abis.tip20` (lowercase) in installed `viem/tempo` — NOT `Abis.TIP20` (Phase 2)
- [x] Balance read: standard ERC-20 `balanceOf` via wagmi `useReadContract` works for TIP-20 (Phase 2)
