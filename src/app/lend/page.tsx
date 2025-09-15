'use client'

import { useState } from 'react'
import { Plus, Users, TrendingUp, Clock } from 'lucide-react'

export default function LendPage() {
  const [amount, setAmount] = useState('')
  const [selectedCircle, setSelectedCircle] = useState('')

  const circles = [
    {
      id: '1',
      name: 'Tech Founders',
      members: 3,
      maxMembers: 4,
      totalSupplied: '$125,000',
      apy: '5.2%',
      isJoined: true,
    },
    {
      id: '2',
      name: 'DeFi Enthusiasts',
      members: 4,
      maxMembers: 4,
      totalSupplied: '$89,500',
      apy: '4.8%',
      isJoined: false,
    },
    {
      id: '3',
      name: 'Domain Investors',
      members: 2,
      maxMembers: 4,
      totalSupplied: '$67,200',
      apy: '5.5%',
      isJoined: false,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Lend USDC</h1>
        <p className="text-lg text-gray-600">
          Supply USDC to earning lending circles and earn competitive yields
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lending Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Supply USDC</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Balance: 2,500 USDC</span>
                  <button className="text-blue-600 hover:text-blue-700">Max</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Circle
                </label>
                <select
                  value={selectedCircle}
                  onChange={(e) => setSelectedCircle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">General Pool</option>
                  {circles.filter(c => c.isJoined).map((circle) => (
                    <option key={circle.id} value={circle.id}>
                      {circle.name} ({circle.apy} APY)
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Estimated APY</span>
                  <span className="font-medium text-green-600">4.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Annual earnings</span>
                  <span className="font-medium">~$112.50</span>
                </div>
              </div>

              <button
                disabled={!amount}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Supply USDC
              </button>
            </div>
          </div>
        </div>

        {/* Available Circles */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Available Circles</h2>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Circle
            </button>
          </div>

          <div className="grid gap-4">
            {circles.map((circle) => (
              <div
                key={circle.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{circle.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {circle.members}/{circle.maxMembers} members
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {circle.apy} APY
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{circle.totalSupplied}</div>
                    <div className="text-sm text-gray-600">Total Supplied</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Last updated 5 min ago
                  </div>
                  <div className="flex gap-2">
                    {circle.isJoined ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Joined
                      </span>
                    ) : (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        Join Circle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}