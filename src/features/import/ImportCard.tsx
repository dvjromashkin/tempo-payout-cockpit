import { useId, useState } from 'react'
import { formatUnits } from 'viem'
import { ALPHA_USD } from '../../config/tokens'
import { type ParseResult, parseCsv } from '../../lib/csv'
import { groupDecimal, shortAddress } from '../../lib/format'

interface ImportCardProps {
  result: ParseResult | null
  fileName: string | null
  onResult: (result: ParseResult | null, fileName: string | null) => void
}

export function ImportCard({ result, fileName, onResult }: ImportCardProps) {
  const inputId = useId()
  const [readError, setReadError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setReadError(null)
    try {
      const text = await file.text()
      onResult(parseCsv(text), file.name)
    } catch (e) {
      setReadError(e instanceof Error ? e.message : 'Не удалось прочитать файл')
      onResult(null, null)
    }
  }

  return (
    <div className="import">
      <div className="import__controls">
        <label htmlFor={inputId} className="btn btn--primary">
          Выбрать CSV
        </label>
        <input
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = '' // allow re-selecting the same file
          }}
        />
        {fileName && <span className="muted">{fileName}</span>}
        {result && (
          <button
            className="btn btn--ghost btn--sm"
            type="button"
            onClick={() => onResult(null, null)}
          >
            Очистить
          </button>
        )}
      </div>

      <p className="import__hint muted">
        Колонки: <code>address, amount, memo</code> (заголовок и memo
        опциональны). Содержимое файла — данные: ничего не отправляется без
        вашего подтверждения.
      </p>

      {readError && <p className="status status--err">{readError}</p>}
      {result?.fileErrors.map((e) => (
        <p key={e} className="status status--err">
          {e}
        </p>
      ))}

      {result && result.rows.length > 0 && (
        <>
          <ImportSummary result={result} />
          <ImportTable result={result} />
        </>
      )}
    </div>
  )
}

function ImportSummary({ result }: { result: ParseResult }) {
  const total = groupDecimal(formatUnits(result.totalRaw, ALPHA_USD.decimals))
  return (
    <div className="summary">
      <Stat label="Строк" value={String(result.rows.length)} />
      <Stat
        label="Готовы"
        value={String(result.validCount)}
        tone={result.validCount > 0 ? 'ok' : undefined}
      />
      <Stat
        label="С ошибками"
        value={String(result.errorCount)}
        tone={result.errorCount > 0 ? 'err' : undefined}
      />
      <Stat
        label="Дубликаты"
        value={String(result.duplicateCount)}
        tone={result.duplicateCount > 0 ? 'warn' : undefined}
      />
      <Stat label={`Итого, ${ALPHA_USD.symbol}`} value={total} />
    </div>
  )
}

function ImportTable({ result }: { result: ParseResult }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Адрес</th>
            <th>Сумма</th>
            <th>Memo</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row) => {
            const tone =
              row.errors.length > 0 ? 'err' : row.warnings.length > 0 ? 'warn' : 'ok'
            return (
              <tr key={row.line} className={`row row--${tone}`}>
                <td className="muted">{row.line}</td>
                <td className="mono" title={row.address ?? undefined}>
                  {row.address ? shortAddress(row.address) : '—'}
                </td>
                <td>{row.amount ?? '—'}</td>
                <td className="ellipsis" title={row.memo}>
                  {row.memo || '—'}
                </td>
                <td>
                  {tone === 'ok' && (
                    <span className="status status--ok">
                      <span className="dot dot--ok" /> ок
                    </span>
                  )}
                  {row.errors.map((m) => (
                    <div key={m} className="status status--err">
                      {m}
                    </div>
                  ))}
                  {row.warnings.map((m) => (
                    <div key={m} className="status status--warn">
                      {m}
                    </div>
                  ))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'ok' | 'err' | 'warn'
}) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <span className={`stat__value${tone ? ` stat__value--${tone}` : ''}`}>
        {value}
      </span>
    </div>
  )
}
