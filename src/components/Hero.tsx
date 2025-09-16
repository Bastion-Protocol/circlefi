'use client'

import Link from 'next/link'
import { ArrowRight, Shield, Users, Zap } from 'lucide-react'

export function Hero() {
  return (
    <div className="text-center space-y-8 py-16">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CircleFi
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
          Decentralized lending circles powered by USDC on Avalanche. 
          Join small, trusted groups for better rates and gasless transactions.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          DOMA Domain Collateral
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          3-4 Member Circles
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Yellow SDK Integration
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <Link
          href="/lend"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Start Lending
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/circles"
          className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Explore Circles
        </Link>
      </div>

      <div className="pt-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Circle</h3>
              <p className="text-gray-600 text-sm">Form a lending circle with 3-4 trusted members</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Use Domains</h3>
              <p className="text-gray-600 text-sm">Leverage DOMA domains as high-value collateral</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gasless Transactions</h3>
              <p className="text-gray-600 text-sm">Enjoy seamless interactions with Yellow SDK</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}