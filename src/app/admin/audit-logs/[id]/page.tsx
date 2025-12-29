import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiClock, FiUser, FiFileText, FiShield } from 'react-icons/fi'

export const revalidate = 0

export default async function AuditLogDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Check authentication
  const user = await getCurrentUserFromCookies()
  
  if (!user || user.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin/audit-logs')
  }

  const payload = await getPayloadClient()

  // Fetch audit log
  const auditLog = await payload.findByID({
    collection: 'audit-logs',
    id: params.id,
    depth: 2,
    overrideAccess: true,
  })

  if (!auditLog) {
    redirect('/admin/audit-logs')
  }

  const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-700 border-green-200',
    update: 'bg-blue-100 text-blue-700 border-blue-200',
    delete: 'bg-red-100 text-red-700 border-red-200',
    login: 'bg-purple-100 text-purple-700 border-purple-200',
    logout: 'bg-gray-100 text-gray-700 border-gray-200',
    password_reset: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    account_locked: 'bg-orange-100 text-orange-700 border-orange-200',
    account_unlocked: 'bg-green-100 text-green-700 border-green-200',
  }

  const colorClass = actionColors[auditLog.action] || 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/audit-logs"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Log Details</h1>
            <p className="text-gray-600 mt-1">Detailed information about this system action</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${colorClass}`}>
          {auditLog.action.charAt(0).toUpperCase() + auditLog.action.slice(1).replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Action</label>
              <p className="text-gray-900 font-medium capitalize">
                {auditLog.action.replace(/_/g, ' ')}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Collection</label>
              <p className="text-gray-900">
                {auditLog.collection?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Document ID</label>
              <p className="text-gray-900 font-mono">{auditLog.documentId || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-900">{auditLog.description || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Date & Time</label>
              <p className="text-gray-900 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                {new Date(auditLog.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">User Information</h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">User</label>
              <p className="text-gray-900">
                {typeof auditLog.user === 'object' && auditLog.user
                  ? `${auditLog.user.firstName || ''} ${auditLog.user.lastName || ''}`.trim() || auditLog.userEmail
                  : auditLog.userEmail || 'Unknown'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{auditLog.userEmail || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-gray-900 capitalize">{auditLog.userRole || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">IP Address</label>
              <p className="text-gray-900 font-mono">{auditLog.ipAddress || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">User Agent</label>
              <p className="text-gray-900 text-sm break-all">{auditLog.userAgent || '-'}</p>
            </div>
          </div>
        </div>

        {/* Changes (if update action) */}
        {auditLog.action === 'update' && auditLog.changes && Object.keys(auditLog.changes).length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Field Changes</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(auditLog.changes).map(([field, change]: [string, any]) => (
                    <tr key={field}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {field}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md">
                        <pre className="whitespace-pre-wrap break-words bg-red-50 p-2 rounded text-xs">
                          {JSON.stringify(change.before, null, 2)}
                        </pre>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md">
                        <pre className="whitespace-pre-wrap break-words bg-green-50 p-2 rounded text-xs">
                          {JSON.stringify(change.after, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Before/After (for create/delete) */}
        {(auditLog.action === 'create' || auditLog.action === 'delete') && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {auditLog.action === 'create' ? 'Created Document' : 'Deleted Document'}
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap break-words text-sm">
                {JSON.stringify(
                  auditLog.action === 'create' ? auditLog.after : auditLog.before,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Metadata */}
        {auditLog.metadata && Object.keys(auditLog.metadata).length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Additional Metadata</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap break-words text-sm">
                {JSON.stringify(auditLog.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

