export const PUBLIC_STATUS = {
  label: 'Moderato Testnet MVP',
  supporting: 'AlphaUSD only · No real funds',
  ariaLabel: 'Moderato Testnet MVP. AlphaUSD only. No real funds.',
} as const

export const SAFETY_NOTICE = {
  title: 'Experimental testnet software.',
  lead: 'Review every recipient, amount and memo before signing.',
  points: [
    'No private keys are requested or stored.',
    'Uploaded CSV data stays in this browser.',
    'Tempo Wallet signs; one atomic testnet transaction is submitted.',
  ],
} as const

export const HOW_IT_WORKS_STEPS = [
  'Upload a CSV payout list.',
  'Review validation results and totals.',
  'Connect Tempo Wallet and sign.',
  'Submit one atomic testnet transaction and download the receipt.',
] as const
