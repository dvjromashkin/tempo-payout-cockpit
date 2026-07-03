import { erc20Abi, formatUnits } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { tempoModerato } from 'wagmi/chains'
import { ALPHA_USD } from '../../config/tokens'
import type { ParseResult } from '../../lib/csv'
import { groupDecimal, shortAddress } from '../../lib/format'
import { type GateReason, computePackageGate } from '../../lib/preview'

interface PreviewCardProps {
  result: ParseResult | null
  onProceed: () => void
}

/**
 * Package preview before signing: token, payout count, total, fee token, and a
 * balance/error gate. The actual confirmation + broadcast is Phase 5; here the
 * "proceed" button only reflects whether the package is ready.
 */
export function PreviewCard({ result, onProceed }: PreviewCardProps) {
  const { address, status, chainId } = useAccount()
  const onModerato = chainId === tempoModerato.id
  const connected = status === 'connected' && Boolean(address)

  const { data: rawBalance } = useReadContract({
    abi: erc20Abi,
    address: ALPHA_USD.address,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: tempoModerato.id,
    query: { enabled: Boolean(address) },
  })

  if (!result || result.validCount === 0) {
    return (
      <p className="muted">
        Upload CSV with valid rows above to see the Package preview.
      </p>
    )
  }

  const total = result.totalRaw
  const totalStr = groupDecimal(formatUnits(total, ALPHA_USD.decimals))
  const balanceStr =
    rawBalance !== undefined
      ? groupDecimal(formatUnits(rawBalance, ALPHA_USD.decimals))
      : null

  const gate = computePackageGate({
    connected,
    onModerato,
    errorCount: result.errorCount,
    totalRaw: total,
    balance: rawBalance ?? null,
  })
  const { insufficient, canProceed } = gate
  const blockers = gate.reasons.map((r) => reasonText(r, result.errorCount))

  return (
    <div className="preview">
      <div className="summary">
        <div className="stat">
          <span className="stat__label">Token</span>
          <span className="stat__value">{ALPHA_USD.symbol}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Payouts</span>
          <span className="stat__value">{result.validCount}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Total</span>
          <span className="stat__value">{totalStr}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Fee token</span>
          <span className="stat__value">{ALPHA_USD.symbol}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Balance</span>
          <span
            className={`stat__value${
              insufficient ? ' stat__value--err' : connected ? ' stat__value--ok' : ''
            }`}
          >
            {balanceStr ?? '-'}
          </span>
        </div>
      </div>

      <p className="muted preview__note">
        Gas is paid in {ALPHA_USD.symbol} with the same token; the wallet shows
        the final fee estimate before signing. Atomic batch: all {result.validCount}{' '}
        payouts go through in one transaction, or none do.
      </p>

      {result.errorCount > 0 && (
        <p className="status status--warn">
          The file has rows with errors ({result.errorCount}). The Atomic batch can
          be sent only after all rows are valid.
        </p>
      )}

      <details className="preview__list">
        <summary>Show recipients ({result.validCount})</summary>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Memo</th>
              </tr>
            </thead>
            <tbody>
              {result.validRows.map((row) => (
                <tr key={row.line}>
                  <td className="muted">{row.line}</td>
                  <td className="mono" title={row.address ?? undefined}>
                    {row.address ? shortAddress(row.address) : '-'}
                  </td>
                  <td>{row.amount}</td>
                  <td className="ellipsis" title={row.memo}>
                    {row.memo || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="preview__actions">
        <button
          className="btn btn--primary"
          type="button"
          disabled={!canProceed}
          title={canProceed ? undefined : blockers.join('; ')}
          onClick={onProceed}
        >
          Confirm payout
        </button>
        {blockers.length > 0 && (
          <ul className="blockers">
            {blockers.map((b) => (
              <li key={b} className="status status--warn">
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function reasonText(reason: GateReason, errorCount: number): string {
  switch (reason) {
    case 'not-connected':
      return 'Connect wallet'
    case 'wrong-network':
      return 'Switch to Moderato testnet'
    case 'has-errors':
      return `Fix rows with errors: ${errorCount}`
    case 'insufficient':
      return 'Insufficient AlphaUSD balance'
  }
}
