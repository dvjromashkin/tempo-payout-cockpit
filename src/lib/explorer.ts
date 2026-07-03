import { tempoModerato } from 'wagmi/chains'

/** Block-explorer base URL from the source-verified chain definition. */
export const EXPLORER_BASE_URL =
  tempoModerato.blockExplorers?.default.url ?? 'https://explore.testnet.tempo.xyz'

/** Link to a transaction receipt on the Tempo Moderato explorer. */
export function getTempoReceiptUrl(txHash: string): string {
  return `${EXPLORER_BASE_URL.replace(/\/+$/, '')}/receipt/${txHash}`
}
