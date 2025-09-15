'use client'

import { useState } from 'react'
import { Shield, Users, TrendingDown, Clock } from 'lucide-react'

export default function BorrowPage() {
  const [amount, setAmount] = useState('')
  const [selectedCircle, setSelectedCircle] = useState('')
  const [collateralType, setCollateralType] = useState('domain')

  const myCircles = [
    {
      id: '1',
      name: 'Tech Founders',
      available: '$45,000',
      rate: '3.8%',
      mySupply: '$15,000',
    },
    {
      id: '3',
      name: 'Domain Investors',
      available: '$23,200',
      rate: '4.1%',
      mySupply: '$8,500',
    },
  ]

  const myDomains = [
    {
      id: '1',
      name: 'techstartup.doma',
      value: '$12,500',
      maxLoan: '$6,250',
      status: 'available',
    },
    {
      id: '2',
      name: 'crypto.doma',
      value: '$25,000',
      maxLoan: '$12,500',
      status: 'available',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Borrow USDC</h1>
        <p className="text-lg text-gray-600">
          Access liquidity from your lending circles using domain collateral
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Borrowing Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Borrow USDC</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (USDC)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collateral Type
                </label>
                <select
                  value={collateralType}
                  onChange={(e) => setCollateralType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="domain">DOMA Domain</option>
                  <option value="usdc">USDC (from supply)</option>
                </select>
              </div>

              {collateralType === 'domain' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Domain
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Choose domain...</option>
                    {myDomains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name} (Max: {domain.maxLoan})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lending Circle
                </label>
                <select
                  value={selectedCircle}
                  onChange={(e) => setSelectedCircle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select circle...</option>
                  {myCircles.map((circle) => (
                    <option key={circle.id} value={circle.id}>
                      {circle.name} ({circle.rate} APR)
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Interest Rate (APR)</span>
                  <span className="font-medium text-red-600">3.8%</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Loan-to-Value</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly payment</span>
                  <span className="font-medium">~$31.67</span>
                </div>
              </div>

              <button
                disabled={!amount || !selectedCircle}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Borrow USDC
              </button>
            </div>
          </div>
        </div>

        {/* Available Liquidity & Collateral */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Circles */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Liquidity</h2>
            <div className="grid gap-4">
              {myCircles.map((circle) => (
                <div
                  key={circle.id}
                  className="bg-white rounded-xl p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{circle.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          {circle.rate} APR
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Your supply: {circle.mySupply}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">{circle.available}</div>
                      <div className="text-sm text-gray-600">Available to borrow</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Domains */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">My Domain Collateral</h2>
            <div className="grid gap-4">
              {myDomains.map((domain) => (
                <div
                  key={domain.id}
                  className="bg-white rounded-xl p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{domain.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          Appraised value: {domain.value}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Updated 2 days ago
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">{domain.maxLoan}</div>
                      <div className="text-sm text-gray-600">Max loan (50% LTV)</div>
                      <span className="inline-block mt-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}