import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const alchemyUrl = process.env.NEXT_PUBLIC_ALCHEMY_URL || 'https://eth-mainnet.g.alchemy.com/v2/ph0FUrSi6-8SvDzvJYtc1'

export const config = createConfig({
  chains: [mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(alchemyUrl),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
