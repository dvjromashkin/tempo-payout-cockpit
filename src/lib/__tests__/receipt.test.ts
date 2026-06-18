import { describe, expect, it } from 'vitest'
import { buildReceiptCsv } from '../receipt'

describe('buildReceiptCsv', () => {
  it('writes a header and one row per recipient with token + tx hash', () => {
    const csv = buildReceiptCsv(
      [
        { address: '0xabc', amount: '100', memo: 'INV-1' },
        { address: '0xdef', amount: '50.5', memo: '' },
      ],
      { token: 'AlphaUSD', txHash: '0xhash' },
    )
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('address,amount,memo,token,tx_hash')
    expect(lines[1]).toBe('0xabc,100,INV-1,AlphaUSD,0xhash')
    expect(lines[2]).toBe('0xdef,50.5,,AlphaUSD,0xhash')
  })

  it('escapes memos containing commas and quotes', () => {
    const csv = buildReceiptCsv(
      [{ address: '0xabc', amount: '1', memo: 'a,"b"' }],
      { token: 'AlphaUSD', txHash: '0xhash' },
    )
    expect(csv.split('\r\n')[1]).toBe('0xabc,1,"a,""b""",AlphaUSD,0xhash')
  })

  it('leaves tx_hash empty when the hash is null', () => {
    const csv = buildReceiptCsv(
      [{ address: '0xabc', amount: '1', memo: '' }],
      { token: 'AlphaUSD', txHash: null },
    )
    expect(csv.split('\r\n')[1]).toBe('0xabc,1,,AlphaUSD,')
  })
})
