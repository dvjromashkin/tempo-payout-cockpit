import { describe, expect, it } from 'vitest'
import {
  MEMO_MAX_BYTES,
  decodeMemo,
  encodeMemo,
  isMemoWithinLimit,
  memoByteLength,
} from '../memo'

describe('memo', () => {
  it('encodes a short memo as a right-padded bytes32', () => {
    expect(encodeMemo('INV-12345')).toBe(
      '0x494e562d31323334350000000000000000000000000000000000000000000000',
    )
  })

  it('round-trips encode -> decode', () => {
    for (const m of ['INV-12345', 'a', 'payroll #42', 'X'.repeat(MEMO_MAX_BYTES)]) {
      expect(decodeMemo(encodeMemo(m))).toBe(m)
    }
  })

  it('handles an empty memo', () => {
    expect(memoByteLength('')).toBe(0)
    expect(decodeMemo(encodeMemo(''))).toBe('')
  })

  it('counts multi-byte UTF-8 by bytes, not chars', () => {
    expect(memoByteLength(String.fromCharCode(0xe9))).toBe(2) // é
    expect(memoByteLength(String.fromCharCode(0x20ac))).toBe(3) // €
  })

  it('accepts exactly 32 bytes and rejects 33', () => {
    expect(isMemoWithinLimit('X'.repeat(MEMO_MAX_BYTES))).toBe(true)
    expect(() => encodeMemo('X'.repeat(MEMO_MAX_BYTES))).not.toThrow()
    expect(isMemoWithinLimit('X'.repeat(MEMO_MAX_BYTES + 1))).toBe(false)
    expect(() => encodeMemo('X'.repeat(MEMO_MAX_BYTES + 1))).toThrow()
  })
})
