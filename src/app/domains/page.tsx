'use client'

import { useState } from 'react'
import { Shield, ExternalLink, RefreshCw, DollarSign, Calendar, Lock } from 'lucide-react'

export default function DomainsPage() {
  const [selectedTab, setSelectedTab] = useState('my-domains')

  const myDomains = [
    {
      id: '1',
      name: 'techstartup.doma',
      value: 12500,
      lastValuation: '2 days ago',
      status: 'available',
      maxLoan: 6250,
      currentLoan: 0,
    },
    {
      id: '2',
      name: 'crypto.doma',
      value: 25000,
      lastValuation: '1 day ago',
      status: 'collateral',
      maxLoan: 12500,
      currentLoan: 8500,
    },
    {
      id: '3',
      name: 'defi.doma',
      value: 8750,
      lastValuation: '5 days ago',
      status: 'needs-update',
      maxLoan: 4375,
      currentLoan: 0,
    },
  ]

  const marketplace = [
    {
      id: '4',
      name: 'premium.doma',
      value: 45000,
      seller: '0x742d...9c3e',
      maxLoan: 22500,
      category: 'Finance',
    },
    {
      id: '5',
      name: 'gaming.doma',
      value: 18000,
      seller: '0x123a...4b5c',
      maxLoan: 9000,
      category: 'Gaming',
    },
    {
      id: '6',
      name: 'metaverse.doma',
      value: 67500,
      seller: '0x456d...7e8f',
      maxLoan: 33750,
      category: 'Metaverse',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Available
          </span>
        )
      case 'collateral':
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" />
            In Use
          </span>
        )
      case 'needs-update':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Needs Update
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">DOMA Domains</h1>
        <p className="text-lg text-gray-600">
          Use high-value domain names as collateral for better lending rates
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('my-domains')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'my-domains'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Domains
          </button>
          <button
            onClick={() => setSelectedTab('marketplace')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'marketplace'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Marketplace
          </button>
        </nav>
      </div>

      {/* My Domains Tab */}
      {selectedTab === 'my-domains' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Domain Portfolio</h2>
            <div className="flex gap-2">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Update Values
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Add Domain
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {myDomains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{domain.name}</h3>
                      {getStatusBadge(domain.status)}
                      <button className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Updated {domain.lastValuation}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Max LTV: 50%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Appraised Value</div>
                    <div className="text-lg font-semibold text-blue-600">
                      ${domain.value.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Max Loan</div>
                    <div className="text-lg font-semibold text-green-600">
                      ${domain.maxLoan.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Current Loan</div>
                    <div className="text-lg font-semibold text-purple-600">
                      ${domain.currentLoan.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-1">Available</div>
                    <div className="text-lg font-semibold text-orange-600">
                      ${(domain.maxLoan - domain.currentLoan).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {domain.status === 'available' && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Use as Collateral
                    </button>
                  )}
                  {domain.status === 'collateral' && (
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                      Manage Loan
                    </button>
                  )}
                  {domain.status === 'needs-update' && (
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                      Request Valuation
                    </button>
                  )}
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketplace Tab */}
      {selectedTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Domain Marketplace</h2>
            <div className="flex gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option>All Categories</option>
                <option>Finance</option>
                <option>Gaming</option>
                <option>Metaverse</option>
                <option>Tech</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option>Sort by Value</option>
                <option>Sort by Name</option>
                <option>Sort by Date</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplace.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{domain.name}</h3>
                  <button className="text-blue-600 hover:text-blue-700">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Value</span>
                    <span className="font-semibold">${domain.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max Loan</span>
                    <span className="font-semibold text-green-600">${domain.maxLoan.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {domain.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Seller</span>
                    <span className="font-mono text-sm">{domain.seller}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Buy Domain
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}