'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Address, formatUnits, parseUnits } from 'viem'
import {
  useVaultAddress,
  useVaultDetails,
  useRouteStatus,
  usePreviewSwap,
  useTokenBalance,
  useTokenAllowance,
  useApproveToken,
  useSwap,
  TokenDetails,
} from '@/hooks/useClearProtocol'
import { CONTRACTS } from '@/config/contracts'

interface TokenInfo {
  address: Address
  symbol: string
  decimals: number
}

export function SwapTab() {
  const { address: userAddress, isConnected } = useAccount()
  const vaultAddress = useVaultAddress()
  const { data: vaultDetails, isLoading: vaultLoading } = useVaultDetails(vaultAddress)

  const [fromToken, setFromToken] = useState<TokenInfo | null>(null)
  const [toToken, setToToken] = useState<TokenInfo | null>(null)
  const [inputAmount, setInputAmount] = useState('')
  const [keepIOUs, setKeepIOUs] = useState(false)
  const [slippageBps, setSlippageBps] = useState(50) // 0.5% default

  // Get available tokens from vault
  const availableTokens = useMemo(() => {
    if (!vaultDetails) return []
    const [, , , , tokens] = vaultDetails
    return tokens.map((t: TokenDetails) => ({
      address: t.addr,
      symbol: getTokenSymbol(t.addr),
      decimals: t.decimals,
    }))
  }, [vaultDetails])

  // Set initial tokens when available
  useEffect(() => {
    if (availableTokens.length >= 2 && !fromToken && !toToken) {
      setFromToken(availableTokens[0])
      setToToken(availableTokens[1])
    }
  }, [availableTokens, fromToken, toToken])

  // Route status
  const routeStatus = useRouteStatus(
    fromToken?.address,
    toToken?.address
  )

  // Parse input amount
  const parsedAmount = useMemo(() => {
    if (!inputAmount || !fromToken) return undefined
    try {
      return parseUnits(inputAmount, fromToken.decimals)
    } catch {
      return undefined
    }
  }, [inputAmount, fromToken])

  // Preview swap
  const { data: previewData, isLoading: previewLoading } = usePreviewSwap(
    vaultAddress,
    fromToken?.address,
    toToken?.address,
    parsedAmount
  )

  // User balance
  const { data: userBalance } = useTokenBalance(fromToken?.address, userAddress)

  // Allowance
  const { data: allowance } = useTokenAllowance(
    fromToken?.address,
    userAddress,
    CONTRACTS.swap
  )

  // Approve hook
  const { approve, isPending: approving, isConfirming: confirmingApproval } = useApproveToken()

  // Swap hook
  const { swap, isPending: swapping, isConfirming: confirmingSwap, isSuccess: swapSuccess, hash } = useSwap()

  const needsApproval = parsedAmount && allowance !== undefined && allowance < parsedAmount

  const handleApprove = () => {
    if (!fromToken || !parsedAmount) return
    approve(fromToken.address, CONTRACTS.swap, parsedAmount)
  }

  const handleSwap = () => {
    if (!vaultAddress || !fromToken || !toToken || !parsedAmount || !previewData || !userAddress) return

    const [amountOut] = previewData
    const minOut = (amountOut * BigInt(10000 - slippageBps)) / 10000n

    swap(userAddress, vaultAddress, fromToken.address, toToken.address, parsedAmount, minOut, keepIOUs)
  }

  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setInputAmount('')
  }

  // Format output
  const outputAmount = useMemo(() => {
    if (!previewData || !toToken) return '0'
    const [amountOut, ious] = previewData
    const total = keepIOUs ? amountOut : amountOut + ious
    return formatUnits(total, toToken.decimals)
  }, [previewData, toToken, keepIOUs])

  const iouAmount = useMemo(() => {
    if (!previewData || !toToken) return '0'
    const [, ious] = previewData
    return formatUnits(ious, toToken.decimals)
  }, [previewData, toToken])

  return (
    <div className="max-w-md mx-auto">
      {/* Route Status Banner */}
      <RouteStatusBanner
        isOpen={routeStatus.isOpen}
        depegPercent={routeStatus.depegPercent}
        fromPrice={routeStatus.fromPrice}
        toPrice={routeStatus.toPrice}
        isLoading={routeStatus.isLoading}
        fromSymbol={fromToken?.symbol}
        toSymbol={toToken?.symbol}
      />

      {/* Swap Card */}
      <div className="bg-gray-900 rounded-2xl p-4 mt-4">
        {/* From Token */}
        <div className="bg-gray-800 rounded-xl p-4 mb-2">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">From</span>
            {userBalance !== undefined && fromToken && (
              <button
                onClick={() => setInputAmount(formatUnits(userBalance, fromToken.decimals))}
                className="text-gray-400 text-sm hover:text-white"
              >
                Balance: {Number(formatUnits(userBalance, fromToken.decimals)).toFixed(4)}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <TokenSelect
              tokens={availableTokens}
              selected={fromToken}
              onSelect={setFromToken}
              exclude={toToken?.address}
            />
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={swapTokens}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-800 rounded-xl p-4 mt-2">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">To</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={outputAmount}
              readOnly
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none text-gray-300"
            />
            <TokenSelect
              tokens={availableTokens}
              selected={toToken}
              onSelect={setToToken}
              exclude={fromToken?.address}
            />
          </div>
        </div>

        {/* IOU Toggle */}
        {previewData && Number(iouAmount) > 0 && (
          <div className="mt-4 p-3 bg-gray-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">IOU Tokens: {Number(iouAmount).toFixed(4)}</div>
                <div className="text-sm text-gray-400">
                  {keepIOUs ? 'You will receive IOUs' : 'IOUs will be sold on Curve'}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepIOUs}
                  onChange={(e) => setKeepIOUs(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-2 text-sm">Keep IOUs</span>
              </label>
            </div>
          </div>
        )}

        {/* Swap Details */}
        {parsedAmount && parsedAmount > 0n && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-xl text-sm space-y-1">
            <div className="flex justify-between text-gray-400">
              <span>Slippage</span>
              <span>{slippageBps / 100}%</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Min. received</span>
              <span>
                {previewData ? Number(formatUnits(
                  (previewData[0] + (keepIOUs ? 0n : previewData[1])) * BigInt(10000 - slippageBps) / 10000n,
                  toToken?.decimals || 18
                )).toFixed(4) : '0'} {toToken?.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isConnected ? (
          <div className="mt-4 p-4 bg-gray-800 rounded-xl text-center text-gray-400">
            Connect wallet to swap
          </div>
        ) : !routeStatus.isOpen ? (
          <button
            disabled
            className="mt-4 w-full py-4 bg-gray-700 rounded-xl font-semibold text-gray-400 cursor-not-allowed"
          >
            Route Closed - Asset Not Depegged
          </button>
        ) : needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={approving || confirmingApproval}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-xl font-semibold transition-colors"
          >
            {approving || confirmingApproval ? 'Approving...' : `Approve ${fromToken?.symbol}`}
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={!parsedAmount || swapping || confirmingSwap || previewLoading}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-xl font-semibold transition-colors"
          >
            {swapping || confirmingSwap ? 'Swapping...' : 'Swap'}
          </button>
        )}

        {swapSuccess && hash && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-xl text-sm">
            Swap successful!{' '}
            <a
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              View on Etherscan
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function RouteStatusBanner({
  isOpen,
  depegPercent,
  fromPrice,
  toPrice,
  isLoading,
  fromSymbol,
  toSymbol,
}: {
  isOpen: boolean
  depegPercent: number
  fromPrice?: number
  toPrice?: number
  isLoading: boolean
  fromSymbol?: string
  toSymbol?: string
}) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl p-4 ${
        isOpen
          ? 'bg-green-900/30 border border-green-700'
          : 'bg-red-900/30 border border-red-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <div>
          <div className="font-semibold">
            {isOpen ? 'Route Open' : 'Route Closed'}
          </div>
          <div className="text-sm text-gray-300">
            {fromSymbol} depeg: {depegPercent.toFixed(3)}%
            {fromPrice && toPrice && (
              <span className="text-gray-400 ml-2">
                (${fromPrice.toFixed(4)} vs ${toPrice.toFixed(4)})
              </span>
            )}
          </div>
        </div>
      </div>
      {!isOpen && (
        <div className="mt-2 text-sm text-gray-400">
          {fromSymbol} needs to depeg more for this route to open. The threshold is typically 0.05% below peg.
        </div>
      )}
    </div>
  )
}

function TokenSelect({
  tokens,
  selected,
  onSelect,
  exclude,
}: {
  tokens: TokenInfo[]
  selected: TokenInfo | null
  onSelect: (token: TokenInfo) => void
  exclude?: Address
}) {
  const [isOpen, setIsOpen] = useState(false)

  const filteredTokens = tokens.filter((t) => t.address !== exclude)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
      >
        <span className="font-semibold">{selected?.symbol || 'Select'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-xl shadow-xl z-20 overflow-hidden">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  onSelect(token)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <span className="font-medium">{token.symbol}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Helper to get token symbol from address
function getTokenSymbol(address: Address): string {
  const symbols: Record<string, string> = {
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
    '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f': 'GHO',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
    '0x6B175474E89094C44Da98b954EescdeCB5BBaD80': 'DAI',
  }
  return symbols[address] || address.slice(0, 6)
}
