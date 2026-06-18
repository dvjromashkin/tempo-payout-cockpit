export interface ReceiptRow {
  address: string
  amount: string
  memo: string
}

/** RFC4180-ish field escaping. */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * Build a downloadable receipt CSV: one line per recipient plus the token and
 * the (shared) transaction hash. Pure — the hash comes from the sent 0x76 tx.
 */
export function buildReceiptCsv(
  rows: ReceiptRow[],
  opts: { token: string; txHash: string | null },
): string {
  const header = ['address', 'amount', 'memo', 'token', 'tx_hash']
  const records = rows.map((r) => [
    r.address,
    r.amount,
    r.memo,
    opts.token,
    opts.txHash ?? '',
  ])
  return [header, ...records]
    .map((rec) => rec.map(csvField).join(','))
    .join('\r\n')
}

/** Trigger a browser download of CSV text (browser-only). */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
