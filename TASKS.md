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

## Milestone 4 — Batch preview (Phase 4) ✅
- [x] Preview: summary (token, count, total, fee token), recipient list, Σ-vs-balance check (Medium)
- [x] Proceed-gate: `computePackageGate` (pure) blocks on not-connected / wrong-network / errors / insufficient — 7 tests (Medium)
- [~] Fee (gas) estimate moved to Phase 5 — needs the assembled 0x76 tx + connected wallet

## Milestone 5 — Confirm → sign → broadcast (Phase 5) — built; live send pending wallet
- [x] `src/lib/calls.ts`: rows → `calls[]` (transfer / transferWithMemo via `Abis.tip20`) — 4 tests (Medium)
- [x] Confirmation screen `ConfirmDialog` with full package summary (Medium)
- [x] `useBatchPayout`: `useSendTransactionSync({ calls, feeToken })` — type-checks (feeToken+calls accepted) (Hard)
- [x] pending / success / error states + tx hash + explorer link (built) (Medium)
- [x] Unit tests for calls assembly (Medium)
- [~] LIVE broadcast verification + gas-limit chunking — pending a working wallet (user, tomorrow)

## Milestone 6 — Result + receipt + history (Phase 6) — built; live result pending wallet
- [x] Per-recipient result in confirm dialog + history, under tx hash with explorer links (Medium)
- [x] Downloadable CSV receipt (`buildReceiptCsv`, RFC4180 escaping) — 3 tests (Simple)
- [x] `src/lib/history.ts`: save/load/clear runs in localStorage (cap 50, corruption-safe) — 5 tests (Medium)
- [x] `HistoryCard` in card 4: past runs with re-downloadable receipts, clear history (Medium)
- [ ] Recipient directory (save/reuse) — optional, not built this pass (Medium)
- [~] Live result with a real tx hash — verified with a working wallet (user, tomorrow)

## Open questions to resolve during build
- [x] `useSendTransactionSync` accepts `feeToken` alongside `calls` — type-checks (build passes); runtime pending wallet
- [ ] Max N calls per `0x76` before gas-limit → chunk threshold? (needs live wallet; Phase 5 follow-up)
- [x] ABI accessor is `Abis.tip20` (lowercase) in installed `viem/tempo` — NOT `Abis.TIP20` (Phase 2)
- [x] Balance read: standard ERC-20 `balanceOf` via wagmi `useReadContract` works for TIP-20 (Phase 2)

## Backlog (post-MVP)
- [ ] Enable `noUncheckedIndexedAccess` in tsconfig and fix surfaced array-index spots (review follow-up).
- [ ] Component/integration test for the App-level send gate (proceed disabled on errors/insufficient).
- [ ] Spreadsheet import: `.xlsx` + `.xls` + `.ods` (decided 2026-06-19 — after core payouts).
      Reuse the format-agnostic validator: extract `buildResult(records: string[][])` from csv.ts,
      add a sheet front-end `parseSheet(file) -> records`. Library: SheetJS (current version from
      cdn.sheetjs.com — the npm `xlsx` is stale and has CVEs). Lazy-load via dynamic `import()` so
      CSV users don't pay the bundle cost. Read RAW/text cell values (Excel coerces addresses to
      scientific notation and strips leading zeros); per-row validation then flags bad cells.
      First sheet by default.
