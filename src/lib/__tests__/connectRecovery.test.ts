import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CONNECT_WATCHDOG_MS,
  WALLET_CONNECT_TIMEOUT_MESSAGE,
  createConnectWatchdog,
  getConnectRecoveryState,
} from '../connectRecovery'

describe('wallet connection recovery', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps the button disabled while the initial connection is pending', () => {
    const state = getConnectRecoveryState({
      accountStatus: 'connecting',
      connectorAvailable: true,
      hasError: false,
      mutationStatus: 'pending',
      timedOut: false,
    })

    expect(state.buttonLabel).toBe('Connecting...')
    expect(state.disabled).toBe(true)
    expect(state.showTimeoutMessage).toBe(false)
    expect(state.waiting).toBe(true)
  })

  it('selects the timeout message and enables retry after the watchdog fires', () => {
    const state = getConnectRecoveryState({
      accountStatus: 'connecting',
      connectorAvailable: true,
      hasError: false,
      mutationStatus: 'pending',
      timedOut: true,
    })

    expect(WALLET_CONNECT_TIMEOUT_MESSAGE).toBe(
      'Tempo Wallet did not respond. Check regional availability, blocked pop-ups, and browser privacy settings, then try again.',
    )
    expect(state.buttonLabel).toBe('Try again')
    expect(state.disabled).toBe(false)
    expect(state.showTimeoutMessage).toBe(true)
  })

  it('lets a specific connector error replace the timeout message', () => {
    const state = getConnectRecoveryState({
      accountStatus: 'disconnected',
      connectorAvailable: true,
      hasError: true,
      mutationStatus: 'error',
      timedOut: true,
    })

    expect(state.buttonLabel).toBe('Try again')
    expect(state.disabled).toBe(false)
    expect(state.showTimeoutMessage).toBe(false)
  })

  it('clears timeout UI for a late successful connection', () => {
    const state = getConnectRecoveryState({
      accountStatus: 'connected',
      connectorAvailable: true,
      hasError: false,
      mutationStatus: 'success',
      timedOut: true,
    })

    expect(state.buttonLabel).toBe('Connect wallet')
    expect(state.disabled).toBe(false)
    expect(state.showTimeoutMessage).toBe(false)
    expect(state.waiting).toBe(false)
  })

  it('cleans up a pending timer before it fires', () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    const watchdog = createConnectWatchdog(CONNECT_WATCHDOG_MS)

    watchdog.start(onTimeout)
    expect(watchdog.isActive()).toBe(true)
    watchdog.clear()

    vi.advanceTimersByTime(CONNECT_WATCHDOG_MS)
    expect(onTimeout).not.toHaveBeenCalled()
    expect(watchdog.isActive()).toBe(false)
  })

  it('restarts the watchdog for a retry without firing the stale timer', () => {
    vi.useFakeTimers()
    const firstTimeout = vi.fn()
    const secondTimeout = vi.fn()
    const watchdog = createConnectWatchdog(CONNECT_WATCHDOG_MS)

    watchdog.start(firstTimeout)
    vi.advanceTimersByTime(CONNECT_WATCHDOG_MS / 2)
    watchdog.start(secondTimeout)
    vi.advanceTimersByTime(CONNECT_WATCHDOG_MS - 1)

    expect(firstTimeout).not.toHaveBeenCalled()
    expect(secondTimeout).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(firstTimeout).not.toHaveBeenCalled()
    expect(secondTimeout).toHaveBeenCalledTimes(1)
  })
})
