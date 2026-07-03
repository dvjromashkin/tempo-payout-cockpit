import { describe, expect, it, vi } from 'vitest'
import { copyHashAndOpenTempoExplorer, copyTransactionHash } from '../explorerActions'

const HASH = '0x4bae6aaa117d00dfb47b9c0cfedaf80650ae6931aa0873f413a92574d7dc8fd9'

describe('explorer actions', () => {
  it('copies the exact transaction hash', async () => {
    const writeText = vi.fn(async () => {})

    await expect(copyTransactionHash(HASH, { clipboard: { writeText } })).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith(HASH)
  })

  it('copies the hash and opens the explorer homepage', async () => {
    const writeText = vi.fn(async () => {})
    const open = vi.fn(() => ({}))

    await expect(
      copyHashAndOpenTempoExplorer(HASH, { clipboard: { writeText }, open }),
    ).resolves.toEqual({ copied: true, opened: true })

    expect(writeText).toHaveBeenCalledWith(HASH)
    expect(open).toHaveBeenCalledWith(
      'https://explore.testnet.tempo.xyz',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('still opens the explorer homepage if clipboard access fails', async () => {
    const writeText = vi.fn(async () => {
      throw new Error('blocked')
    })
    const open = vi.fn(() => ({}))

    await expect(
      copyHashAndOpenTempoExplorer(HASH, { clipboard: { writeText }, open }),
    ).resolves.toEqual({ copied: false, opened: true })

    expect(writeText).toHaveBeenCalledWith(HASH)
    expect(open).toHaveBeenCalledWith(
      'https://explore.testnet.tempo.xyz',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('still opens the explorer homepage if clipboard throws synchronously', async () => {
    const writeText = vi.fn(() => {
      throw new Error('blocked')
    })
    const open = vi.fn(() => ({}))

    await expect(
      copyHashAndOpenTempoExplorer(HASH, { clipboard: { writeText }, open }),
    ).resolves.toEqual({ copied: false, opened: true })

    expect(open).toHaveBeenCalledWith(
      'https://explore.testnet.tempo.xyz',
      '_blank',
      'noopener,noreferrer',
    )
  })
})
