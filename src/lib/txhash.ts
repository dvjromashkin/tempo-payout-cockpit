import type { Hex } from 'viem'

/**
 * Best-effort tx-hash extraction across the documented `*Sync` result shapes
 * (`hash` / `transactionHash` / `receipt.transactionHash`). Returns undefined
 * for an unrecognized shape. The real shape is confirmed with a live tx.
 */
export function txHashOf(data: unknown): Hex | undefined {
  if (!data || typeof data !== 'object') return undefined
  const d = data as Record<string, unknown>
  if (typeof d.hash === 'string') return d.hash as Hex
  if (typeof d.transactionHash === 'string') return d.transactionHash as Hex
  const receipt = d.receipt
  if (receipt && typeof receipt === 'object') {
    const rh = (receipt as Record<string, unknown>).transactionHash
    if (typeof rh === 'string') return rh as Hex
  }
  return undefined
}
