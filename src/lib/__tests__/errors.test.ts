import { describe, expect, it } from 'vitest'
import {
  formatPayoutError,
  formatReadError,
  formatReceiptDownloadError,
  formatWalletError,
} from '../errors'

describe('user-facing error formatting', () => {
  it('formats regional wallet blocks without raw details', () => {
    expect(formatWalletError(new Error('HTTP 451 Unavailable For Legal Reasons'))).toBe(
      'Tempo Wallet is unavailable in this region. Availability may vary by location.',
    )
  })

  it('uses viem-style shortMessage values', () => {
    expect(formatWalletError({ shortMessage: 'User rejected the request.' })).toBe(
      'Wallet connection was cancelled.',
    )
  })

  it('formats rejected signatures as no-submit outcomes', () => {
    expect(formatPayoutError(new Error('User rejected the request'))).toBe(
      'Signature was rejected in Tempo Wallet. No transaction was submitted.',
    )
  })

  it('formats on-chain failures as atomic failures', () => {
    expect(formatPayoutError(new Error('execution reverted'))).toBe(
      'The atomic batch failed on-chain. No recipients were paid.',
    )
  })

  it('formats payout RPC failures as connectivity failures', () => {
    expect(formatPayoutError(new Error('HTTP request failed'))).toBe(
      'Network or RPC request failed. Check connectivity and try again.',
    )
  })

  it('uses nested causes without exposing internal objects', () => {
    expect(formatPayoutError({ cause: new Error('execution reverted') })).toBe(
      'The atomic batch failed on-chain. No recipients were paid.',
    )
  })

  it('formats balance read failures', () => {
    expect(formatReadError(new Error('fetch failed'))).toBe(
      'Could not read the AlphaUSD balance. Check connectivity and retry.',
    )
  })

  it('formats receipt download failures', () => {
    expect(formatReceiptDownloadError(new Error('permission denied'))).toBe(
      'Receipt download was blocked by the browser. Check download permissions.',
    )
  })
})
