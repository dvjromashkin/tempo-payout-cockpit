export const TEMPO_TESTNET_EXPLORER_URL = 'https://explore.testnet.tempo.xyz'

/** Tempo testnet explorer homepage. Use this when deep links are unreliable. */
export const EXPLORER_BASE_URL = TEMPO_TESTNET_EXPLORER_URL

export function getTempoExplorerUrl(): string {
  return TEMPO_TESTNET_EXPLORER_URL
}

/** Link to a transaction receipt on the Tempo Moderato explorer. */
export function getTempoReceiptUrl(txHash: string): string {
  return `${getTempoExplorerUrl()}/receipt/${txHash}`
}

export function getTempoExplorerAccess(txHash: string): {
  explorerUrl: string
  receiptUrl: string
  txHash: string
} {
  return {
    explorerUrl: getTempoExplorerUrl(),
    receiptUrl: getTempoReceiptUrl(txHash),
    txHash,
  }
}
