'use client'

export function Stats() {
  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-8">Platform Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">$2.5M</div>
          <div className="text-gray-600">Total Value Locked</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">156</div>
          <div className="text-gray-600">Active Circles</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">4.2%</div>
          <div className="text-gray-600">Average APY</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">99.8%</div>
          <div className="text-gray-600">Uptime</div>
        </div>
      </div>
    </div>
  )
}