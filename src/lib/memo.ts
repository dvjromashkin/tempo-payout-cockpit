import { type Hex, fromHex, pad, stringToHex } from 'viem'

/** TIP-20 memo is a `bytes32` — at most 32 UTF-8 bytes. */
export const MEMO_MAX_BYTES = 32

/** Zero byte used as bytes32 padding. */
const NUL = String.fromCharCode(0)

/** UTF-8 byte length of a memo string (not JS string length). */
export function memoByteLength(memo: string): number {
  return new TextEncoder().encode(memo).length
}

/** True if the memo fits in a `bytes32` (<= 32 UTF-8 bytes). */
export function isMemoWithinLimit(memo: string): boolean {
  return memoByteLength(memo) <= MEMO_MAX_BYTES
}

/**
 * Encode a UTF-8 memo into a right-padded `bytes32` (string bytes in the
 * high-order positions, zero-padded after) — matching Tempo's Go/Python
 * examples and the Solidity/ethers bytes32-string convention. Throws if the
 * memo exceeds 32 bytes (callers must validate first). See PLANNING.md.
 */
export function encodeMemo(memo: string): Hex {
  if (!isMemoWithinLimit(memo)) {
    throw new Error(`memo exceeds ${MEMO_MAX_BYTES} bytes`)
  }
  return pad(stringToHex(memo), { size: MEMO_MAX_BYTES, dir: 'right' })
}

/**
 * Decode a `bytes32` memo back into a string. With right-padding the memo is
 * everything before the first zero byte.
 */
export function decodeMemo(value: Hex): string {
  return fromHex(value, 'string').split(NUL)[0]
}
