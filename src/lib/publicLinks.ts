import { EXPLORER_BASE_URL } from './explorer'

export const PUBLIC_LINKS = {
  github: 'https://github.com/dvjromashkin/tempo-payout-cockpit',
  sampleCsv: '/sample-payout.csv',
  explorer: EXPLORER_BASE_URL,
  docs: 'https://docs.tempo.xyz',
} as const

export interface SafeExternalLinkProps {
  target: '_blank'
  rel: 'noopener noreferrer'
  'aria-label': string
}

export function safeExternalLinkProps(label: string): SafeExternalLinkProps {
  return {
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': `${label} (opens in a new tab)`,
  }
}
