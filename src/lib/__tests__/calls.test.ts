import { decodeFunctionData } from 'viem'
import { Abis } from 'viem/tempo'
import { describe, expect, it } from 'vitest'
import { buildPayoutCalls } from '../calls'
import { encodeMemo } from '../memo'

const TOKEN = '0x20c0000000000000000000000000000000000001'
const A1 = '0x0000000000000000000000000000000000000001'
const A2 = '0x0000000000000000000000000000000000000002'

describe('buildPayoutCalls', () => {
  it('builds one call per row, in order, all to the token', () => {
    const calls = buildPayoutCalls(TOKEN, [
      { address: A1, amountRaw: 100n, memo: '' },
      { address: A2, amountRaw: 200n, memo: 'INV-1' },
    ])
    expect(calls).toHaveLength(2)
    expect(calls.every((c) => c.to === TOKEN)).toBe(true)
  })

  it('uses transfer for an empty memo (selector 0xa9059cbb)', () => {
    const [call] = buildPayoutCalls(TOKEN, [{ address: A1, amountRaw: 100n, memo: '' }])
    expect(call.data.startsWith('0xa9059cbb')).toBe(true)
    const decoded = decodeFunctionData({ abi: Abis.tip20, data: call.data })
    expect(decoded.functionName).toBe('transfer')
    expect(decoded.args).toEqual([A1, 100n])
  })

  it('uses transferWithMemo when a memo is present, encoding it as bytes32', () => {
    const [call] = buildPayoutCalls(TOKEN, [{ address: A2, amountRaw: 200n, memo: 'INV-1' }])
    const decoded = decodeFunctionData({ abi: Abis.tip20, data: call.data })
    expect(decoded.functionName).toBe('transferWithMemo')
    expect(decoded.args).toEqual([A2, 200n, encodeMemo('INV-1')])
  })

  it('returns an empty array for no rows', () => {
    expect(buildPayoutCalls(TOKEN, [])).toEqual([])
  })
})
