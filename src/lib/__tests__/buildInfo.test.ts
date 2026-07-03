import { describe, expect, it } from 'vitest'
import { formatBuildLabel, shortIdentifier } from '../buildInfo'

describe('build info', () => {
  it('prefers a Vercel commit SHA and shortens it', () => {
    expect(
      formatBuildLabel({
        vercelCommitSha: 'a1b2c3d4e5f607182930',
        viteBuildId: 'manual-build',
        packageVersion: '9.9.9',
      }),
    ).toBe('Build a1b2c3d')
  })

  it('falls back to a Vite build id', () => {
    expect(formatBuildLabel({ viteBuildId: 'public-beta' })).toBe('Build public-beta')
  })

  it('falls back to package.json version', () => {
    expect(formatBuildLabel({ packageVersion: '0.1.0' })).toBe('Build v0.1.0')
    expect(formatBuildLabel({ packageVersion: 'v1.2.3' })).toBe('Build v1.2.3')
  })

  it('uses local when no build information exists', () => {
    expect(formatBuildLabel({})).toBe('Build local')
  })

  it('keeps short identifiers intact', () => {
    expect(shortIdentifier('beta-1')).toBe('beta-1')
  })
})
