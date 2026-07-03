import { erc20Abi, formatUnits } from 'viem'
import { useAccount, useReadContract, useSwitchChain } from 'wagmi'
import { tempoModerato } from 'wagmi/chains'
import { ALPHA_USD } from '../../config/tokens'
import { formatReadError } from '../../lib/errors'
import { groupDecimal } from '../../lib/format'

/**
 * Wallet card: network status + AlphaUSD balance for the connected account.
 * Balance is read via the standard ERC-20 `balanceOf` (TIP-20 is ERC-20
 * compatible) on Moderato, then formatted with 6 decimals.
 */
export function WalletCard() {
  const { address, status, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const onModerato = chainId === tempoModerato.id

  const {
    data: rawBalance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch,
  } = useReadContract({
    abi: erc20Abi,
    address: ALPHA_USD.address,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: tempoModerato.id,
    query: { enabled: Boolean(address) },
  })

  if (status !== 'connected' || !address) {
    return (
      <>
        <p className="muted">
          Connect Tempo Wallet from the header to view your address and AlphaUSD
          balance.
        </p>
        <p className="muted">Tempo Wallet availability may vary by region.</p>
      </>
    )
  }

  const balance =
    rawBalance !== undefined ? formatUnits(rawBalance, ALPHA_USD.decimals) : null

  return (
    <div className="wallet">
      <div className="wallet__row">
        <span className="wallet__label">Network</span>
        <span className="wallet__value">
          {onModerato ? (
            <span className="status status--ok">
              <span className="dot dot--ok" /> Moderato testnet {tempoModerato.id}
            </span>
          ) : (
            <span className="net-warn">
              <span className="dot dot--warn" /> Wrong network (chainId {chainId ?? '-'})
              <button
                className="btn btn--ghost btn--sm"
                type="button"
                onClick={() => switchChain({ chainId: tempoModerato.id })}
              >
                Switch to Moderato
              </button>
            </span>
          )}
        </span>
      </div>

      <div className="wallet__row">
        <span className="wallet__label">Address</span>
        <span className="wallet__value mono" title={address}>
          {address}
        </span>
      </div>

      <div className="wallet__row">
        <span className="wallet__label">Balance</span>
        <span className="wallet__value">
          {balanceError ? (
            <span className="status status--err">
              {formatReadError(balanceError)}
            </span>
          ) : balanceLoading ? (
            <span className="muted">Loading...</span>
          ) : (
            <span className="balance">
              <strong>{balance !== null ? groupDecimal(balance) : '-'}</strong>{' '}
              {ALPHA_USD.symbol}
              <button
                className="btn btn--ghost btn--sm"
                type="button"
                onClick={() => refetch()}
                title="Refresh balance"
              >
                Refresh
              </button>
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
