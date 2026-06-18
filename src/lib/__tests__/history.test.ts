import { describe, expect, it } from 'vitest'
import { type KVStore, type RunRecord, clearRuns, loadRuns, saveRun } from '../history'

function fakeStore(): KVStore {
  const data = new Map<string, string>()
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v)
    },
    removeItem: (k) => {
      data.delete(k)
    },
  }
}

function run(id: string): RunRecord {
  return {
    id,
    ts: Number(id),
    tokenSymbol: 'AlphaUSD',
    tokenAddress: '0x20c0000000000000000000000000000000000001',
    feeTokenSymbol: 'AlphaUSD',
    count: 1,
    totalAmount: '1',
    txHash: `0x${id}`,
    status: 'success',
    rows: [{ address: '0xabc', amount: '1', memo: '' }],
  }
}

describe('history store', () => {
  it('returns an empty list initially', () => {
    expect(loadRuns(fakeStore())).toEqual([])
  })

  it('saves and reloads runs, newest first', () => {
    const store = fakeStore()
    saveRun(store, run('1'))
    saveRun(store, run('2'))
    const runs = loadRuns(store)
    expect(runs.map((r) => r.id)).toEqual(['2', '1'])
  })

  it('caps the log at 50 runs', () => {
    const store = fakeStore()
    for (let i = 0; i < 55; i++) saveRun(store, run(String(i)))
    const runs = loadRuns(store)
    expect(runs).toHaveLength(50)
    expect(runs[0].id).toBe('54') // newest kept
    expect(runs.some((r) => r.id === '0')).toBe(false) // oldest dropped
  })

  it('recovers from corrupt storage', () => {
    const store = fakeStore()
    store.setItem('tempo-payout:runs:v1', '{not json')
    expect(loadRuns(store)).toEqual([])
  })

  it('drops valid-JSON entries of the wrong shape', () => {
    const store = fakeStore()
    store.setItem('tempo-payout:runs:v1', JSON.stringify([1, 2, { id: 'x' }, run('5')]))
    const runs = loadRuns(store)
    expect(runs).toHaveLength(1)
    expect(runs[0].id).toBe('5')
  })

  it('clears the log', () => {
    const store = fakeStore()
    saveRun(store, run('1'))
    clearRuns(store)
    expect(loadRuns(store)).toEqual([])
  })
})
