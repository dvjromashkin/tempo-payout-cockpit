# Technical Planning

## Architecture

Single-page React app, **no backend**. Everything runs client-side:

```
Browser (React + Vite, HTTPS dev)
  ├─ wagmi + Tempo Wallet connector  ── connect / sign 0x76 tx
  ├─ viem public client (Moderato RPC) ── read balances, wait for receipts
  ├─ CSV parse + validate (pure TS)   ── untrusted data → validated rows
  ├─ tx-call assembly (pure TS)        ── rows → calls[] for one 0x76 tx
  └─ localStorage                      ── recipient directory + run history
        │
        ▼
  Tempo Moderato testnet (chainId 42431)
```

Signing is delegated entirely to the connected wallet. The app never holds keys.

## Chosen Stack

- **Frontend:** React 19 + Vite 8 + TypeScript 6 (strict).
- **Wallet/chain:** wagmi 3, viem 2 (`viem/tempo`, `wagmi/tempo`), `accounts` 0.14 (Tempo Accounts SDK), `@tanstack/react-query` 5.
- **Dev HTTPS:** `vite-plugin-mkcert`.
- **Storage:** browser `localStorage` (no DB).
- **Testing:** Vitest for pure logic (CSV parse/validate, call assembly, memo encoding).
- **Backend / Cache / Jobs:** none (MVP).

Installed versions (pinned in `package.json`): react ^19.2, vite ^8.0, typescript ~6.0,
wagmi ^3.6.17, viem ^2.52.2, @tanstack/react-query ^5.101, accounts ^0.14.9.

## Why This Stack

It is the exact stack the Tempo docs and example apps target. wagmi 3 + viem 2
ship native `/tempo` exports (connector, actions, chains, ABIs), so we don't fork
or hand-roll the `0x76` transaction format. No backend keeps the app strictly
non-custodial and trivially deployable as static files.

## Directory Structure (target)

```
src/
  main.tsx            # WagmiProvider + QueryClientProvider
  App.tsx             # layout shell + flow orchestration
  config/
    wagmi.ts          # createConfig: tempoModerato + tempoWallet
    tokens.ts         # AlphaUSD constant (address, decimals, symbol)
  lib/
    csv.ts            # parse + per-row validation (pure)
    calls.ts          # rows -> calls[] (transfer / transferWithMemo) (pure)
    memo.ts           # memo string <-> bytes32 (pure)
    history.ts        # localStorage run history + recipient directory
  features/
    wallet/           # connect, address, balances
    import/           # CSV upload + validation UI
    preview/          # package preview + confirm screen
    result/           # pending/success/error + receipt + history
  lib/__tests__/      # Vitest unit tests
```

## Data Model (localStorage)

- `recipients`: `{ address, label? }[]` — directory.
- `runs`: `{ id, ts, token, feeToken, count, total, txHash?, status, rows: {address, amount, memo, status}[] }[]`.

## Delivery Strategy (phases → commits)

1. **Foundation** — scaffold, HTTPS dev, layout shell. ✅ (Phase 1)
2. **Wallet** — wagmi config, connect, address + AlphaUSD balance. (Phase 2)
3. **CSV** — parse + validate with per-row errors. (Phase 3)
4. **Preview** — recipients, totals, count, fee token, estimate. (Phase 4)
5. **Batch** — assemble `calls[]`, confirm screen, sign, broadcast, states. (Phase 5)
6. **Receipt + history** — per-recipient result, CSV receipt, local history. (Phase 6)

## Risks and Mitigations

- **Gas-limit ceiling on N calls** → estimate; if over budget, chunk into multiple
  atomic `0x76` batches and warn the user (each batch stays all-or-nothing).
- **`feeToken` + `calls` together** in `useSendTransactionSync` → type-confirmed (build passes;
  `viem/_types/tempo/Transaction` carries both fields). Runtime confirmed with a live tx;
  fallback if needed: `client.fee.setUserTokenSync` to set the default before sending.
- **ABI accessor** is `Abis.tip20` (lowercase) — confirmed in the installed `viem/tempo`
  (NOT `Abis.TIP20`); transfer/transferWithMemo decode round-trip verified by tests.
- **Young SDK** (`accounts@0.14`) → versions pinned; re-verify the API reference below
  on any dependency bump.

---

# Verified Tempo API Reference (Phase 0)

> Confirmed against live docs + source: `wevm/viem`, `wevm/wagmi` (installed 3.6.17),
> on-chain `tempoxyz/tempo-std` `ITIP20.sol`, `tempoxyz/accounts` examples, and the
> live tokenlist JSON. Re-verify on dependency bumps. **Do not "remember" these —
> they are written down here precisely because memory is unreliable for them.**

## Network — Moderato testnet

| Property | Value |
|---|---|
| Chain export | `tempoModerato` (from `viem/chains` / `wagmi/chains`) |
| Chain ID | `42431` |
| RPC HTTP | `https://rpc.moderato.tempo.xyz` |
| RPC WS | `wss://rpc.moderato.tempo.xyz` |
| Native currency | `USD`, decimals `6` |
| Explorer | `https://explore.testnet.tempo.xyz` |

⚠️ In current viem, `tempoTestnet` is an **alias for `tempoModerato` (42431)** — NOT
the deprecated Andantino (42429). Import **`tempoModerato`** by name to avoid ambiguity.

