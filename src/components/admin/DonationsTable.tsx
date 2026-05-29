'use client'

import Link from 'next/link'
import { FiEdit2 } from 'react-icons/fi'

type DonationDoc = {
  id: string | number
  donationId?: string
  donorName?: string
  firstName?: string
  lastName?: string
  orgName?: string
  email?: string
  categoryDisplay?: string
  categorySlug?: string
  amountUsd?: number
  paymentStatus?: string
  createdAt?: string
}

const paymentBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  'bank-transfer': 'bg-orange-100 text-orange-800',
}

const paymentLabel: Record<string, string> = {
  pending: 'Unpaid',
  paid: 'Paid',
  failed: 'Failed',
  'bank-transfer': 'Bank transfer',
}

function donorLabel(doc: DonationDoc): string {
  if (doc.donorName?.trim()) return doc.donorName.trim()
  if (doc.orgName?.trim()) return doc.orgName.trim()
  return `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || '—'
}

function formatUsd(amount?: number): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value?: string): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DonationsTable({ docs = [] }: { docs: DonationDoc[] }) {
  if (docs.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        No donations or sponsorships recorded yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Donor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              USD
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {docs.map((doc) => {
            const status = doc.paymentStatus || 'pending'
            return (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(doc.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{donorLabel(doc)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{doc.email || '—'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs">
                    {doc.categoryDisplay || (doc.categorySlug === 'general' ? 'General support' : '—')}
                  </div>
                  {doc.categorySlug && (
                    <div className="text-xs text-gray-500 mt-0.5">{doc.categorySlug}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                  {formatUsd(doc.amountUsd)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      paymentBadge[status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {paymentLabel[status] || status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-gray-600">
                  {doc.donationId || '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/donations/${doc.id}`}
                    className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    <FiEdit2 size={14} />
                    Edit
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
