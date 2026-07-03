import { type Address, getAddress, isAddress, parseUnits } from 'viem'
import { MEMO_MAX_BYTES, memoByteLength } from './memo'

/** AlphaUSD (and all Tempo stablecoins) use 6 decimals. */
export const TOKEN_DECIMALS = 6

export interface ParsedRow {
  /** 1-based source line number in the original file. */
  line: number
  address: Address | null
  amount: string | null // normalized decimal string, e.g. "100.5"
  amountRaw: bigint | null // base units (6 decimals)
  memo: string
  errors: string[] // blocking problems
  warnings: string[] // non-blocking notices (e.g. duplicate)
}

export interface ParseResult {
  rows: ParsedRow[] // all data rows, in source order
  validRows: ParsedRow[] // rows with no errors (warnings allowed)
  fileErrors: string[] // file-level problems
  totalRaw: bigint // sum of valid rows' amountRaw
  validCount: number
  errorCount: number
  duplicateCount: number
}

const HEADER_TOKENS = new Set(['address', 'addr', 'wallet', 'recipient', 'to'])

/** Conservative header detection: only skip an obvious header, never a data row. */
function looksLikeHeader(fields: string[]): boolean {
  const first = (fields[0] ?? '').toLowerCase()
  if (HEADER_TOKENS.has(first)) return true
  return !isAddress(fields[0] ?? '') && /amount|value|sum/i.test(fields[1] ?? '')
}

/** Split a single CSV line into trimmed fields, honoring double-quoted fields. */
function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      fields.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  fields.push(cur)
  return fields.map((f) => f.trim())
}

function parseAmount(raw: string): {
  amount: string | null
  amountRaw: bigint | null
  error?: string
} {
  const s = raw.trim()
  if (!s) return { amount: null, amountRaw: null, error: 'empty amount' }
  if (!/^\d+(\.\d+)?$/.test(s)) {
    return { amount: null, amountRaw: null, error: 'amount: digits and decimal point only' }
  }
  const frac = s.split('.')[1] ?? ''
  if (frac.length > TOKEN_DECIMALS) {
    return {
      amount: null,
      amountRaw: null,
      error: `amount: maximum ${TOKEN_DECIMALS} decimal places`,
    }
  }
  const amountRaw = parseUnits(s, TOKEN_DECIMALS)
  if (amountRaw <= 0n) {
    return { amount: null, amountRaw: null, error: 'amount must be greater than 0' }
  }
  return { amount: s, amountRaw }
}

function validateRow(line: number, fields: string[]): ParsedRow {
  const errors: string[] = []
  const warnings: string[] = []

  if (fields.length < 2) {
    errors.push('expected columns: address, amount[, memo]')
  }
  if (fields.length > 3) {
    errors.push('too many columns (comma in memo? wrap the value in quotes)')
  }

  const rawAddress = fields[0] ?? ''
  const rawAmount = fields[1] ?? ''
  const memo = fields[2] ?? ''

  let address: Address | null = null
  if (!rawAddress) {
    errors.push('empty address')
  } else if (!isAddress(rawAddress)) {
    errors.push('invalid address')
  } else {
    address = getAddress(rawAddress)
  }

  const { amount, amountRaw, error: amountError } = parseAmount(rawAmount)
  if (amountError) errors.push(amountError)

  if (memo && memoByteLength(memo) > MEMO_MAX_BYTES) {
    errors.push(`memo > ${MEMO_MAX_BYTES} bytes (currently ${memoByteLength(memo)})`)
  }

  return { line, address, amount, amountRaw, memo, errors, warnings }
}

/**
 * Parse a CSV of payout rows. Input is untrusted DATA: every row is validated
 * and surfaced for review; nothing is executed here. Columns: address, amount,
 * memo (header row and memo are optional).
 */
export function parseCsv(text: string): ParseResult {
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  const lines = clean.split(/\r\n|\r|\n/)
  const rows: ParsedRow[] = []

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    if (rawLine.trim() === '') continue
    const fields = splitCsvLine(rawLine)
    if (rows.length === 0 && looksLikeHeader(fields)) continue
    rows.push(validateRow(i + 1, fields))
  }

  // Mark duplicate addresses (non-blocking warning).
  const counts = new Map<string, number>()
  for (const r of rows) {
    if (r.address) counts.set(r.address, (counts.get(r.address) ?? 0) + 1)
  }
  let duplicateCount = 0
  for (const r of rows) {
    if (r.address && (counts.get(r.address) ?? 0) > 1) {
      r.warnings.push('duplicate address in file')
      duplicateCount++
    }
  }

  const validRows = rows.filter((r) => r.errors.length === 0)
  const totalRaw = validRows.reduce((sum, r) => sum + (r.amountRaw ?? 0n), 0n)

  const fileErrors: string[] = []
  if (rows.length === 0) fileErrors.push('No payout rows in the file')

  return {
    rows,
    validRows,
    fileErrors,
    totalRaw,
    validCount: validRows.length,
    errorCount: rows.length - validRows.length,
    duplicateCount,
  }
}
