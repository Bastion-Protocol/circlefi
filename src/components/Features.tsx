'use client'

import { Shield, Users, Zap, TrendingUp, Globe, Lock } from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Users,
      title: 'Small Trusted Circles',
      description: 'Join intimate lending circles of 3-4 members for better rates and personalized lending.',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'DOMA Domain Collateral',
      description: 'Use high-value domain names as collateral to access larger loans with competitive rates.',
      color: 'green',
    },
    {
      icon: Zap,
      title: 'Yellow SDK Integration',
      description: 'Experience gasless transactions and real-time rate updates through state channels.',
      color: 'purple',
    },
    {
      icon: TrendingUp,
      title: 'Competitive Rates',
      description: 'Earn higher yields and pay lower interest rates within your trusted lending circle.',
      color: 'orange',
    },
    {
      icon: Globe,
      title: 'Avalanche Network',
      description: 'Built on Avalanche for fast, low-cost transactions with enterprise-grade security.',
      color: 'red',
    },
    {
      icon: Lock,
      title: 'Secure & Audited',
      description: 'Smart contracts based on battle-tested Aave V3 and Compound V3 protocols.',
      color: 'indigo',
    },
  ]

  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Why Choose CircleFi?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Experience the future of DeFi lending with innovative features designed for modern users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorMap[feature.color as keyof typeof colorMap]}`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}