import { useCallback, useEffect, useState } from 'react'
import { useAccount, useConnect, useConnectors, useDisconnect } from 'wagmi'
import { tempoModerato } from 'wagmi/chains'
import {
  WALLET_CONNECT_TIMEOUT_MESSAGE,
  createConnectWatchdog,
  getConnectRecoveryState,
} from '../../lib/connectRecovery'
import { formatWalletError } from '../../lib/errors'
import { shortAddress } from '../../lib/format'

/**
 * Header connect control. Non-custodial: clicking only opens the Tempo Wallet
 * dialog; signing/keys stay in the wallet. MVP has a single configured
 * connector (Tempo Wallet), so we connect with the first one.
 */
export function ConnectButton() {
  const { address, status } = useAccount()
  const { connect, error, reset, status: connectStatus } = useConnect()
  const connectors = useConnectors()
  const { disconnect } = useDisconnect()
  const [timedOut, setTimedOut] = useState(false)
  const [watchdog] = useState(() => createConnectWatchdog())

  const connector = connectors[0]

  const clearWatchdog = useCallback(() => {
    watchdog.clear()
  }, [watchdog])

  const startConnect = useCallback(() => {
    if (!connector || status === 'connected') return

    clearWatchdog()
    setTimedOut(false)
    reset()
    watchdog.start(() => {
      setTimedOut(true)
      console.warn(
        '[wallet] Tempo Wallet connection did not respond before the UI watchdog timeout.',
      )
    })
    connect(
      { connector, chainId: tempoModerato.id },
      {
        onError() {
          clearWatchdog()
          setTimedOut(false)
        },
        onSuccess() {
          clearWatchdog()
          setTimedOut(false)
        },
      },
    )
  }, [clearWatchdog, connect, connector, reset, status, watchdog])

  useEffect(() => {
    return () => clearWatchdog()
  }, [clearWatchdog])

  useEffect(() => {
    if (status !== 'connected') return
    clearWatchdog()
    reset()
  }, [clearWatchdog, reset, status])

  if (status === 'connected' && address) {
    return (
      <div className="wallet-pill">
        <span className="wallet-pill__addr" title={address}>
          {shortAddress(address)}
        </span>
        <button
          className="btn btn--ghost"
          type="button"
          onClick={() => {
            setTimedOut(false)
            disconnect()
          }}
        >
          Disconnect
        </button>
      </div>
    )
  }

  const recovery = getConnectRecoveryState({
    accountStatus: status,
    connectorAvailable: Boolean(connector),
    hasError: Boolean(error),
    mutationStatus: connectStatus,
    timedOut,
  })

  return (
    <div className="connect-stack">
      <button
        className="btn btn--primary"
        type="button"
        disabled={recovery.disabled}
        onClick={startConnect}
      >
        {recovery.buttonLabel}
      </button>
      {error ? (
        <p className="status status--err connect-note" role="alert">
          {formatWalletError(error)}
        </p>
      ) : recovery.showTimeoutMessage ? (
        <p className="status status--err connect-note" role="alert">
          {WALLET_CONNECT_TIMEOUT_MESSAGE}
        </p>
      ) : (
        <p className="muted connect-note">Tempo Wallet availability may vary by region.</p>
      )}
    </div>
  )
}
