import { type Address, type Hex, encodeFunctionData } from 'viem'
import { Abis } from 'viem/tempo'
import { encodeMemo } from './memo'

/** One call inside a Tempo `0x76` batch: ABI-encoded calldata to the token. */
export interface PayoutCall {
  to: Address
  data: Hex
}

export interface PayoutInput {
  address: Address
  amountRaw: bigint
  /** Empty string => plain transfer; otherwise transferWithMemo. */
  memo: string
}

/**
 * Build the `calls[]` for ONE atomic Tempo transaction (type 0x76): one TIP-20
 * `transfer` (or `transferWithMemo`) per recipient, in order. Submitting these
 * as a single `sendTransactionSync({ calls })` makes the whole batch
 * all-or-nothing. See PLANNING.md "Verified Tempo API Reference".
 */
export function buildPayoutCalls(token: Address, rows: PayoutInput[]): PayoutCall[] {
  return rows.map((row) => ({
    to: token,
    data: row.memo
      ? encodeFunctionData({
          abi: Abis.tip20,
          functionName: 'transferWithMemo',
          args: [row.address, row.amountRaw, encodeMemo(row.memo)],
        })
      : encodeFunctionData({
          abi: Abis.tip20,
          functionName: 'transfer',
          args: [row.address, row.amountRaw],
        }),
  }))
}
