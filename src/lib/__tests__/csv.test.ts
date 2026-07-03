import { describe, expect, it } from 'vitest'
import { parseCsv } from '../csv'

const A1 = '0x0000000000000000000000000000000000000001'
const A2 = '0x0000000000000000000000000000000000000002'

describe('parseCsv', () => {
  it('parses valid rows, checksums addresses, sums totals', () => {
    const r = parseCsv(`address,amount,memo\n${A1},100,INV-1\n${A2},50.5,`)
    expect(r.fileErrors).toEqual([])
    expect(r.rows).toHaveLength(2)
    expect(r.validCount).toBe(2)
    expect(r.errorCount).toBe(0)
    expect(r.rows[0].address?.toLowerCase()).toBe(A1)
    expect(r.rows[0].amount).toBe('100')
    expect(r.rows[0].amountRaw).toBe(100_000_000n)
    expect(r.rows[0].memo).toBe('INV-1')
    expect(r.rows[1].amountRaw).toBe(50_500_000n)
    expect(r.totalRaw).toBe(150_500_000n)
  })

  it('skips a header row but parses headerless files', () => {
    expect(parseCsv(`address,amount,memo\n${A1},1,`).rows).toHaveLength(1)
    const headerless = parseCsv(`${A1},1,memo`)
    expect(headerless.rows).toHaveLength(1)
    expect(headerless.rows[0].errors).toEqual([])
  })

  it('strips a BOM', () => {
    const r = parseCsv(`${String.fromCharCode(0xfeff)}${A1},1,`)
    expect(r.rows[0].address?.toLowerCase()).toBe(A1)
    expect(r.rows[0].errors).toEqual([])
  })

  it('flags an invalid address', () => {
    const r = parseCsv(`0x123,1,`)
    expect(r.rows[0].errors.some((e) => e.includes('address'))).toBe(true)
    expect(r.validCount).toBe(0)
  })

  it('treats a bad-address first row as data, not a header', () => {
    const r = parseCsv('0xBAD,100,memo')
    expect(r.rows).toHaveLength(1)
    expect(r.rows[0].errors.some((e) => e.includes('address'))).toBe(true)
  })

  it('rejects bad amounts', () => {
    const r = parseCsv([`${A1},-1,`, `${A2},0,`, `${A1},1.1234567,`, `${A2},abc,`].join('\n'))
    expect(r.rows[0].errors.length).toBeGreaterThan(0) // negative -> bad format
    expect(r.rows[1].errors.some((e) => e.includes('greater than 0'))).toBe(true)
    expect(r.rows[2].errors.some((e) => e.includes('decimal places'))).toBe(true)
    expect(r.rows[3].errors.length).toBeGreaterThan(0) // non-numeric
    expect(r.validCount).toBe(0)
  })

  it('flags a too-long memo (> 32 bytes)', () => {
    const r = parseCsv(`${A1},1,${'X'.repeat(33)}`)
    expect(r.rows[0].errors.some((e) => e.toLowerCase().includes('memo'))).toBe(true)
  })

  it('warns on duplicate addresses but keeps them valid', () => {
    const r = parseCsv(`${A1},1,\n${A1},2,`)
    expect(r.duplicateCount).toBe(2)
    expect(r.rows[0].warnings).toContain('duplicate address in file')
    expect(r.validCount).toBe(2)
    expect(r.totalRaw).toBe(3_000_000n)
  })

  it('errors on too many columns from an unquoted comma', () => {
    const r = parseCsv(`${A1},1,hello,world`)
    expect(r.rows[0].errors.some((e) => e.includes('too many columns'))).toBe(true)
  })

  it('supports a quoted memo containing a comma', () => {
    const r = parseCsv(`${A1},1,"hello, world"`)
    expect(r.rows[0].errors).toEqual([])
    expect(r.rows[0].memo).toBe('hello, world')
  })

  it('reports an empty file', () => {
    const r = parseCsv('\n  \n')
    expect(r.rows).toHaveLength(0)
    expect(r.fileErrors).toContain('No payout rows in the file')
  })
})
