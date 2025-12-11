import { Address } from 'viem'

// Mainnet deployed contracts
export const CONTRACTS = {
  accessManager: '0x20a22791923E69f0f27166B59A12aF01cA4E4AF8' as Address,
  factory: '0x8bF266ED803e474AE7Bf09ADB5ba2566c489223d' as Address,
  oracle: '0x049ad7Ff0c6BdbaB86baf4b1A5a5cA975e234FCA' as Address,
  swap: '0xeb5AD3D93E59eFcbC6934caD2B48EB33BAf29745' as Address,
  vaultImplementation: '0x95FD342EE48000E600448Fdce88D47F6c14E3146' as Address,
  iouImplementation: '0x2e6b8C3BE581ec0852Fb6BBafC4a03251407fcc5' as Address,
  // Adapters
  aaveUSDCAdapter: '0x6af14a7dd4143df261ACE458A4Bd7C8504a13764' as Address,
  sGHOAdapter: '0x6E1cc930155A0d7D0B8A21D9FD3c5b480D21Fd19' as Address,
}

// Known stablecoins on mainnet
export const TOKENS = {
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '/tokens/usdc.svg',
  },
  GHO: {
    address: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f' as Address,
    symbol: 'GHO',
    name: 'GHO Stablecoin',
    decimals: 18,
    logo: '/tokens/gho.svg',
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logo: '/tokens/usdt.svg',
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EescdeCB5BBaD80' as Address,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logo: '/tokens/dai.svg',
  },
} as const

export type TokenSymbol = keyof typeof TOKENS
