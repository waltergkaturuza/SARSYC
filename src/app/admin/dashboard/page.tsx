import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { 
  FiUsers, FiFileText, FiMic, FiCalendar, 
  FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle,
  FiMessageSquare, FiHeart
} from 'react-icons/fi'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminDashboardPage() {
  const payload = await getPayloadClient()

  // Fetch statistics
  const [registrations, abstracts, speakers, sessions, news] = await Promise.all([
    payload.find({ collection: 'registrations', limit: 0 }),
    payload.find({ collection: 'abstracts', limit: 0 }),
    payload.find({ collection: 'speakers', limit: 0 }),
    payload.find({ collection: 'sessions', limit: 0 }),
    payload.find({ collection: 'news', limit: 0 }),
  ])

  // Get recent registrations
  const recentRegistrations = await payload.find({
    collection: 'registrations',
    limit: 5,
    sort: '-createdAt',
  })

  // Get pending abstracts
  const pendingAbstracts = await payload.find({
    collection: 'abstracts',
    where: {
      status: { equals: 'received' },
    },
    limit: 5,
  })

  const stats = [
    {
      name: 'Total Registrations',
      value: registrations.totalDocs,
      icon: FiUsers,
      color: 'bg-blue-500',
      description: `${registrations.totalDocs} registered`,
    },
    {
      name: 'Abstracts',
      value: abstracts.totalDocs,
      icon: FiFileText,
      color: 'bg-green-500',
      description: `${pendingAbstracts.totalDocs} pending review`,
    },
    {
      name: 'Speakers',
      value: speakers.totalDocs,
      icon: FiMic,
      color: 'bg-purple-500',
      description: `${speakers.totalDocs} confirmed`,
    },
    {
      name: 'Sessions',
      value: sessions.totalDocs,
      icon: FiCalendar,
      color: 'bg-orange-500',
      description: `${sessions.totalDocs} scheduled`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with SARSYC VI.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <FiTrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-700 mb-1">{stat.name}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
            <FiClock className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentRegistrations.docs.length > 0 ? (
              recentRegistrations.docs.map((reg: any) => (
                <div key={reg.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {reg.firstName} {reg.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{reg.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      reg.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700'
                        : reg.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No registrations yet</p>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link href="/admin/registrations" className="text-primary-600 font-medium text-sm hover:underline">
              View all registrations →
            </Link>
          </div>
        </div>

        {/* Pending Abstracts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pending Abstracts</h2>
            <FiAlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          
          <div className="space-y-4">
            {pendingAbstracts.docs.length > 0 ? (
              pendingAbstracts.docs.map((abstract: any) => (
                <div key={abstract.id} className="py-3 border-b border-gray-100 last:border-0">
                  <div className="font-medium text-gray-900 mb-1">{abstract.title}</div>
                  <div className="text-sm text-gray-500 mb-2">
                    {abstract.primaryAuthor?.firstName} {abstract.primaryAuthor?.lastName}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {abstract.track}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(abstract.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No pending abstracts</p>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link href="/admin/abstracts" className="text-primary-600 font-medium text-sm hover:underline">
              View all abstracts →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/speakers"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <FiMic className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Speaker</span>
          </Link>
          <Link
            href="/admin/news"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <FiMessageSquare className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Publish News</span>
          </Link>
          <Link
            href="/admin/sessions"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <FiCalendar className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Session</span>
          </Link>
          <Link
            href="/admin/partners"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <FiHeart className="w-8 h-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Partner</span>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Database</div>
              <div className="text-xs text-gray-500">Connected</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">API Routes</div>
              <div className="text-xs text-gray-500">Operational</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FiCheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Storage</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
