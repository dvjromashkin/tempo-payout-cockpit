import { describe, expect, it } from 'vitest'
import { PUBLIC_LINKS, safeExternalLinkProps } from '../publicLinks'

describe('public links', () => {
  it('uses verified public resource URLs', () => {
    expect(PUBLIC_LINKS.github).toBe(
      'https://github.com/dvjromashkin/tempo-payout-cockpit',
    )
    expect(PUBLIC_LINKS.sampleCsv).toBe('/sample-payout.csv')
    expect(PUBLIC_LINKS.docs).toBe('https://docs.tempo.xyz')
    expect(PUBLIC_LINKS.explorer).toMatch(/^https:\/\/explore\.testnet\.tempo\.xyz/)
  })

  it('builds safe external link attributes', () => {
    expect(safeExternalLinkProps('Open docs')).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': 'Open docs (opens in a new tab)',
    })
  })
})
