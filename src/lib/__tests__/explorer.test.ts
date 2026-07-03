import { describe, expect, it } from 'vitest'
import {
  EXPLORER_BASE_URL,
  getTempoExplorerAccess,
  getTempoExplorerUrl,
  getTempoReceiptUrl,
} from '../explorer'

describe('Tempo explorer links', () => {
  it('keeps the explorer homepage link on the base URL', () => {
    expect(EXPLORER_BASE_URL).toBe('https://explore.testnet.tempo.xyz')
    expect(getTempoExplorerUrl()).toBe('https://explore.testnet.tempo.xyz')
  })

  it('uses the verified receipt route for transaction hashes', () => {
    const hash = '0x4bae6aaa117d00dfb47b9c0cfedaf80650ae6931aa0873f413a92574d7dc8fd9'
    const url = getTempoReceiptUrl(hash)

    expect(url).toBe(`${EXPLORER_BASE_URL}/receipt/${hash}`)
    expect(url).toContain('/receipt/')
    expect(url).not.toContain('/tx/')
    expect(url.endsWith(hash)).toBe(true)
  })

  it('exposes homepage plus best-effort receipt access without changing the hash', () => {
    const hash = '0xabc123'
    const access = getTempoExplorerAccess(hash)

    expect(access.txHash).toBe(hash)
    expect(access.explorerUrl).toBe('https://explore.testnet.tempo.xyz')
    expect(access.receiptUrl).toBe('https://explore.testnet.tempo.xyz/receipt/0xabc123')
    expect(Object.values(access).join(' ')).not.toContain('/tx/')
  })
})
