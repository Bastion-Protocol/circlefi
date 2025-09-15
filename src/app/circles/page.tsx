'use client'

import { useState } from 'react'
import { Plus, Users, TrendingUp, DollarSign, Clock, Search } from 'lucide-react'

export default function CirclesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const allCircles = [
    {
      id: '1',
      name: 'Tech Founders',
      description: 'Circle for technology startup founders',
      members: 3,
      maxMembers: 4,
      totalSupplied: 125000,
      totalBorrowed: 45000,
      apy: 5.2,
      memberAvatars: ['👨‍💻', '👩‍💼', '👨‍🚀'],
      isJoined: true,
      isOwner: true,
    },
    {
      id: '2',
      name: 'DeFi Enthusiasts',
      description: 'For those passionate about decentralized finance',
      members: 4,
      maxMembers: 4,
      totalSupplied: 89500,
      totalBorrowed: 32000,
      apy: 4.8,
      memberAvatars: ['🧙‍♂️', '👩‍🔬', '👨‍🎓', '👩‍💻'],
      isJoined: false,
      isOwner: false,
    },
    {
      id: '3',
      name: 'Domain Investors',
      description: 'Premium domain name investors and traders',
      members: 2,
      maxMembers: 4,
      totalSupplied: 67200,
      totalBorrowed: 18500,
      apy: 5.5,
      memberAvatars: ['👨‍💼', '👩‍💼'],
      isJoined: true,
      isOwner: false,
    },
    {
      id: '4',
      name: 'NFT Collectors',
      description: 'Circle for NFT enthusiasts and collectors',
      members: 3,
      maxMembers: 4,
      totalSupplied: 156000,
      totalBorrowed: 78000,
      apy: 4.5,
      memberAvatars: ['🎨', '🖼️', '🎭'],
      isJoined: false,
      isOwner: false,
    },
  ]

  const filteredCircles = allCircles.filter(circle =>
    circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    circle.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Lending Circles</h1>
        <p className="text-lg text-gray-600">
          Join or create trusted lending circles with 3-4 members for better rates
        </p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search circles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Circle
        </button>
      </div>

      {/* Circles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCircles.map((circle) => (
          <div
            key={circle.id}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{circle.name}</h3>
                  {circle.isOwner && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      Owner
                    </span>
                  )}
                  {circle.isJoined && !circle.isOwner && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Member
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{circle.description}</p>
              </div>
            </div>

            {/* Members */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {circle.memberAvatars.map((avatar, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-sm"
                  >
                    {avatar}
                  </div>
                ))}
                {Array.from({ length: circle.maxMembers - circle.members }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3 text-gray-400" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {circle.members}/{circle.maxMembers} members
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Total Supplied</span>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  ${circle.totalSupplied.toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">APY</span>
                </div>
                <div className="text-lg font-semibold text-green-600">{circle.apy}%</div>
              </div>
            </div>

            {/* Utilization */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Utilization</span>
                <span>{((circle.totalBorrowed / circle.totalSupplied) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(circle.totalBorrowed / circle.totalSupplied) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {circle.isJoined ? (
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  View Details
                </button>
              ) : circle.members < circle.maxMembers ? (
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Join Circle
                </button>
              ) : (
                <button disabled className="flex-1 bg-gray-100 text-gray-400 py-2 rounded-lg font-medium cursor-not-allowed">
                  Circle Full
                </button>
              )}
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Info
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Circle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Circle Name
                </label>
                <input
                  type="text"
                  placeholder="Enter circle name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe your circle..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                  <option value="3">3 members</option>
                  <option value="4">4 members</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Create Circle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}