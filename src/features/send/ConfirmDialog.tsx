import { useEffect, useMemo, useRef } from 'react'
import { type Address, formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { ALPHA_USD } from '../../config/tokens'
import { buildPayoutCalls } from '../../lib/calls'
import type { ParseResult } from '../../lib/csv'
import { groupDecimal, shortAddress } from '../../lib/format'
import type { RunRecord } from '../../lib/history'
import { buildReceiptCsv, downloadCsv } from '../../lib/receipt'
import { txHashOf, useBatchPayout } from './useBatchPayout'

// Path style for the Tempo testnet explorer — verify exact form with a real tx.
const EXPLORER_TX = 'https://explore.testnet.tempo.xyz/tx/'

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
 * sent until the user clicks "Подписать и отправить".
 */
export function ConfirmDialog({ result, onClose, onSuccess }: ConfirmDialogProps) {
  const { status: acctStatus } = useAccount()
  const payout = useBatchPayout()
  const savedRef = useRef(false)

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
    const csv = buildReceiptCsv(
      recipients.map((r) => ({ address: r.address, amount: r.amount, memo: r.memo })),
      { token: ALPHA_USD.symbol, txHash: hash ?? null },
    )
    downloadCsv(`payout-${hash ?? 'receipt'}.csv`, csv)
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Подтверждение пакета выплат"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modal__title">Подтверждение пакета выплат</h3>

        {!isSuccess && (
          <>
            <p className="modal__lead">
              Будет отправлено <strong>{recipients.length}</strong> выплат на сумму{' '}
              <strong>
                {totalStr} {ALPHA_USD.symbol}
              </strong>{' '}
              одной атомарной транзакцией (газ в {ALPHA_USD.symbol}). После подписи
              отменить нельзя.
            </p>
            <div className="table-wrap modal__list">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Адрес</th>
                    <th>Сумма</th>
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
                        {row.memo || '—'}
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
            Ошибка: {payout.error?.message ?? 'не удалось отправить транзакцию'}
          </p>
        )}

        {isSuccess && (
          <div className="modal__success">
            <p className="status status--ok">Готово — пакет отправлен одной транзакцией.</p>
            {hash && (
              <p className="mono modal__hash">
                tx:{' '}
                <a href={`${EXPLORER_TX}${hash}`} target="_blank" rel="noreferrer">
                  {hash}
                </a>
              </p>
            )}
            <button className="btn btn--ghost" type="button" onClick={downloadReceipt}>
              Скачать квитанцию (CSV)
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
              {isPending ? 'Отправка…' : isError ? 'Повторить' : 'Подписать и отправить'}
            </button>
          )}
          <button className="btn btn--ghost" type="button" disabled={isPending} onClick={close}>
            {isSuccess ? 'Закрыть' : 'Отмена'}
          </button>
        </div>
      </div>
    </div>
  )
}
