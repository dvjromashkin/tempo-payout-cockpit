export const CONNECT_WATCHDOG_MS = 20_000

export const WALLET_CONNECT_TIMEOUT_MESSAGE =
  'Tempo Wallet did not respond. Check regional availability, blocked pop-ups, and browser privacy settings, then try again.'

export type AccountConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'reconnecting'

export type ConnectMutationStatus = 'error' | 'idle' | 'pending' | 'success'

export interface ConnectRecoveryInput {
  accountStatus: AccountConnectionStatus
  connectorAvailable: boolean
  hasError: boolean
  mutationStatus: ConnectMutationStatus
  timedOut: boolean
}

export interface ConnectRecoveryState {
  buttonLabel: 'Connect wallet' | 'Connecting...' | 'Try again'
  disabled: boolean
  showTimeoutMessage: boolean
  waiting: boolean
}

export function getConnectRecoveryState({
  accountStatus,
  connectorAvailable,
  hasError,
  mutationStatus,
  timedOut,
}: ConnectRecoveryInput): ConnectRecoveryState {
  const connected = accountStatus === 'connected'
  const pending =
    !connected &&
    (accountStatus === 'connecting' ||
      accountStatus === 'reconnecting' ||
      mutationStatus === 'pending')
  const waiting = pending && !timedOut
  const showTimeoutMessage = timedOut && !connected && !hasError

  return {
    buttonLabel:
      showTimeoutMessage || hasError
        ? 'Try again'
        : waiting
          ? 'Connecting...'
          : 'Connect wallet',
    disabled: !connectorAvailable || waiting,
    showTimeoutMessage,
    waiting,
  }
}

type TimeoutHandle = ReturnType<typeof setTimeout>

interface WatchdogTimers {
  clearTimeout: (handle: TimeoutHandle) => void
  setTimeout: (handler: () => void, timeout: number) => TimeoutHandle
}

export interface ConnectWatchdog {
  clear: () => void
  isActive: () => boolean
  start: (onTimeout: () => void) => void
}

export function createConnectWatchdog(
  timeoutMs = CONNECT_WATCHDOG_MS,
  timers: WatchdogTimers = {
    clearTimeout: (handle) => globalThis.clearTimeout(handle),
    setTimeout: (handler, timeout) => globalThis.setTimeout(handler, timeout),
  },
): ConnectWatchdog {
  let handle: TimeoutHandle | null = null

  function clear() {
    if (handle === null) return
    timers.clearTimeout(handle)
    handle = null
  }

  return {
    clear,
    isActive: () => handle !== null,
    start(onTimeout) {
      clear()
      handle = timers.setTimeout(() => {
        handle = null
        onTimeout()
      }, timeoutMs)
    },
  }
}