## Tokens (tokenlist, all 6 decimals, chainId 42431)

Source: `https://tempoxyz.github.io/tempo-apps/42431/tokenlist.json`

| symbol | name | address |
|---|---|---|
| pathUSD | PathUSD | `0x20c0000000000000000000000000000000000000` |
| **alphaUSD** | **AlphaUSD** | **`0x20c0000000000000000000000000000000000001`** (MVP token) |
| betaUSD | BetaUSD | `0x20c0000000000000000000000000000000000002` |
| thetaUSD | ThetaUSD | `0x20c0000000000000000000000000000000000003` |
| USDC.e | Bridged USDC | `0x20c0000000000000000000009e8d7eb59b783726` |
| EURC.e | Bridged EURC | `0x20c000000000000000000000d72572838bbee59c` |

Note: token `name` is `AlphaUSD`, `symbol` is `alphaUSD`.

## Wallet config (wagmi)

`tempoWallet` is exported from **`wagmi/tempo`** (verified in installed wagmi 3.6.17:
`wagmi/tempo` re-exports `Actions`, `tempoWallet`, `webAuthn`, `dangerous_secp256k1`,
`Hooks` from `@wagmi/core/tempo`).

```ts
import { createConfig, http } from 'wagmi'
import { tempoModerato } from 'wagmi/chains'
import { tempoWallet } from 'wagmi/tempo'

export const config = createConfig({
  chains: [tempoModerato],
  connectors: [tempoWallet({ testnet: true })],
  multiInjectedProviderDiscovery: false,
  transports: { [tempoModerato.id]: http() },
})
```

Providers: `WagmiProvider` + `@tanstack/react-query` `QueryClientProvider`.

## Single transfer / transferWithMemo

On-chain interface (`ITIP20.sol`, authoritative):
```solidity
function transfer(address to, uint256 amount) external returns (bool);
function transferWithMemo(address to, uint256 amount, bytes32 memo) external;
event TransferWithMemo(address indexed from, address indexed to, uint256 amount, bytes32 indexed memo);
```
- `memo` is a **`bytes32`** (max 32 bytes). Encode: `pad(stringToHex(s), { size: 32 })`
  or `toHex(s, { size: 32 })` (viem left-pads). Decode: `fromHex(memo, 'string').replace(/\0/g, '')`.
- A `transferWithMemo` emits **both** the standard `Transfer` and `TransferWithMemo`.

## Batch — ONE atomic 0x76 transaction (the core)

Tempo Transaction = EIP-2718 type **`0x76`**, natively carrying `calls`. Protocol-level
`Call { to, value, input }`; at viem/wagmi level each call is `{ to, data }` where
`data` is ABI-encoded calldata. **Atomic: all calls succeed or all revert.** `calls`
must contain ≥ 1 element.

Assemble N payouts and submit via the connected wallet (non-custodial):
```ts
import { useSendTransactionSync } from 'wagmi'
import { encodeFunctionData, parseUnits, stringToHex, pad } from 'viem'
import { Abis } from 'viem/tempo'   // accessor is Abis.tip20 (lowercase) — confirmed in installed SDK

const ALPHA_USD = '0x20c0000000000000000000000000000000000001'

const calls = rows.map((r) => ({
  to: ALPHA_USD,
  data: r.memo
    ? encodeFunctionData({
        abi: Abis.tip20,
        functionName: 'transferWithMemo',
        args: [r.address, parseUnits(r.amount, 6), pad(stringToHex(r.memo), { size: 32 })],
      })
    : encodeFunctionData({
        abi: Abis.tip20,
        functionName: 'transfer',
        args: [r.address, parseUnits(r.amount, 6)],
      }),
}))

const { sendTransactionSync, isPending } = useSendTransactionSync()
sendTransactionSync({ calls, feeToken: ALPHA_USD })   // calls + feeToken both type-confirmed
```
`*Sync` variants wait for inclusion and return a receipt; non-`Sync` returns a hash.
One batch = **one tx hash**, all-or-nothing → "per-recipient result" = the rows settled
under that hash (not independent success/failure).

## Fee token (gas paid in stablecoin)

- Per-tx param `feeToken` (a token address). MVP: `feeToken = AlphaUSD` (same as payout).
- Persistent default: `await client.fee.setUserTokenSync({ token })`.
- Protocol: `fee_token` is a field of the `0x76` tx (orthogonal to `calls`).

## Faucet

```bash
curl -X POST https://docs.tempo.xyz/api/faucet \
  -H "Content-Type: application/json" -d '{"address": "<ADDR_lowercase>"}'
# or: cast rpc tempo_fundAddress <ADDR> --rpc-url https://rpc.moderato.tempo.xyz
```
Each request grants 1,000,000 units of pathUSD/AlphaUSD/BetaUSD/ThetaUSD.

## Protocol notes (reference, not used in MVP)

`0x76` struct also carries `fee_payer_signature` (sponsorship), `valid_before/valid_after`
(scheduled), `key_authorization` (access keys), `aa_authorization_list`. Sender signs
`keccak256(0x76 || rlp([...calls...]))`. Sponsorship/scheduled/access-keys are out of scope.
