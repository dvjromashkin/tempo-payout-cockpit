import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { ALPHA_USD } from '../../config/tokens'
import { type PayoutInput, buildPayoutCalls } from '../../lib/calls'
import type { ParseResult } from '../../lib/csv'
import { groupDecimal, shortAddress } from '../../lib/format'
import { txHashOf, useBatchPayout } from './useBatchPayout'

// Path style for the Tempo testnet explorer — verify exact form with a real tx.
const EXPLORER_TX = 'https://explore.testnet.tempo.xyz/tx/'

interface ConfirmDialogProps {
  result: ParseResult
  onClose: () => void
}

/**
 * Explicit pre-broadcast confirmation (hard rule): shows the full package
 * summary, then signs ONE atomic 0x76 transaction in the wallet. Nothing is
 * sent until the user clicks "Подписать и отправить".
 */
export function ConfirmDialog({ result, onClose }: ConfirmDialogProps) {
  const { status: acctStatus } = useAccount()
  const payout = useBatchPayout()

  const inputs = useMemo<PayoutInput[]>(() => {
    const list: PayoutInput[] = []
    for (const row of result.validRows) {
      if (row.address && row.amountRaw !== null) {
        list.push({ address: row.address, amountRaw: row.amountRaw, memo: row.memo })
      }
    }
    return list
  }, [result])

  const calls = useMemo(() => buildPayoutCalls(ALPHA_USD.address, inputs), [inputs])
  const totalStr = groupDecimal(formatUnits(result.totalRaw, ALPHA_USD.decimals))

  const isPending = payout.status === 'pending'
  const isSuccess = payout.status === 'success'
  const isError = payout.status === 'error'
  const hash = txHashOf(payout.data)

  function close() {
    if (isPending) return
    payout.reset()
    onClose()
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
              Будет отправлено <strong>{inputs.length}</strong> выплат на сумму{' '}
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
                  {inputs.map((row, i) => (
                    <tr key={`${row.address}-${i}`}>
                      <td className="muted">{i + 1}</td>
                      <td className="mono" title={row.address}>
                        {shortAddress(row.address)}
                      </td>
                      <td>{groupDecimal(formatUnits(row.amountRaw, ALPHA_USD.decimals))}</td>
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
          </div>
        )}

        <div className="modal__actions">
          {!isSuccess && (
            <button
              className="btn btn--primary"
              type="button"
              disabled={isPending || acctStatus !== 'connected' || inputs.length === 0}
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
