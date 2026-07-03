import { useState } from 'react'
import { copyHashAndOpenTempoExplorer, copyTransactionHash } from '../../lib/explorerActions'
import { getTempoExplorerAccess } from '../../lib/explorer'
import { safeExternalLinkProps } from '../../lib/publicLinks'

interface TransactionExplorerActionsProps {
  txHash: string
}

function shortTxHash(txHash: string): string {
  if (txHash.length <= 18) return txHash
  return `${txHash.slice(0, 10)}...${txHash.slice(-8)}`
}

export function TransactionExplorerActions({ txHash }: TransactionExplorerActionsProps) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const access = getTempoExplorerAccess(txHash)

  async function copyHash() {
    const copied = await copyTransactionHash(txHash)
    setFeedback(
      copied
        ? 'Transaction hash copied.'
        : 'Could not copy the hash. Select it and copy it manually.',
    )
  }

  async function copyAndOpenExplorer() {
    const { copied } = await copyHashAndOpenTempoExplorer(txHash)
    setFeedback(
      copied
        ? 'Transaction hash copied. Paste it into Explorer search if needed.'
        : 'Explorer opened. Copy the hash manually if clipboard access is blocked.',
    )
  }

  return (
    <div className="tx-access">
      <div className="tx-access__hash">
        <span className="tx-access__label">Transaction hash</span>
        <code title={txHash}>{shortTxHash(txHash)}</code>
      </div>
      <div className="tx-access__actions">
        <button className="btn btn--ghost btn--sm" type="button" onClick={copyHash}>
          Copy transaction hash
        </button>
        <button className="btn btn--primary btn--sm" type="button" onClick={copyAndOpenExplorer}>
          Copy hash &amp; open Tempo Explorer
        </button>
        <a
          className="btn btn--ghost btn--sm"
          href={access.receiptUrl}
          {...safeExternalLinkProps('Open direct receipt link in Tempo Explorer')}
        >
          Direct receipt link
        </a>
      </div>
      <p className="muted tx-access__note">
        If the explorer shows “Not Found”, paste the transaction hash into its search.
        The transaction may still be confirmed on-chain.
      </p>
      {feedback && (
        <p className="status status--ok tx-access__feedback" role="status">
          {feedback}
        </p>
      )}
    </div>
  )
}
