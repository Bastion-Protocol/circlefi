'use client'

import Link from 'next/link'
// import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { Menu, X, Coins } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CircleFi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/lend" className="text-gray-700 hover:text-blue-600 transition-colors">
              Lend
            </Link>
            <Link href="/borrow" className="text-gray-700 hover:text-blue-600 transition-colors">
              Borrow
            </Link>
            <Link href="/circles" className="text-gray-700 hover:text-blue-600 transition-colors">
              Circles
            </Link>
            <Link href="/domains" className="text-gray-700 hover:text-blue-600 transition-colors">
              Domains
            </Link>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Connect Wallet
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/lend" className="text-gray-700 hover:text-blue-600 transition-colors">
                Lend
              </Link>
              <Link href="/borrow" className="text-gray-700 hover:text-blue-600 transition-colors">
                Borrow
              </Link>
              <Link href="/circles" className="text-gray-700 hover:text-blue-600 transition-colors">
                Circles
              </Link>
              <Link href="/domains" className="text-gray-700 hover:text-blue-600 transition-colors">
                Domains
              </Link>
              <div className="pt-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}