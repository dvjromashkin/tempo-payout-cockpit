import { useSendTransactionSync } from 'wagmi'
import { ALPHA_USD } from '../../config/tokens'
import type { PayoutCall } from '../../lib/calls'

/**
 * Submit ONE atomic Tempo 0x76 transaction containing all payout calls, signed
 * by the connected wallet. Fee (gas) is paid in AlphaUSD (the payout token).
 *
 * NOTE: the live broadcast path is verified with a real wallet — until then the
 * shape `sendTransactionSync({ calls, feeToken })` is only type-checked.
 */
export function useBatchPayout() {
  const { sendTransactionSync, data, error, status, reset } = useSendTransactionSync()

  function send(calls: PayoutCall[]) {
    sendTransactionSync({ calls, feeToken: ALPHA_USD.address })
  }

  return { send, data, error, status, reset }
}
