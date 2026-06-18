import { createConfig, http } from 'wagmi'
import { tempoModerato } from 'wagmi/chains'
import { tempoWallet } from 'wagmi/tempo'

/**
 * wagmi config for the Tempo Moderato testnet (chainId 42431).
 * MVP uses the Tempo Wallet connector only — a generic injected EOA cannot sign
 * the Tempo `0x76` batch transaction, so injected discovery is disabled.
 * `tempoWallet`/`tempoModerato` are source-verified — see PLANNING.md.
 */
export const wagmiConfig = createConfig({
  chains: [tempoModerato],
  connectors: [tempoWallet({ testnet: true })],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempoModerato.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
