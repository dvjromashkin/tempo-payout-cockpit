function messagesOf(error: unknown, seen = new Set<unknown>()): string[] {
  if (!error || seen.has(error)) return []
  seen.add(error)

  if (typeof error === 'string') return [error]

  const messages: string[] = []
  if (error instanceof Error) messages.push(error.message)

  if (typeof error === 'object') {
    const record = error as Record<string, unknown>
    for (const key of ['shortMessage', 'details']) {
      const value = record[key]
      if (typeof value === 'string') messages.push(value)
    }
    messages.push(...messagesOf(record.cause, seen))
  }

  return messages.filter((message) => message.trim() !== '')
}

function lowerMessages(error: unknown): string[] {
  return messagesOf(error).map((message) => message.toLowerCase())
}

function has(messages: string[], pattern: RegExp): boolean {
  return messages.some((message) => pattern.test(message))
}

export function formatWalletError(error: unknown): string {
  const messages = lowerMessages(error)

  if (has(messages, /451|region|unavailable for legal reasons|geo/)) {
    return 'Tempo Wallet is unavailable in this region. Availability may vary by location.'
  }
  if (has(messages, /reject|denied|cancel/)) {
    return 'Wallet connection was cancelled.'
  }
  if (has(messages, /connector|wallet|provider|not found|unavailable/)) {
    return 'Tempo Wallet is unavailable. Check wallet access in this browser and region.'
  }
  if (has(messages, /network|chain/)) {
    return 'Could not connect to Moderato. Check the selected network and try again.'
  }

  return 'Could not connect Tempo Wallet. Try again or check wallet availability.'
}

export function formatPayoutError(error: unknown): string {
  const messages = lowerMessages(error)

  if (has(messages, /reject|denied|cancel|user rejected/)) {
    return 'Signature was rejected in Tempo Wallet. No transaction was submitted.'
  }
  if (has(messages, /insufficient|balance|funds/)) {
    return 'Insufficient AlphaUSD for the payout or fee. Check the balance and try again.'
  }
  if (has(messages, /network|chain|wrong chain|unsupported/)) {
    return 'Wrong or unavailable network. Switch to Tempo Moderato testnet and try again.'
  }
  if (has(messages, /fetch|timeout|rpc|connection|request failed/)) {
    return 'Network or RPC request failed. Check connectivity and try again.'
  }
  if (has(messages, /revert|execution reverted|receipt status|status 0x0|status: 0|on-chain/)) {
    return 'The atomic batch failed on-chain. No recipients were paid.'
  }

  return 'Transaction failed. Review the package and try again.'
}

export function formatReadError(error: unknown): string {
  const messages = lowerMessages(error)

  if (has(messages, /network|fetch|timeout|rpc|connection/)) {
    return 'Could not read the AlphaUSD balance. Check connectivity and retry.'
  }
  if (has(messages, /chain|unsupported/)) {
    return 'Could not read the balance on this network. Switch to Moderato.'
  }

  return 'Could not read the AlphaUSD balance. Retry in a moment.'
}

export function formatReceiptDownloadError(error: unknown): string {
  const messages = lowerMessages(error)

  if (has(messages, /permission|denied|blocked/)) {
    return 'Receipt download was blocked by the browser. Check download permissions.'
  }

  return 'Could not download the receipt. Try again.'
}
