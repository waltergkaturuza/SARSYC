import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { FiEye, FiMail } from 'react-icons/fi'

export const revalidate = 0

export default async function ContactMessagesPage() {
  const payload = await getPayloadClient()
  
  let messages: any[] = []
  let totalDocs = 0

  try {
    const results = await payload.find({
      collection: 'contact-messages',
      limit: 100,
      sort: '-createdAt',
      overrideAccess: true,
    })

    messages = results.docs
    totalDocs = results.totalDocs
  } catch (error: any) {
    console.error('Error fetching contact messages:', error)
    messages = []
    totalDocs = 0
  }

  const subjectConfig: Record<string, string> = {
    'general': 'General Inquiry',
    'registration': 'Registration Help',
    'abstract': 'Abstract Submission',
    'partnership': 'Partnership Inquiry',
    'media': 'Media Request',
    'speaker': 'Speaker Inquiry',
    'technical': 'Technical Support',
    'other': 'Other',
  }

  const statusConfig: Record<string, { color: string, label: string }> = {
    'new': { color: 'bg-blue-100 text-blue-700', label: 'New' },
    'read': { color: 'bg-gray-100 text-gray-700', label: 'Read' },
    'responded': { color: 'bg-green-100 text-green-700', label: 'Responded' },
    'archived': { color: 'bg-gray-100 text-gray-600', label: 'Archived' },
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
        <p className="text-gray-600">Messages from the contact form</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Messages</p>
          <p className="text-3xl font-bold text-gray-900">{totalDocs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">New</p>
          <p className="text-3xl font-bold text-blue-600">
            {messages.filter(m => m.status === 'new').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Read</p>
          <p className="text-3xl font-bold text-gray-600">
            {messages.filter(m => m.status === 'read').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Responded</p>
          <p className="text-3xl font-bold text-green-600">
            {messages.filter(m => m.status === 'responded').length}
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">All Messages</h2>
        </div>

        {messages.length === 0 ? (
          <div className="p-12 text-center">
            <FiMail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No contact messages yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message: any) => {
                  const statusInfo = statusConfig[message.status] || statusConfig['new']
                  
                  return (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{message.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`mailto:${message.email}`} className="text-sm text-primary-600 hover:underline">
                          {message.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">{subjectConfig[message.subject] || message.subject}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/contact-messages/${message.id}`}
                          className="text-primary-600 hover:text-primary-700"
                          title="View Message"
                        >
                          <FiEye className="w-5 h-5 inline" />
                        </Link>
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
