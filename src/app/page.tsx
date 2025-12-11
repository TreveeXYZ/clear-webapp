'use client'

import { useState } from 'react'
import { ConnectButton } from '@/components/ConnectButton'
import { SwapTab } from '@/components/SwapTab'
import { WrapTab } from '@/components/WrapTab'

type Tab = 'swap' | 'wrap'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('swap')

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              CLEAR
            </div>
            <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded">
              Mainnet
            </span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-900 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('swap')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'swap'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Swap
            </button>
            <button
              onClick={() => setActiveTab('wrap')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'wrap'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Wrap IOUs
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'swap' && <SwapTab />}
        {activeTab === 'wrap' && <WrapTab />}

        {/* Protocol Info */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="bg-gray-900/50 rounded-xl p-4 text-sm text-gray-400">
            <h3 className="font-semibold text-white mb-2">How Clear Works</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-400">1.</span>
                <span>When a stablecoin depegs, Clear allows you to swap it for another stablecoin at market rate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">2.</span>
                <span>You receive the fair value plus IOU tokens representing the depeg difference.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400">3.</span>
                <span>IOUs can be redeemed 1:1 when the asset repegs, or sold on Curve for immediate exit.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-4">
            <a href="https://github.com/TreveeXYZ" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
            <span>|</span>
            <a href="https://etherscan.io/address/0xeb5AD3D93E59eFcbC6934caD2B48EB33BAf29745" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Contract
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
