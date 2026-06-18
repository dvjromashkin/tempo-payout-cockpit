import { describe, expect, it } from 'vitest'
import { txHashOf } from '../txhash'

describe('txHashOf', () => {
  it('reads a top-level hash', () => {
    expect(txHashOf({ hash: '0xabc' })).toBe('0xabc')
  })

  it('reads transactionHash', () => {
    expect(txHashOf({ transactionHash: '0xdef' })).toBe('0xdef')
  })

  it('reads receipt.transactionHash', () => {
    expect(txHashOf({ receipt: { transactionHash: '0x123' } })).toBe('0x123')
  })

  it('returns undefined for unrecognized or non-object input', () => {
    expect(txHashOf({ foo: 'bar' })).toBeUndefined()
    expect(txHashOf(null)).toBeUndefined()
    expect(txHashOf('0xabc')).toBeUndefined()
    expect(txHashOf(undefined)).toBeUndefined()
  })
})
