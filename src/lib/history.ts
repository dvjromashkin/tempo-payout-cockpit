const STORAGE_KEY = 'tempo-payout:runs:v1'
const MAX_RUNS = 50

export interface RunRow {
  address: string
  amount: string
  memo: string
}

export interface RunRecord {
  id: string
  ts: number // epoch ms
  tokenSymbol: string
  tokenAddress: string
  feeTokenSymbol: string
  count: number
  totalAmount: string // display string, e.g. "151.5"
  txHash: string | null
  status: 'success' | 'error'
  rows: RunRow[]
  error?: string
}

/** Minimal storage surface so the store is testable without a DOM. */
export interface KVStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/** Minimal shape check so corrupt-but-valid-JSON entries can't break render. */
function isRunRecord(value: unknown): value is RunRecord {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.ts === 'number' &&
    typeof r.totalAmount === 'string' &&
    typeof r.count === 'number' &&
    (r.status === 'success' || r.status === 'error') &&
    (r.txHash === null || typeof r.txHash === 'string') &&
    Array.isArray(r.rows)
  )
}

export function loadRuns(store: KVStore): RunRecord[] {
  const raw = store.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isRunRecord) : []
  } catch {
    return []
  }
}

/** Prepend a run (newest first), cap the log, persist, and return the new list. */
export function saveRun(store: KVStore, run: RunRecord): RunRecord[] {
  const runs = [run, ...loadRuns(store)].slice(0, MAX_RUNS)
  store.setItem(STORAGE_KEY, JSON.stringify(runs))
  return runs
}

export function clearRuns(store: KVStore): void {
  store.removeItem(STORAGE_KEY)
}
