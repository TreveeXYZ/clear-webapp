'use client'

import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address, formatUnits, parseUnits } from 'viem'
import { CONTRACTS } from '@/config/contracts'
import { clearSwapAbi, clearVaultAbi, clearOracleAbi, clearFactoryAbi, erc20Abi } from '@/config/abis'

export interface TokenDetails {
  addr: Address
  iou: Address
  iouCurvePool: Address
  adapter: Address
  maxExposureBps: bigint
  desiredExposureBps: bigint
  emitedIou: bigint
  balance: bigint
  exposure: bigint
  decimals: number
}

export interface VaultDetails {
  iouFeeBps: bigint
  maximumRebalanceBpsSpread: bigint
  desiredExposureMaximalBpsSpread: bigint
  totalAssets: bigint
  tokens: TokenDetails[]
}

// Get first vault address from factory
export function useVaultAddress() {
  const { data: vaultsLength } = useReadContract({
    address: CONTRACTS.factory,
    abi: clearFactoryAbi,
    functionName: 'vaultsLength',
  })

  const { data: vaultAddress } = useReadContract({
    address: CONTRACTS.factory,
    abi: clearFactoryAbi,
    functionName: 'vaults',
    args: [BigInt(0)],
    query: {
      enabled: vaultsLength !== undefined && vaultsLength > 0n,
    },
  })

  return vaultAddress
}

// Get vault details
export function useVaultDetails(vaultAddress: Address | undefined) {
  return useReadContract({
    address: vaultAddress,
    abi: clearVaultAbi,
    functionName: 'details',
    query: {
      enabled: !!vaultAddress,
      refetchInterval: 30000, // Refresh every 30s
    },
  })
}

// Get depeg thresholds from swap contract
export function useDepegThresholds() {
  return useReadContract({
    address: CONTRACTS.swap,
    abi: clearSwapAbi,
    functionName: 'getDepegTresholdBps',
  })
}

// Get price for a token
export function useTokenPrice(tokenAddress: Address | undefined) {
  return useReadContract({
    address: CONTRACTS.oracle,
    abi: clearOracleAbi,
    functionName: 'getUSDPrice',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
      refetchInterval: 10000, // Refresh every 10s
    },
  })
}

// Get price and redemption price
export function usePriceAndRedemption(tokenAddress: Address | undefined) {
  return useReadContract({
    address: CONTRACTS.oracle,
    abi: clearOracleAbi,
    functionName: 'getPriceAndRedemptionPrice',
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled: !!tokenAddress,
      refetchInterval: 10000,
    },
  })
}

// Check if swap route is open (price is depegged enough)
export function useRouteStatus(
  fromToken: Address | undefined,
  toToken: Address | undefined
) {
  const { data: thresholds } = useDepegThresholds()
  const { data: fromPriceData } = usePriceAndRedemption(fromToken)
  const { data: toPriceData } = usePriceAndRedemption(toToken)

  if (!thresholds || !fromPriceData || !toPriceData || !fromToken || !toToken) {
    return { isOpen: false, depegPercent: 0, isLoading: true }
  }

  const [depegThresholdBps, maxDepegThresholdBps] = thresholds
  const [fromPrice] = fromPriceData
  const [toPrice] = toPriceData

  // Route is open if fromPrice < toPrice * depegThreshold / 10000
  // And fromPrice > toPrice * maxDepegThreshold / 10000
  const thresholdPrice = (toPrice * depegThresholdBps) / 10000n
  const maxThresholdPrice = (toPrice * maxDepegThresholdBps) / 10000n

  const isOpen = fromPrice < thresholdPrice && fromPrice > maxThresholdPrice
  const depegPercent = Number(10000n - (fromPrice * 10000n / toPrice)) / 100

  return {
    isOpen,
    depegPercent,
    fromPrice: Number(fromPrice) / 1e8,
    toPrice: Number(toPrice) / 1e8,
    thresholdBps: Number(depegThresholdBps),
    isLoading: false
  }
}

// Preview swap output
export function usePreviewSwap(
  vaultAddress: Address | undefined,
  fromToken: Address | undefined,
  toToken: Address | undefined,
  amountIn: bigint | undefined
) {
  return useReadContract({
    address: CONTRACTS.swap,
    abi: clearSwapAbi,
    functionName: 'previewSwap',
    args: vaultAddress && fromToken && toToken && amountIn
      ? [vaultAddress, fromToken, toToken, amountIn]
      : undefined,
    query: {
      enabled: !!vaultAddress && !!fromToken && !!toToken && !!amountIn && amountIn > 0n,
    },
  })
}

// Get token balance
export function useTokenBalance(tokenAddress: Address | undefined, userAddress: Address | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!userAddress,
      refetchInterval: 15000,
    },
  })
}

// Get token allowance
export function useTokenAllowance(
  tokenAddress: Address | undefined,
  ownerAddress: Address | undefined,
  spenderAddress: Address | undefined
) {
  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!ownerAddress && !!spenderAddress,
    },
  })
}

// Approve token spending
export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const approve = (tokenAddress: Address, spender: Address, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
    })
  }

  return { approve, isPending, isConfirming, isSuccess, error, hash }
}

// Execute swap
export function useSwap() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const swap = (
    receiver: Address,
    vault: Address,
    from: Address,
    to: Address,
    amountIn: bigint,
    minAmountOut: bigint,
    receiveIOU: boolean
  ) => {
    writeContract({
      address: CONTRACTS.swap,
      abi: clearSwapAbi,
      functionName: 'swap',
      args: [receiver, vault, from, to, amountIn, minAmountOut, receiveIOU],
    })
  }

  return { swap, isPending, isConfirming, isSuccess, error, hash }
}

// Wrap tokens to IOUs
export function useWrapIOU() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const wrap = (vault: Address, token: Address, receiver: Address, amount: bigint) => {
    writeContract({
      address: vault,
      abi: clearVaultAbi,
      functionName: 'wrapIOU',
      args: [token, receiver, amount],
    })
  }

  return { wrap, isPending, isConfirming, isSuccess, error, hash }
}
