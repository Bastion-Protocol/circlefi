'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, DollarSign, Clock, AlertTriangle, Plus, Settings } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'circles' | 'loans'>('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-circle-500 rounded-lg"></div>
              <span className="text-xl font-bold">CircleFi</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-primary-100">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'circles' && <CirclesTab />}
          {activeTab === 'loans' && <LoansTab />}
        </motion.div>
      </div>
    </div>
  )
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 rounded-full bg-primary-100">
                <activity.icon className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-6 h-6 text-primary-600 mb-2" />
            <p className="font-medium">Create Circle</p>
            <p className="text-sm text-gray-600">Start a new lending circle</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DollarSign className="w-6 h-6 text-circle-600 mb-2" />
            <p className="font-medium">Borrow Funds</p>
            <p className="text-sm text-gray-600">Access loans from your circles</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-6 h-6 text-gray-600 mb-2" />
            <p className="font-medium">Manage Domains</p>
            <p className="text-sm text-gray-600">Update your collateral</p>
          </button>
        </div>
      </div>
    </div>
  )
}

function CirclesTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Circles</h2>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Circle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {circles.map((circle) => (
          <div key={circle.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{circle.name}</h3>
                <p className="text-sm text-gray-600">{circle.members} members</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                circle.status === 'active' 
                  ? 'bg-circle-100 text-circle-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {circle.status}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pool Amount</span>
                <span className="font-medium">{circle.poolAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Borrower</span>
                <span className="font-medium">{circle.currentBorrower}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Next Rotation</span>
                <span className="font-medium">{circle.nextRotation}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View Details
              </button>
              <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoansTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Loans</h2>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collateral
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{loan.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.collateral}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {loan.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      loan.status === 'active'
                        ? 'bg-circle-100 text-circle-800'
                        : loan.status === 'overdue'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {loan.status === 'active' && (
                      <button className="text-primary-600 hover:text-primary-900">
                        Repay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const stats = [
  { title: 'Active Circles', value: '3', icon: Users },
  { title: 'Total Borrowed', value: '$12,500', icon: DollarSign },
  { title: 'Active Loans', value: '2', icon: Clock },
  { title: 'Health Score', value: '98%', icon: AlertTriangle },
]

const tabs = [
  { id: 'overview' as const, label: 'Overview' },
  { id: 'circles' as const, label: 'Circles' },
  { id: 'loans' as const, label: 'Loans' },
]

const recentActivity = [
  {
    icon: DollarSign,
    title: 'Loan Repaid',
    description: 'Successfully repaid loan #1234 from DevCircle',
    time: '2 hours ago'
  },
  {
    icon: Users,
    title: 'Circle Rotation',
    description: 'New borrower selected in StartupCircle',
    time: '1 day ago'
  },
  {
    icon: AlertTriangle,
    title: 'Repayment Due',
    description: 'Loan #1235 due in 3 days',
    time: '2 days ago'
  }
]

const circles = [
  {
    id: '1',
    name: 'Dev Circle',
    members: 5,
    status: 'active',
    poolAmount: '$5,000',
    currentBorrower: 'Alice.eth',
    nextRotation: '5 days'
  },
  {
    id: '2',
    name: 'Startup Circle',
    members: 4,
    status: 'active',
    poolAmount: '$10,000',
    currentBorrower: 'You',
    nextRotation: '12 days'
  }
]

const loans = [
  {
    id: '1234',
    amount: '$2,500',
    collateral: 'example.com',
    dueDate: 'Dec 15, 2023',
    status: 'active'
  },
  {
    id: '1235',
    amount: '$1,000',
    collateral: 'mysite.org',
    dueDate: 'Nov 28, 2023',
    status: 'overdue'
  }
]