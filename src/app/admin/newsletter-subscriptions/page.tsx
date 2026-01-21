'use client'

import React, { useEffect, useState } from 'react'
import { FiMail, FiUserCheck, FiUserX, FiAlertCircle, FiLoader, FiCopy } from 'react-icons/fi'

export default function NewsletterSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDocs, setTotalDocs] = useState(0)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/newsletter-subscriptions')
      const data = await response.json()
      if (data.docs) {
        setSubscriptions(data.docs)
        setTotalDocs(data.totalDocs)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyEmails = () => {
    const emails = subscriptions
      .filter(s => s.status === 'subscribed')
      .map(s => s.email)
      .join('\n')
    navigator.clipboard.writeText(emails)
    alert(`Copied ${subscriptions.filter(s => s.status === 'subscribed').length} active email addresses to clipboard!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }
  const statusConfig: Record<string, { color: string, label: string, icon: any }> = {
    'subscribed': { color: 'bg-green-100 text-green-700', label: 'Subscribed', icon: FiUserCheck },
    'unsubscribed': { color: 'bg-gray-100 text-gray-700', label: 'Unsubscribed', icon: FiUserX },
    'bounced': { color: 'bg-red-100 text-red-700', label: 'Bounced', icon: FiAlertCircle },
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Subscribers</h1>
        <p className="text-gray-600">Manage email newsletter subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Subscribers</p>
          <p className="text-3xl font-bold text-gray-900">{totalDocs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <FiUserCheck className="w-4 h-4 text-green-600" />
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {subscriptions.filter(s => s.status === 'subscribed').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <FiUserX className="w-4 h-4 text-gray-600" />
            <p className="text-sm text-gray-600">Unsubscribed</p>
          </div>
          <p className="text-3xl font-bold text-gray-600">
            {subscriptions.filter(s => s.status === 'unsubscribed').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <FiAlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-gray-600">Bounced</p>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {subscriptions.filter(s => s.status === 'bounced').length}
          </p>
        </div>
      </div>

      {/* Export Button */}
      <div className="mb-6">
        <button
          onClick={handleCopyEmails}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
        >
          <FiCopy className="w-4 h-4" />
          Copy Active Emails
        </button>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">All Subscribers</h2>
        </div>

        {subscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <FiMail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No newsletter subscribers yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub: any) => {
                  const statusInfo = statusConfig[sub.status] || statusConfig['subscribed']
                  const StatusIcon = statusInfo.icon
                  
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiMail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {sub.firstName || sub.lastName 
                            ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim()
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{sub.source || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
