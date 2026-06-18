import { useAccount, useConnect, useConnectors, useDisconnect } from 'wagmi'
import { tempoModerato } from 'wagmi/chains'
import { shortAddress } from '../../lib/format'

/**
 * Header connect control. Non-custodial: clicking only opens the Tempo Wallet
 * dialog; signing/keys stay in the wallet. MVP has a single configured
 * connector (Tempo Wallet), so we connect with the first one.
 */
export function ConnectButton() {
  const { address, status } = useAccount()
  const { connect } = useConnect()
  const connectors = useConnectors()
  const { disconnect } = useDisconnect()

  if (status === 'connected' && address) {
    return (
      <div className="wallet-pill">
        <span className="wallet-pill__addr" title={address}>
          {shortAddress(address)}
        </span>
        <button className="btn btn--ghost" type="button" onClick={() => disconnect()}>
          Отключить
        </button>
      </div>
    )
  }

  const connector = connectors[0]
  const busy = status === 'connecting' || status === 'reconnecting'

  return (
    <button
      className="btn btn--primary"
      type="button"
      disabled={!connector || busy}
      onClick={() => connector && connect({ connector, chainId: tempoModerato.id })}
    >
      {busy ? 'Подключение…' : 'Подключить кошелёк'}
    </button>
  )
}
