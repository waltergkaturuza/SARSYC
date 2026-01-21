import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import Link from 'next/link'
import { FiArrowLeft, FiMail, FiPhone, FiCalendar } from 'react-icons/fi'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function ContactMessageDetailPage({ params }: { params: { id: string } }) {
  const payload = await getPayloadClient()
  
  let message: any = null

  try {
    message = await payload.findByID({
      collection: 'contact-messages',
      id: params.id,
      overrideAccess: true,
    })
  } catch (error: any) {
    console.error('Error fetching contact message:', error)
    notFound()
  }

  if (!message) {
    notFound()
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

  const statusInfo = statusConfig[message.status] || statusConfig['new']

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/contact-messages"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft />
          Back to Contact Messages
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Message from {message.name}</h1>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className="text-gray-500 text-sm">
            Received {new Date(message.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Message</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{message.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <a href={`mailto:${message.email}`} className="text-primary-600 hover:underline block">
                  {message.email}
                </a>
              </div>
              
              {message.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <a href={`tel:${message.phone}`} className="text-primary-600 hover:underline block">
                    {message.phone}
                  </a>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500">Subject</label>
                <p className="text-gray-900">{subjectConfig[message.subject] || message.subject}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <a
              href={`mailto:${message.email}?subject=Re: ${subjectConfig[message.subject] || message.subject}`}
              className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center text-sm font-medium"
            >
              Reply via Email
            </a>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Received</label>
                <p className="text-sm text-gray-700">{new Date(message.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Message ID</label>
                <p className="text-sm text-gray-700 font-mono">{message.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
