'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Address, formatUnits, parseUnits } from 'viem'
import {
  useVaultAddress,
  useVaultDetails,
  useTokenBalance,
  useTokenAllowance,
  useApproveToken,
  useWrapIOU,
  TokenDetails,
} from '@/hooks/useClearProtocol'

interface TokenInfo {
  address: Address
  symbol: string
  decimals: number
  iouAddress: Address
}

export function WrapTab() {
  const { address: userAddress, isConnected } = useAccount()
  const vaultAddress = useVaultAddress()
  const { data: vaultDetails, isLoading: vaultLoading } = useVaultDetails(vaultAddress)

  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null)
  const [inputAmount, setInputAmount] = useState('')

  // Get available tokens from vault
  const availableTokens = useMemo(() => {
    if (!vaultDetails) return []
    const [, , , , tokens] = vaultDetails
    return tokens.map((t: TokenDetails) => ({
      address: t.addr,
      symbol: getTokenSymbol(t.addr),
      decimals: t.decimals,
      iouAddress: t.iou,
    }))
  }, [vaultDetails])

  // Set initial token when available
  useEffect(() => {
    if (availableTokens.length > 0 && !selectedToken) {
      setSelectedToken(availableTokens[0])
    }
  }, [availableTokens, selectedToken])

  // Parse input amount
  const parsedAmount = useMemo(() => {
    if (!inputAmount || !selectedToken) return undefined
    try {
      return parseUnits(inputAmount, selectedToken.decimals)
    } catch {
      return undefined
    }
  }, [inputAmount, selectedToken])

  // User balance of underlying token
  const { data: underlyingBalance } = useTokenBalance(selectedToken?.address, userAddress)

  // User balance of IOU token
  const { data: iouBalance } = useTokenBalance(selectedToken?.iouAddress, userAddress)

  // Allowance for vault to spend underlying
  const { data: allowance } = useTokenAllowance(
    selectedToken?.address,
    userAddress,
    vaultAddress
  )

  // Approve hook
  const { approve, isPending: approving, isConfirming: confirmingApproval } = useApproveToken()

  // Wrap hook
  const { wrap, isPending: wrapping, isConfirming: confirmingWrap, isSuccess: wrapSuccess, hash } = useWrapIOU()

  const needsApproval = parsedAmount && allowance !== undefined && allowance < parsedAmount

  const handleApprove = () => {
    if (!selectedToken || !parsedAmount || !vaultAddress) return
    approve(selectedToken.address, vaultAddress, parsedAmount)
  }

  const handleWrap = () => {
    if (!vaultAddress || !selectedToken || !parsedAmount || !userAddress) return
    wrap(vaultAddress, selectedToken.address, userAddress, parsedAmount)
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Info Banner */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-semibold text-blue-100">Wrap Stablecoins to IOUs</div>
            <div className="text-sm text-gray-300 mt-1">
              Wrapping converts your stablecoins 1:1 into IOU tokens. IOUs can be redeemed for the underlying when the vault is balanced.
            </div>
          </div>
        </div>
      </div>

      {/* Wrap Card */}
      <div className="bg-gray-900 rounded-2xl p-4">
        {/* Token Selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Select Token</label>
          <div className="grid grid-cols-2 gap-2">
            {availableTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  setSelectedToken(token)
                  setInputAmount('')
                }}
                className={`p-3 rounded-xl border-2 transition-colors ${
                  selectedToken?.address === token.address
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold">{token.symbol}</div>
                <div className="text-xs text-gray-400">→ iou{token.symbol}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Amount */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Amount to Wrap</span>
            {underlyingBalance !== undefined && selectedToken && (
              <button
                onClick={() => setInputAmount(formatUnits(underlyingBalance, selectedToken.decimals))}
                className="text-gray-400 text-sm hover:text-white"
              >
                Balance: {Number(formatUnits(underlyingBalance, selectedToken.decimals)).toFixed(4)}
              </button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <span className="text-xl font-medium text-gray-400">{selectedToken?.symbol}</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-gray-700 p-2 rounded-lg">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Output (IOU) */}
        <div className="bg-gray-800 rounded-xl p-4 mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">You Will Receive</span>
            {iouBalance !== undefined && selectedToken && (
              <span className="text-gray-400 text-sm">
                IOU Balance: {Number(formatUnits(iouBalance, selectedToken.decimals)).toFixed(4)}
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={inputAmount || '0.0'}
              readOnly
              className="flex-1 bg-transparent text-2xl font-semibold outline-none text-gray-300"
            />
            <span className="text-xl font-medium text-blue-400">iou{selectedToken?.symbol}</span>
          </div>
        </div>

        {/* Rate Info */}
        <div className="mt-4 p-3 bg-gray-800/50 rounded-xl text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Exchange Rate</span>
            <span>1 {selectedToken?.symbol} = 1 iou{selectedToken?.symbol}</span>
          </div>
        </div>

        {/* Action Button */}
        {!isConnected ? (
          <div className="mt-4 p-4 bg-gray-800 rounded-xl text-center text-gray-400">
            Connect wallet to wrap
          </div>
        ) : needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={approving || confirmingApproval}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-xl font-semibold transition-colors"
          >
            {approving || confirmingApproval ? 'Approving...' : `Approve ${selectedToken?.symbol}`}
          </button>
        ) : (
          <button
            onClick={handleWrap}
            disabled={!parsedAmount || wrapping || confirmingWrap}
            className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-xl font-semibold transition-colors"
          >
            {wrapping || confirmingWrap ? 'Wrapping...' : 'Wrap to IOU'}
          </button>
        )}

        {wrapSuccess && hash && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-xl text-sm">
            Wrap successful!{' '}
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

      {/* Additional Info */}
      <div className="mt-4 text-sm text-gray-400 space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-yellow-500">*</span>
          <span>IOUs are redeemable 1:1 for the underlying token when the vault is balanced.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-yellow-500">*</span>
          <span>You can also trade IOUs on Curve pools for immediate liquidity.</span>
        </div>
      </div>
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
