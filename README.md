# Tempo Payout Cockpit

Live MVP: deployment pending

Tempo Payout Cockpit is an experimental, browser-only dApp for mass AlphaUSD
payouts on the Tempo Moderato testnet. Upload a CSV, review every recipient and
amount, then submit all valid payouts in one atomic Tempo transaction
(type `0x76`) signed by Tempo Wallet.

This is an unofficial, independent community project. It is not affiliated with
Tempo and is not suitable for real funds.

## Public MVP Status

- Network: Tempo Moderato testnet only, chainId `42431`.
- Token: AlphaUSD only, 6 decimals.
- Fee token: AlphaUSD.
- Wallet: Tempo Wallet only.
- Custody model: non-custodial, no backend, no private keys, no seed phrases.
- Data model: CSV files stay in the browser; run history is stored in
  `localStorage`.
- Telemetry: no analytics, tracking, remote logging, or data collection.

## What It Does

1. Upload a CSV payout list.
2. Review validation results, duplicates, memos, totals, and balance gates.
3. Connect Tempo Wallet and confirm the full package summary.
4. Sign and submit one atomic testnet transaction, then download a CSV receipt.

If the atomic transaction fails, no recipients are paid.

## Sample CSV

Download the included [sample-payout.csv](sample-payout.csv), or use this format:

```csv
address,amount,memo
0x70997970C51812dc3A010C7d01b50e0d17dc79C8,1.5,INV-1001
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,2,INV-1002
0x90F79bf6EB2c4f870365E785982E1f101E93b906,0.25,
```

Validation includes address format, positive AlphaUSD amounts with at most six
decimals, memo length up to 32 UTF-8 bytes, duplicate-address warnings, and total
amount vs wallet balance.

## Local Development

Prerequisites:

- Node.js `>=22.13`.
- Tempo Wallet access for runtime wallet testing.
- Testnet AlphaUSD for live Moderato testing.

Install and run:

```bash
npm install
npm run dev
```

`npm run dev` starts Vite over HTTPS using `vite-plugin-mkcert`, which is needed
locally for passkey/wallet secure-context behavior. The first run may install a
local development certificate.

Available scripts:

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run preview
```

`.npmrc` sets `legacy-peer-deps=true` because the `accounts` package declares
optional peer dependencies that break npm's default resolver in this project.

## Production Build

```bash
npm run build
npm run preview
```

The production build is a static Vite site in `dist`. There is no serverless
backend, database, or required runtime environment variable.

Build metadata displayed in the footer uses this priority:

1. Vercel commit SHA (`VERCEL_GIT_COMMIT_SHA`) when Vercel provides it.
2. `VITE_BUILD_ID` when set at build time.
3. `package.json` version as a fallback.

## Vercel Deployment

Use the standard Vite static deployment settings:

- Framework preset: Vite
- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Required environment variables: none

Do not add a backend, secrets, analytics, production/mainnet mode, or extra
wallet providers for this MVP. A `vercel.json` file is not required because the
app has no client-side routes that need a SPA fallback.

## Network References

- RPC: `https://rpc.moderato.tempo.xyz`
- Explorer: `https://explore.testnet.tempo.xyz`
- Tempo docs: `https://docs.tempo.xyz`
- AlphaUSD: `0x20c0000000000000000000000000000000000001`

The payout flow has previously been verified with a real three-recipient
Moderato testnet transaction:
[0x4bae...8fd9](https://explore.testnet.tempo.xyz/tx/0x4bae6aaa117d00dfb47b9c0cfedaf80650ae6931aa0873f413a92574d7dc8fd9).

## Current Limitations

- Experimental public testnet MVP only.
- AlphaUSD only; no production/mainnet support.
- Tempo Wallet only; generic injected EOA wallets are intentionally not offered
  because they cannot sign Tempo `0x76` batch transactions.
- Hosted Tempo Wallet availability may vary by region and can return HTTP 451.
  The app does not attempt to bypass regional restrictions.
- No backend, database, authentication, analytics, address book, spreadsheet
  import, token swapping, fee sponsorship changes, or chunking for very large
  batches.
- Local history can be cleared by the browser or user.

## Security Disclaimer

This software is experimental and intended only for Tempo Moderato testnet use.
Review every recipient, amount, and memo before signing. The app never asks for
private keys or seed phrases; signing happens through Tempo Wallet. Uploaded CSV
data remains local to the browser, but you are responsible for verifying the
data before submitting the transaction.

Do not use this MVP for real funds.

## Project Structure

```text
src/main.tsx                     Providers and app bootstrap
src/App.tsx                      Application shell and flow orchestration
src/config/                      Tempo wallet and token constants
src/features/                    Wallet, import, preview, send, history UI
src/lib/                         Pure CSV, memo, calls, receipt, history helpers
src/lib/__tests__/               Vitest unit tests
PRD.md                           Product requirements
PLANNING.md                      Architecture and verified Tempo API reference
TASKS.md                         Milestones and backlog
sample-payout.csv                Repository sample CSV
public/sample-payout.csv         Static sample CSV download for Vite/Vercel
```

## Reporting Bugs

Report bugs in the GitHub repository:
<https://github.com/dvjromashkin/tempo-payout-cockpit/issues>

Please include browser, region if relevant to wallet access, CSV shape, expected
result, actual result, and any public testnet transaction hash. Do not include
private keys, seed phrases, or sensitive recipient data.

## License

[MIT](LICENSE)
