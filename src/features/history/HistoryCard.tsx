import { useState } from 'react'
import { TransactionExplorerActions } from '../shared/TransactionExplorerActions'
import { formatReceiptDownloadError } from '../../lib/errors'
import { groupDecimal } from '../../lib/format'
import type { RunRecord } from '../../lib/history'
import { buildReceiptCsv, downloadCsv } from '../../lib/receipt'

interface HistoryCardProps {
  runs: RunRecord[]
  onClear: () => void
}

/** Local-only history of payout runs (localStorage). No backend. */
export function HistoryCard({ runs, onClear }: HistoryCardProps) {
  const [receiptError, setReceiptError] = useState<string | null>(null)

  function downloadRunReceipt(run: RunRecord) {
    setReceiptError(null)
    try {
      downloadCsv(
        `payout-${run.txHash ?? run.id}.csv`,
        buildReceiptCsv(run.rows, { token: run.tokenSymbol, txHash: run.txHash }),
      )
    } catch (error) {
      setReceiptError(formatReceiptDownloadError(error))
    }
  }

  if (runs.length === 0) {
    return (
      <p className="muted">
        Run history is empty. After a successful payout, the Atomic batch appears
        here with a receipt.
      </p>
    )
  }

  return (
    <div className="history">
      <div className="history__head">
        <span className="muted">Saved locally in this browser: {runs.length}</span>
        <button className="btn btn--ghost btn--sm" type="button" onClick={onClear}>
          Clear history
        </button>
      </div>
      {receiptError && (
        <p className="status status--err" role="alert">
          {receiptError}
        </p>
      )}
      <ul className="history__list">
        {runs.map((run) => (
          <li key={run.id} className="history__item">
            <div className="history__row">
              <span className="history__when">{new Date(run.ts).toLocaleString()}</span>
              <span className={`status status--${run.status === 'success' ? 'ok' : 'err'}`}>
                {run.status === 'success' ? 'success' : 'error'}
              </span>
            </div>
            <div className="history__row muted">
              {run.count} payouts - {groupDecimal(run.totalAmount)} {run.tokenSymbol}
            </div>
            {run.txHash && <TransactionExplorerActions txHash={run.txHash} />}
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              onClick={() => downloadRunReceipt(run)}
            >
              Download receipt
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
