import { tempoModerato } from 'wagmi/chains'

/** Block-explorer base URL from the source-verified chain definition. */
export const EXPLORER_BASE_URL =
  tempoModerato.blockExplorers?.default.url ?? 'https://explore.testnet.tempo.xyz'

/** Link to a transaction on the Tempo Moderato explorer. */
export function txExplorerUrl(hash: string): string {
  return `${EXPLORER_BASE_URL}/tx/${hash}`
}
