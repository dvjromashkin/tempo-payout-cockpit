import { useState } from 'react'
import { formatReceiptDownloadError } from '../../lib/errors'
import { txExplorerUrl } from '../../lib/explorer'
import { groupDecimal } from '../../lib/format'
import type { RunRecord } from '../../lib/history'
import { safeExternalLinkProps } from '../../lib/publicLinks'
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
        Прогонов пока нет. После успешной отправки пакет появится здесь с
        квитанцией.
      </p>
    )
  }

  return (
    <div className="history">
      <div className="history__head">
        <span className="muted">Сохранено локально в этом браузере: {runs.length}</span>
        <button className="btn btn--ghost btn--sm" type="button" onClick={onClear}>
          Очистить историю
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
                {run.status === 'success' ? 'успех' : 'ошибка'}
              </span>
            </div>
            <div className="history__row muted">
              {run.count} выплат · {groupDecimal(run.totalAmount)} {run.tokenSymbol}
            </div>
            {run.txHash && (
              <div className="history__row mono history__hash">
                <a
                  href={txExplorerUrl(run.txHash)}
                  {...safeExternalLinkProps('Open transaction in Tempo Moderato explorer')}
                >
                  {run.txHash}
                </a>
              </div>
            )}
            <button
              className="btn btn--ghost btn--sm"
              type="button"
              onClick={() => downloadRunReceipt(run)}
            >
              Скачать квитанцию
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
