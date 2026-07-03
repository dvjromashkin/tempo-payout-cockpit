import { useEffect, useMemo, useRef, useState } from 'react'
import { type Address, formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { ALPHA_USD } from '../../config/tokens'
import { TransactionExplorerActions } from '../shared/TransactionExplorerActions'
import { buildPayoutCalls } from '../../lib/calls'
import type { ParseResult } from '../../lib/csv'
import { formatPayoutError, formatReceiptDownloadError } from '../../lib/errors'
import { groupDecimal, shortAddress } from '../../lib/format'
import type { RunRecord } from '../../lib/history'
import { buildReceiptCsv, downloadCsv } from '../../lib/receipt'
import { txHashOf } from '../../lib/txhash'
import { useBatchPayout } from './useBatchPayout'

interface ConfirmDialogProps {
  result: ParseResult
  onClose: () => void
  onSuccess: (run: RunRecord) => void
}

interface Recipient {
  address: Address
  amountRaw: bigint
  amount: string
  memo: string
}

/**
 * Explicit pre-broadcast confirmation (hard rule): shows the full package
 * summary, then signs ONE atomic 0x76 transaction in the wallet. Nothing is
 * sent until the user clicks "Sign and send".
 */
export function ConfirmDialog({ result, onClose, onSuccess }: ConfirmDialogProps) {
  const { status: acctStatus } = useAccount()
  const payout = useBatchPayout()
  const savedRef = useRef(false)
  const [receiptError, setReceiptError] = useState<string | null>(null)

  const recipients = useMemo<Recipient[]>(() => {
    const list: Recipient[] = []
    for (const row of result.validRows) {
      if (row.address && row.amountRaw !== null && row.amount !== null) {
        list.push({
          address: row.address,
          amountRaw: row.amountRaw,
          amount: row.amount,
          memo: row.memo,
        })
      }
    }
    return list
  }, [result])

  const calls = useMemo(
    () =>
      buildPayoutCalls(
        ALPHA_USD.address,
        recipients.map((r) => ({ address: r.address, amountRaw: r.amountRaw, memo: r.memo })),
      ),
    [recipients],
  )

  const totalPlain = formatUnits(result.totalRaw, ALPHA_USD.decimals)
  const totalStr = groupDecimal(totalPlain)

  const isPending = payout.status === 'pending'
  const isSuccess = payout.status === 'success'
  const isError = payout.status === 'error'
  const hash = txHashOf(payout.data)

  // Record the run exactly once when the broadcast succeeds.
  useEffect(() => {
    if (!isSuccess || savedRef.current) return
    savedRef.current = true
    if (!hash) {
      console.warn(
        '[payout] transaction succeeded but no hash was found in the result; ' +
          'receipt and explorer link will be empty. Verify txHashOf against the live result shape.',
      )
    }
    onSuccess({
      id: String(Date.now()),
      ts: Date.now(),
      tokenSymbol: ALPHA_USD.symbol,
      tokenAddress: ALPHA_USD.address,
      feeTokenSymbol: ALPHA_USD.symbol,
      count: recipients.length,
      totalAmount: totalPlain,
      txHash: hash ?? null,
      status: 'success',
      rows: recipients.map((r) => ({ address: r.address, amount: r.amount, memo: r.memo })),
    })
  }, [isSuccess, onSuccess, recipients, totalPlain, hash])

  function close() {
    if (isPending) return
    payout.reset()
    onClose()
  }

  function downloadReceipt() {
    setReceiptError(null)
    try {
      const csv = buildReceiptCsv(
        recipients.map((r) => ({ address: r.address, amount: r.amount, memo: r.memo })),
        { token: ALPHA_USD.symbol, txHash: hash ?? null },
      )
      downloadCsv(`payout-${hash ?? 'receipt'}.csv`, csv)
    } catch (error) {
      setReceiptError(formatReceiptDownloadError(error))
    }
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Confirm payout"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modal__title">Confirm payout</h3>

        {!isSuccess && (
          <>
            <p className="modal__lead">
              This will send <strong>{recipients.length}</strong> payouts totaling{' '}
              <strong>
                {totalStr} {ALPHA_USD.symbol}
              </strong>{' '}
              in one Atomic batch (gas in {ALPHA_USD.symbol}). After signing and
              broadcast, it cannot be cancelled.
            </p>
            <div className="table-wrap modal__list">
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
                  {recipients.map((row, i) => (
                    <tr key={`${row.address}-${i}`}>
                      <td className="muted">{i + 1}</td>
                      <td className="mono" title={row.address}>
                        {shortAddress(row.address)}
                      </td>
                      <td>{groupDecimal(row.amount)}</td>
                      <td className="ellipsis" title={row.memo}>
                        {row.memo || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {isError && (
          <p className="status status--err modal__msg">
            {formatPayoutError(payout.error)}
          </p>
        )}

        {isSuccess && (
          <div className="modal__success">
            <p className="status status--ok">
              Done - the Atomic batch was sent in one transaction.
            </p>
            {hash && <TransactionExplorerActions txHash={hash} />}
            {receiptError && (
              <p className="status status--err modal__msg" role="alert">
                {receiptError}
              </p>
            )}
            <button className="btn btn--ghost" type="button" onClick={downloadReceipt}>
              Download receipt
            </button>
          </div>
        )}

        <div className="modal__actions">
          {!isSuccess && (
            <button
              className="btn btn--primary"
              type="button"
              disabled={isPending || acctStatus !== 'connected' || recipients.length === 0}
              onClick={() => payout.send(calls)}
            >
              {isPending ? 'Sending...' : isError ? 'Try again' : 'Sign and send'}
            </button>
          )}
          <button className="btn btn--ghost" type="button" disabled={isPending} onClick={close}>
            {isSuccess ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
