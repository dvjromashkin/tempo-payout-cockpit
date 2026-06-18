import type { Address } from 'viem'

/** `0x742d…0bEbb` — short, middle-truncated address for display. */
export function shortAddress(address: Address, lead = 6, tail = 4): string {
  if (address.length <= lead + tail + 1) return address
  return `${address.slice(0, lead)}…${address.slice(-tail)}`
}

/** Group the integer part of a decimal string with thin spaces: `1234.5` → `1 234.5`. */
export function groupDecimal(value: string): string {
  const [int, frac] = value.split('.')
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return frac ? `${grouped}.${frac}` : grouped
}
