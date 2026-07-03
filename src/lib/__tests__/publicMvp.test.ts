import { describe, expect, it } from 'vitest'
import { HOW_IT_WORKS_STEPS, PUBLIC_STATUS, SAFETY_NOTICE } from '../publicMvp'

describe('public MVP copy', () => {
  it('exposes the required public beta status', () => {
    expect(PUBLIC_STATUS.label).toBe('Moderato Testnet MVP')
    expect(PUBLIC_STATUS.supporting).toBe('AlphaUSD only · No real funds')
    expect(PUBLIC_STATUS.ariaLabel).toContain('No real funds')
  })

  it('keeps the safety notice concise and explicit', () => {
    expect(SAFETY_NOTICE.title).toBe('Experimental testnet software.')
    expect(SAFETY_NOTICE.lead).toBe(
      'Review every recipient, amount and memo before signing.',
    )
    expect(SAFETY_NOTICE.points).toEqual([
      'No private keys are requested or stored.',
      'Uploaded CSV data stays in this browser.',
      'Tempo Wallet signs; one atomic testnet transaction is submitted.',
    ])
  })

  it('keeps How it works to four steps', () => {
    expect(HOW_IT_WORKS_STEPS).toHaveLength(4)
  })
})
