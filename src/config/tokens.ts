import type { Address } from 'viem'

/**
 * MVP payout token: AlphaUSD on Tempo Moderato (chainId 42431).
 * Address + decimals are source-verified against the public tokenlist —
 * see PLANNING.md "Verified Tempo API Reference". 6 decimals → use
 * parseUnits/formatUnits with 6, never floats.
 */
export const ALPHA_USD = {
  symbol: 'AlphaUSD',
  address: '0x20c0000000000000000000000000000000000001' as Address,
  decimals: 6,
} as const
