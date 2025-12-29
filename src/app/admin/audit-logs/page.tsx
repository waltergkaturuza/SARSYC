import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  FiSearch, FiFilter, FiDownload, FiEye, FiClock, FiUser, 
  FiFileText, FiTrash2, FiEdit, FiPlus, FiShield, FiLock, FiUnlock
} from 'react-icons/fi'

export const revalidate = 0

const actionIcons: Record<string, any> = {
  create: FiPlus,
  update: FiEdit,
  delete: FiTrash2,
  login: FiUser,
  logout: FiUser,
  password_reset: FiShield,
  account_locked: FiLock,
  account_unlocked: FiUnlock,
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

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Check authentication
  const user = await getCurrentUserFromCookies()
  
  if (!user || user.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin/audit-logs')
  }

  const payload = await getPayloadClient()

  // Parse search params
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 50
  const action = searchParams.action as string | undefined
  const collection = searchParams.collection as string | undefined
  const userId = searchParams.userId as string | undefined
  const search = searchParams.search as string | undefined

  // Build where clause
  const where: any = {}

  if (action) {
    where.action = { equals: action }
  }

  if (collection) {
    where.collection = { equals: collection }
  }

  if (userId) {
    where.user = { equals: userId }
  }

  if (search) {
    where.or = [
      { description: { contains: search } },
      { userEmail: { contains: search } },
      { documentId: { contains: search } },
    ]
  }

  // Fetch audit logs
  const auditLogs = await payload.find({
    collection: 'audit-logs',
    where,
    limit,
    page,
    sort: '-createdAt',
    depth: 1,
    overrideAccess: true,
  })

  // Get unique collections for filter
  const collectionsResult = await payload.find({
    collection: 'audit-logs',
    limit: 0,
    overrideAccess: true,
  })

  const uniqueCollections = Array.from(
    new Set(
      collectionsResult.docs.map((log: any) => log.collection).filter(Boolean)
    )
  ).sort() as string[]

  // Get unique actions for filter
  const uniqueActions = Array.from(
    new Set(
      collectionsResult.docs.map((log: any) => log.action).filter(Boolean)
    )
  ).sort() as string[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-gray-600 mt-1">
            Complete history of all system changes and user actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/audit-logs/export"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <form method="get" className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              name="action"
              defaultValue={action}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((act: string) => (
                <option key={act} value={act}>
                  {act.charAt(0).toUpperCase() + act.slice(1).replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection
            </label>
            <select
              name="collection"
              defaultValue={collection}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Collections</option>
              {uniqueCollections.map((coll) => (
                <option key={coll} value={coll}>
                  {coll.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiFilter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {auditLogs.totalDocs.toLocaleString()}
              </p>
            </div>
            <FiFileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Page</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {auditLogs.docs.length}
              </p>
            </div>
            <FiClock className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Collections</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {uniqueCollections.length}
              </p>
            </div>
            <FiFileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {uniqueActions.length}
              </p>
            </div>
            <FiFilter className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Collection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.docs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogs.docs.map((log: any) => {
                  const ActionIcon = actionIcons[log.action] || FiFileText
                  const colorClass = actionColors[log.action] || 'bg-gray-100 text-gray-700 border-gray-200'

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                          <ActionIcon className="w-3 h-3" />
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1).replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.collection?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {log.documentId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {typeof log.user === 'object' && log.user
                                ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.userEmail
                                : log.userEmail || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.userRole || '-'} {log.userEmail ? `• ${log.userEmail}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                        {log.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/audit-logs/${log.id}`}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <FiEye className="w-4 h-4" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {auditLogs.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(page * limit, auditLogs.totalDocs)}
              </span>{' '}
              of <span className="font-medium">{auditLogs.totalDocs}</span> results
            </div>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/audit-logs?${new URLSearchParams({
                    ...searchParams as any,
                    page: String(page - 1),
                  }).toString()}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < auditLogs.totalPages && (
                <Link
                  href={`/admin/audit-logs?${new URLSearchParams({
                    ...searchParams as any,
                    page: String(page + 1),
                  }).toString()}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

