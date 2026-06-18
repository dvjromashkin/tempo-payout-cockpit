/**
 * Pure gate that decides whether a parsed payout package may proceed to
 * confirmation/broadcast. Kept free of UI so the safety-critical conditions
 * (right network, no row errors, sufficient balance) are unit-testable.
 */

export type GateReason =
  | 'not-connected'
  | 'wrong-network'
  | 'has-errors'
  | 'insufficient'

export interface GateInput {
  connected: boolean
  onModerato: boolean
  errorCount: number
  totalRaw: bigint
  /** Token balance in base units, or null if unknown/still loading. */
  balance: bigint | null
}

export interface PackageGate {
  reasons: GateReason[]
  insufficient: boolean
  canProceed: boolean
}

export function computePackageGate(input: GateInput): PackageGate {
  const reasons: GateReason[] = []

  if (!input.connected) reasons.push('not-connected')
  else if (!input.onModerato) reasons.push('wrong-network')

  if (input.errorCount > 0) reasons.push('has-errors')

  // Only block on insufficient funds when the balance is actually known.
  const insufficient = input.balance !== null && input.totalRaw > input.balance
  if (insufficient) reasons.push('insufficient')

  return { reasons, insufficient, canProceed: reasons.length === 0 }
}
