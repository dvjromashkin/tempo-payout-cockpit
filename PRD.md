# Tempo Payout Cockpit — PRD

## Overview

A non-custodial web dApp for **mass stablecoin payouts** on the Tempo blockchain.
The operator connects a wallet, uploads a CSV of recipients (address, amount,
memo), reviews a full package summary, and pays everyone in **one atomic Tempo
Transaction (type `0x76`)**. After success the app produces a per-recipient
receipt and stores the run locally. MVP targets the **Moderato testnet (42431)**.

## Problem

Paying many recipients on-chain one-by-one is slow, error-prone, and produces N
separate transactions with N points of failure. Operators (payroll, grants,
airdrops, vendor payouts) need to pay a batch **atomically** — all succeed or
none do — with a clear pre-broadcast review and an auditable receipt, without
handing custody of keys to any service.

## Target Users

Finance/ops people running stablecoin payouts (payroll, grants, bounties,
vendor settlement) who hold their own Tempo wallet and want a safe, reviewable
batch-payment tool. Single operator per session; no multi-user/team features in MVP.

## Project Goal

Let a user go from "CSV of payees" to "one signed atomic batch payout + receipt"
in minutes, with zero custody risk and an explicit confirmation gate.

## MVP Scope

### 1. Wallet connection + balances
- Inputs: user clicks Connect → Tempo Wallet dialog.
- Outputs: connected address, AlphaUSD balance, network indicator (Moderato/42431).
- Edge cases: wrong network → prompt switch; disconnected state; balance refresh.

### 2. CSV import + validation
- Inputs: a `.csv` with columns `address, amount, memo` (memo optional).
- Outputs: a parsed, validated recipient list with per-row status.
- Validation: address format/checksum; `amount > 0` and ≤ 6 decimals; memo ≤ 32
  bytes UTF-8; duplicate-address detection; total vs balance.
- Edge cases: malformed rows, headers/no-headers, empty file, BOM, extra columns,
  total exceeds balance — all reported per-row with clear messages, nothing executed.

### 3. Batch preview
- Inputs: validated recipient list + selected token (AlphaUSD) + fee token.
- Outputs: recipient table, total amount, payout count, fee-token choice, fee
  estimate.
- Edge cases: rows with validation errors block proceeding; large N warning.

### 4. Confirm → sign → broadcast (one atomic batch)
- Inputs: confirmed package.
- Outputs: a single `0x76` transaction with N `transfer`/`transferWithMemo`
  calls, signed in the wallet and broadcast. Live pending/success/error states.
- Edge cases: user rejects in wallet; tx revert (atomic → nobody paid); gas-limit
  ceiling on large N → chunk into multiple atomic batches with explicit warning.

### 5. Result + receipt + history
- Outputs: per-recipient result under the tx hash; downloadable CSV receipt
  (address, amount, memo, tx hash, explorer link); run saved to local history.
- Edge cases: failed run recorded with error; receipt re-downloadable from history.

### 6. Recipient directory (local)
- Save/reuse recipients in `localStorage`; optional labels. Plain convenience layer.

## Out of Scope (v1)

Backend/database; gas sponsorship; scheduled payments; multisig; private/gated
areas; service fees; fiat off-ramp; enterprise key vaults; tokens other than
AlphaUSD; mainnet; injected/MetaMask connector; passkey (WebAuthn) connector.

## Data Sources

- Tempo RPC `https://rpc.moderato.tempo.xyz` (chainId 42431) — confirmed.
- Token list `https://tempoxyz.github.io/tempo-apps/42431/tokenlist.json` — confirmed.
- Faucet `POST https://docs.tempo.xyz/api/faucet` — confirmed.
- Explorer `https://explore.testnet.tempo.xyz` — confirmed.
- All on-chain via the connected wallet / viem public client. No third-party API.

## Non-Functional Requirements

- **Security:** non-custodial; no secret handling; CSV treated as untrusted data;
  explicit confirmation before broadcast; HTTPS in dev.
- **Correctness:** integer math for money (`parseUnits(_, 6)`); atomic batch
  semantics surfaced honestly to the user.
- **Reliability:** clear pending/success/error states; failures are recoverable
  and recorded.
- **Maintainability:** pure, tested parsing/validation/tx-assembly logic.

## Success Criteria

- [ ] Connect Tempo Wallet on Moderato; show address + AlphaUSD balance.
- [ ] Import a CSV; every invalid row is flagged with a precise reason; nothing executes.
- [ ] Preview shows recipients, total, count, token, fee token, fee estimate.
- [ ] Confirm screen shows full summary; signing happens in-wallet only.
- [ ] One atomic `0x76` batch pays all valid recipients; states are accurate.
- [ ] Receipt CSV with tx hash downloads; run appears in local history.

## Risks

- Gas-limit ceiling on N per `0x76` → may need chunking into multiple atomic batches.
- `feeToken` acceptance alongside `calls` in the wagmi hook — verify at integration.
- Exact `viem/tempo` ABI accessor name (`Abis.TIP20`) — verify against installed SDK.
- Tempo SDK is young (`accounts@0.14`) — APIs may shift; pin versions, re-verify on bump.
