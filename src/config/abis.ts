export const clearSwapAbi = [
  {
    inputs: [],
    name: 'getDepegTresholdBps',
    outputs: [
      { name: 'depegThresholdBps', type: 'uint256' },
      { name: 'maximalDepegThresholdBps', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_vault', type: 'address' },
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_amountIn', type: 'uint256' },
    ],
    name: 'previewSwap',
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'ious', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_receiver', type: 'address' },
      { name: '_vault', type: 'address' },
      { name: '_from', type: 'address' },
      { name: '_to', type: 'address' },
      { name: '_amountIn', type: 'uint256' },
      { name: '_minAmountOut', type: 'uint256' },
      { name: '_receiveIOU', type: 'bool' },
    ],
    name: 'swap',
    outputs: [
      { name: 'amountOut', type: 'uint256' },
      { name: 'ious', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_receiver', type: 'address' },
      { name: '_vault', type: 'address' },
      { name: '_token', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
    name: 'redeemIOU',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const clearVaultAbi = [
  {
    inputs: [],
    name: 'details',
    outputs: [
      { name: 'iouFeeBps', type: 'uint256' },
      { name: 'maximumRebalanceBpsSpread', type: 'uint256' },
      { name: 'desiredExposureMaximalBpsSpread', type: 'uint256' },
      { name: 'totalAssets', type: 'uint256' },
      {
        name: 'tokens',
        type: 'tuple[]',
        components: [
          { name: 'addr', type: 'address' },
          { name: 'iou', type: 'address' },
          { name: 'iouCurvePool', type: 'address' },
          { name: 'adapter', type: 'address' },
          { name: 'maxExposureBps', type: 'uint256' },
          { name: 'desiredExposureBps', type: 'uint256' },
          { name: 'emitedIou', type: 'uint256' },
          { name: 'balance', type: 'uint256' },
          { name: 'exposure', type: 'uint256' },
          { name: 'decimals', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokens',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_token', type: 'address' }],
    name: 'iouOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isBalanced',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_token', type: 'address' },
      { name: '_receiver', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
    name: 'wrapIOU',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const clearOracleAbi = [
  {
    inputs: [{ name: '_asset', type: 'address' }],
    name: 'getUSDPrice',
    outputs: [{ name: 'price', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_asset', type: 'address' }],
    name: 'getPriceAndRedemptionPrice',
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'redemptionPrice', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_asset', type: 'address' }],
    name: 'oracleConfiguration',
    outputs: [
      { name: 'enabled', type: 'bool' },
      { name: 'assetDecimals', type: 'uint8' },
      { name: 'oracleDecimals', type: 'uint8' },
      { name: 'redemptionPrice', type: 'uint256' },
      { name: 'priceTTL', type: 'uint256' },
      { name: 'lastUpdateTimestamp', type: 'uint256' },
      { name: 'price', type: 'uint256' },
      { name: 'adapterType', type: 'uint8' },
      { name: 'adapter', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const clearFactoryAbi = [
  {
    inputs: [],
    name: 'vaultsLength',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'uint256' }],
    name: 'vaults',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const erc20Abi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
