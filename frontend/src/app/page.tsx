'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import { ArrowRight, Users, TrendingUp, Shield, Globe } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-circle-500 rounded-lg"></div>
              <span className="text-xl font-bold">CircleFi</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-circle-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Decentralized Lending
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-circle-600">
                {' '}Circles
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join community-driven lending circles backed by domain NFT collateral. 
              Borrow, lend, and build credit with your trusted network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary inline-flex items-center">
                Launch App <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/learn" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CircleFi?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of decentralized lending with our innovative circle-based approach
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card text-center"
              >
                <div className="mb-4">
                  <feature.icon className="w-12 h-12 text-primary-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-circle-500 rounded-lg"></div>
              <span className="text-xl font-bold">CircleFi</span>
            </div>
            <p className="text-gray-400">
              Powered by Bastion Protocol • Built with ❤️ for DeFi
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Users,
    title: 'Community Circles',
    description: 'Form trusted lending circles with friends and colleagues for mutual financial support.'
  },
  {
    icon: Globe,
    title: 'Domain Collateral',
    description: 'Use your valuable domain NFTs as collateral for loans within your circle.'
  },
  {
    icon: TrendingUp,
    title: 'Variable Rates',
    description: 'Enjoy competitive interest rates that adjust based on pool utilization.'
  },
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description: 'Built on Avalanche with full transparency and automated liquidation protection.'
  }
]

const steps = [
  {
    title: 'Join a Circle',
    description: 'Create or join a lending circle with trusted members in your community.'
  },
  {
    title: 'Provide Collateral',
    description: 'Stake your domain NFTs as collateral when it\'s your turn to borrow.'
  },
  {
    title: 'Borrow & Repay',
    description: 'Access funds when needed and repay on time to maintain circle trust.'
  }
]