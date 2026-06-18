import { describe, expect, it } from 'vitest'
import { computePackageGate } from '../preview'

const ok = {
  connected: true,
  onModerato: true,
  errorCount: 0,
  totalRaw: 100n,
  balance: 1000n,
}

describe('computePackageGate', () => {
  it('allows a fully valid package', () => {
    const g = computePackageGate(ok)
    expect(g.canProceed).toBe(true)
    expect(g.reasons).toEqual([])
    expect(g.insufficient).toBe(false)
  })

  it('blocks when not connected', () => {
    const g = computePackageGate({ ...ok, connected: false })
    expect(g.reasons).toContain('not-connected')
    expect(g.canProceed).toBe(false)
  })

  it('blocks on the wrong network (only when connected)', () => {
    const g = computePackageGate({ ...ok, onModerato: false })
    expect(g.reasons).toContain('wrong-network')
    const disconnected = computePackageGate({ ...ok, connected: false, onModerato: false })
    expect(disconnected.reasons).toContain('not-connected')
    expect(disconnected.reasons).not.toContain('wrong-network')
  })

  it('blocks when there are row errors', () => {
    const g = computePackageGate({ ...ok, errorCount: 2 })
    expect(g.reasons).toContain('has-errors')
    expect(g.canProceed).toBe(false)
  })

  it('blocks when the total exceeds the balance', () => {
    const g = computePackageGate({ ...ok, totalRaw: 1000n, balance: 999n })
    expect(g.insufficient).toBe(true)
    expect(g.reasons).toContain('insufficient')
  })

  it('allows total equal to balance', () => {
    const g = computePackageGate({ ...ok, totalRaw: 1000n, balance: 1000n })
    expect(g.insufficient).toBe(false)
    expect(g.canProceed).toBe(true)
  })

  it('does not block on an unknown balance', () => {
    const g = computePackageGate({ ...ok, balance: null })
    expect(g.insufficient).toBe(false)
    expect(g.canProceed).toBe(true)
  })
})
