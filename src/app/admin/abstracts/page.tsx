import React from 'react'
import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import Link from 'next/link'
import AbstractsFilters from '@/components/admin/AbstractsFilters'
import AbstractQuickActions from '@/components/admin/AbstractQuickActions'
import { 
  FiFileText, FiDownload, FiEye, FiCheck, FiX, FiClock, FiEdit 
} from 'react-icons/fi'

export const revalidate = 0

const ASSIGN_SCORE_FILTERS = ['all', 'none', '1-10', '11-20', '21-30'] as const
type AssignScoreFilter = (typeof ASSIGN_SCORE_FILTERS)[number]

function normalizeAssignScore(raw: string | undefined): AssignScoreFilter {
  if (raw && (ASSIGN_SCORE_FILTERS as readonly string[]).includes(raw)) {
    return raw as AssignScoreFilter
  }
  return 'all'
}

function abstractIdFromReviewRelation(abstractField: unknown): number | null {
  if (abstractField == null) return null
  if (typeof abstractField === 'object' && 'id' in (abstractField as object)) {
    const id = (abstractField as { id: number }).id
    return id != null ? Number(id) : null
  }
  const n = Number(abstractField)
  return Number.isFinite(n) ? n : null
}

function andWhereClause(base: Record<string, unknown>, extra: Record<string, unknown>) {
  const keys = Object.keys(base)
  if (keys.length === 0) return extra
  return { and: [base, extra] }
}

type PayloadClient = Awaited<ReturnType<typeof getPayloadClient>>

/** Paginate abstract-reviews and collect distinct abstract IDs (for assign-tab filters). */
async function collectAbstractIdsFromReviews(
  payload: PayloadClient,
  scoreRange?: { min: number; max: number },
): Promise<number[]> {
  const ids = new Set<number>()
  let page = 1
  const where =
    scoreRange == null
      ? undefined
      : {
          and: [
            { score: { greater_than_equal: scoreRange.min } },
            { score: { less_than_equal: scoreRange.max } },
          ],
        }
  for (;;) {
    const res = await payload.find({
      collection: 'abstract-reviews',
      ...(where ? { where } : {}),
      limit: 250,
      page,
      depth: 0,
      overrideAccess: true,
    })
    for (const doc of res.docs) {
      const aid = abstractIdFromReviewRelation((doc as { abstract?: unknown }).abstract)
      if (aid != null) ids.add(aid)
    }
    if (!res.hasNextPage || res.docs.length === 0) break
    page += 1
    if (page > 400) break
  }
  return [...ids]
}

function reviewerDisplayName(reviewer: unknown): string {
  if (typeof reviewer === 'object' && reviewer !== null) {
    const r = reviewer as { firstName?: string; lastName?: string; email?: string }
    const n = `${r.firstName || ''} ${r.lastName || ''}`.trim()
    return n || r.email || 'Reviewer'
  }
  return 'Reviewer'
}

interface SearchParams {
  page?: string
  status?: string
  track?: string
  country?: string
  gender?: string
  ageGroup?: string
  institution?: string
  search?: string
  tab?: string
  assignScore?: string
}

export default async function AbstractsManagementPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const currentUser = await getCurrentUserFromCookies()
  if (!currentUser) {
    redirect('/login?type=reviewer&redirect=/admin/abstracts')
  }
  const isAdmin = currentUser.role === 'admin'
  const isReviewerRole = currentUser.role === 'reviewer'
  if (!isAdmin && !isReviewerRole) {
    redirect('/login?type=reviewer&redirect=/admin/abstracts')
  }

  const payload = await getPayloadClient()
  const reviewerIdValue =
    currentUser?.id && typeof currentUser.id === 'object'
      ? currentUser.id.toString()
      : currentUser?.id
  const reviewerId = reviewerIdValue ? reviewerIdValue.toString() : undefined
  const isReviewer = currentUser?.role === 'reviewer' && Boolean(reviewerId)
  const isAdminOrEditor = currentUser.role === 'admin' || currentUser.role === 'editor'

  const activeTab = searchParams.tab || 'abstracts'
  const page = Number(searchParams.page || 1)
  const perPage = 25
  const status = searchParams.status
  const track = searchParams.track
  const country = searchParams.country
  const gender = searchParams.gender
  const ageGroup = searchParams.ageGroup
  const institution = searchParams.institution
  const search = searchParams.search

  // Build where clause
  const where: any = {}

  if (status && status !== 'all') {
    where.status = { equals: status }
  }

  if (track && track !== 'all') {
    where.track = { equals: track }
  }

  if (country && country !== 'all') {
    where['primaryAuthor.country'] = { equals: country }
  }

  if (gender && gender !== 'all') {
    where['primaryAuthor.gender'] = { equals: gender }
  }

  if (ageGroup && ageGroup !== 'all') {
    const [minAge, maxAge] = ageGroup.split('-').map(Number)
    where['primaryAuthor.age'] = { greater_than_equal: minAge, less_than_equal: maxAge }
  }

  if (institution) {
    where['primaryAuthor.institution'] = { contains: institution }
  }

  if (search) {
    where.or = [
      { title: { contains: search } },
      { 'primaryAuthor.firstName': { contains: search } },
      { 'primaryAuthor.lastName': { contains: search } },
      { 'primaryAuthor.email': { contains: search } },
    ]
  }

  if (isReviewer && reviewerId) {
    where.assignedReviewers = { equals: reviewerId }
  }

  const assignScore = normalizeAssignScore(searchParams.assignScore)
  let abstractWhere: Record<string, unknown> = where

  if (activeTab === 'assign' && isAdminOrEditor && assignScore !== 'all') {
    if (assignScore === 'none') {
      const withReviews = await collectAbstractIdsFromReviews(payload)
      if (withReviews.length > 0) {
        abstractWhere = andWhereClause(abstractWhere, { id: { not_in: withReviews } })
      }
    } else {
      const range =
        assignScore === '1-10'
          ? { min: 1, max: 10 }
          : assignScore === '11-20'
            ? { min: 11, max: 20 }
            : { min: 21, max: 30 }
      const inRange = await collectAbstractIdsFromReviews(payload, range)
      if (inRange.length === 0) {
        abstractWhere = andWhereClause(abstractWhere, { id: { equals: -1 } })
      } else {
        abstractWhere = andWhereClause(abstractWhere, { id: { in: inRange } })
      }
    }
  }

  const results = await payload.find({
    collection: 'abstracts',
    where: abstractWhere,
    limit: perPage,
    page,
    sort: '-createdAt',
  })

  const abstracts = results.docs
  const totalPages = results.totalPages
  const totalDocs = results.totalDocs

  const reviewsByAbstractId: Record<string, { score: number; reviewer: unknown }[]> = {}
  if (activeTab === 'assign' && isAdminOrEditor && abstracts.length > 0) {
    const abstractIds = (abstracts as { id: number }[]).map((a) => a.id)
    const revRes = await payload.find({
      collection: 'abstract-reviews',
      where: { abstract: { in: abstractIds } },
      limit: Math.min(2000, Math.max(100, abstractIds.length * 12)),
      depth: 1,
      overrideAccess: true,
      sort: '-score',
    })
    for (const rev of revRes.docs as {
      abstract?: unknown
      score?: number
      reviewer?: unknown
    }[]) {
      const aid = abstractIdFromReviewRelation(rev.abstract)
      if (aid == null || rev.score == null) continue
      const key = String(aid)
      if (!reviewsByAbstractId[key]) reviewsByAbstractId[key] = []
      reviewsByAbstractId[key].push({ score: rev.score, reviewer: rev.reviewer })
    }
  }

  // Get counts by status
  const buildStatusWhere = (statusValue: string) => ({
    status: { equals: statusValue },
    ...(isReviewer && reviewerId ? { assignedReviewers: { equals: reviewerId } } : {}),
  })

  const statusCounts = await Promise.all([
    payload.find({ collection: 'abstracts', where: buildStatusWhere('received'), limit: 0 }),
    payload.find({ collection: 'abstracts', where: buildStatusWhere('under-review'), limit: 0 }),
    payload.find({ collection: 'abstracts', where: buildStatusWhere('accepted'), limit: 0 }),
    payload.find({ collection: 'abstracts', where: buildStatusWhere('rejected'), limit: 0 }),
  ])

  // Load reviewers list for admin/editor tabs
  const reviewersResult = isAdminOrEditor
    ? await payload.find({
        collection: 'users',
        where: { role: { equals: 'reviewer' } },
        limit: 200,
        sort: 'lastName',
      })
    : null

  const reviewers = reviewersResult?.docs || []

  const statusConfig: Record<string, any> = {
    'received': { color: 'bg-blue-100 text-blue-700', icon: FiClock, label: 'Received' },
    'under-review': { color: 'bg-yellow-100 text-yellow-700', icon: FiClock, label: 'Under Review' },
    'accepted': { color: 'bg-green-100 text-green-700', icon: FiCheck, label: 'Accepted' },
    'rejected': { color: 'bg-red-100 text-red-700', icon: FiX, label: 'Rejected' },
    'revisions': { color: 'bg-orange-100 text-orange-700', icon: FiEdit, label: 'Revisions' },
  }

  const assignTabHref = (opts?: { page?: number; assignScore?: AssignScoreFilter }) => {
    const p = new URLSearchParams()
    p.set('tab', 'assign')
    const pg = opts?.page ?? page
    const sc = opts?.assignScore ?? assignScore
    if (pg > 1) p.set('page', String(pg))
    if (sc !== 'all') p.set('assignScore', sc)
    return `/admin/abstracts?${p.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isReviewer ? 'My Assigned Abstracts' : 'Abstract Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isReviewer
              ? 'Review the abstracts that have been assigned to you.'
              : 'Review and manage conference abstract submissions'}
          </p>
        </div>
        {!isReviewer && (
          <button className="btn-primary flex items-center gap-2">
            <FiDownload className="w-5 h-5" />
            Export All
          </button>
        )}
      </div>

      {/* Tabs (admin/editor only see extra tabs) */}
      {!isReviewer && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 pt-2">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <Link
              href="/admin/abstracts"
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
                activeTab === 'abstracts'
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              All Abstracts
            </Link>
            {isAdminOrEditor && (
              <>
                <Link
                  href="/admin/abstracts?tab=reviewers"
                  className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
                    activeTab === 'reviewers'
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Reviewers
                </Link>
                <Link
                  href={activeTab === 'assign' ? assignTabHref() : '/admin/abstracts?tab=assign'}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
                    activeTab === 'assign'
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Assign Abstracts
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats + Filters only on All Abstracts tab */}
      {activeTab === 'abstracts' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{statusCounts[0].totalDocs}</div>
              <div className="text-sm text-gray-600">Received</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{statusCounts[1].totalDocs}</div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts[2].totalDocs}</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts[3].totalDocs}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Filters */}
          {!isReviewer && <AbstractsFilters />}
        </>
      )}

      {/* Tab Content */}
      {activeTab === 'abstracts' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Abstracts ({totalDocs})
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {abstracts.length} of {totalDocs} abstracts
                </p>
              </div>
            </div>
          </div>

          {abstracts.length === 0 ? (
            <div className="p-12 text-center">
              <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No abstracts found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Submission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Track
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {abstracts.map((abstract: any) => {
                    const statusInfo = statusConfig[abstract.status] || statusConfig['received']
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <tr key={abstract.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{abstract.title}</div>
                          <div className="text-sm text-gray-500">{abstract.submissionId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {abstract.primaryAuthor?.firstName} {abstract.primaryAuthor?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{abstract.primaryAuthor?.email}</div>
                          <div className="text-xs text-gray-400">{abstract.primaryAuthor?.country}</div>
                          {/* Age & Gender on one line */}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {abstract.primaryAuthor?.age != null && (
                              <span className="text-xs text-gray-500">Age {abstract.primaryAuthor.age}</span>
                            )}
                            {abstract.primaryAuthor?.gender && (
                              <span className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded-full ${
                                abstract.primaryAuthor.gender === 'female'
                                  ? 'bg-pink-100 text-pink-700'
                                  : abstract.primaryAuthor.gender === 'male'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {({'female':'Female','male':'Male','non-binary':'Non-binary','prefer-not-to-say':'Undisclosed'} as Record<string,string>)[abstract.primaryAuthor.gender] ?? abstract.primaryAuthor.gender}
                              </span>
                            )}
                          </div>
                          {abstract.primaryAuthor?.institution && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]" title={abstract.primaryAuthor.institution}>
                              {abstract.primaryAuthor.institution}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {abstract.track?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(abstract.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isReviewer && (
                              <AbstractQuickActions
                                abstractId={abstract.id.toString()}
                                currentStatus={abstract.status}
                              />
                            )}
                            <Link
                              href={`/admin/abstracts/${abstract.id}`}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </Link>
                            {isAdminOrEditor && (
                              <Link
                                href={`/admin/abstracts/${abstract.id}/edit`}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit Full Details"
                              >
                                <FiEdit className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                {(() => {
                  const base = [
                    status ? `status=${status}` : '',
                    track ? `track=${track}` : '',
                    country ? `country=${country}` : '',
                    gender ? `gender=${gender}` : '',
                    ageGroup ? `ageGroup=${ageGroup}` : '',
                    institution ? `institution=${encodeURIComponent(institution)}` : '',
                    search ? `search=${encodeURIComponent(search)}` : '',
                  ].filter(Boolean).join('&')
                  return (
                    <>
                      {page > 1 && (
                        <Link
                          href={`/admin/abstracts?page=${page - 1}${base ? `&${base}` : ''}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Previous
                        </Link>
                      )}
                      {page < totalPages && (
                        <Link
                          href={`/admin/abstracts?page=${page + 1}${base ? `&${base}` : ''}`}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Next
                        </Link>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviewers Tab */}
      {activeTab === 'reviewers' && isAdminOrEditor && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Reviewers</h2>
            <p className="text-sm text-gray-600 mt-1">
              List of all users with the Reviewer role. Create and manage reviewer accounts in the User Management section.
            </p>
          </div>
          {reviewers.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-600">
              No reviewers found. Go to <Link href="/admin/users" className="text-primary-600 font-medium hover:underline">User Management</Link> to create reviewer accounts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Organization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reviewers.map((reviewer: any) => (
                    <tr key={reviewer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(reviewer.firstName || reviewer.lastName)
                          ? `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim()
                          : reviewer.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{reviewer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{reviewer.organization || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Assign Tab */}
      {activeTab === 'assign' && isAdminOrEditor && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Assign Abstracts to Reviewers</h2>
              <p className="text-sm text-gray-600">
                Use this view to quickly see which abstracts are unassigned and jump into the edit screen to assign one or more reviewers.
              </p>
              <p className="text-sm text-gray-600">
                To assign reviewers, click <span className="font-semibold">Edit</span> on any abstract and use the{' '}
                <span className="font-semibold">Assigned Reviewers</span> field.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter by reviewer mark (1–30)</p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'all' as const, label: 'All' },
                    { id: 'none' as const, label: 'No marks yet' },
                    { id: '1-10' as const, label: '1–10' },
                    { id: '11-20' as const, label: '11–20' },
                    { id: '21-30' as const, label: '21–30' },
                  ] as const
                ).map((chip) => (
                  <Link
                    key={chip.id}
                    href={assignTabHref({ page: 1, assignScore: chip.id })}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                      assignScore === chip.id
                        ? 'border-primary-600 bg-primary-50 text-primary-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Band filters list abstracts where <span className="font-medium">at least one</span> submitted review has a total score in that range. &quot;No marks yet&quot; means no review has been submitted.
              </p>
            </div>
          </div>
          {abstracts.length === 0 ? (
            <div className="p-12 text-center">
              <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No abstracts match this filter.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Submission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Assigned Reviewers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reviewer marks</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {abstracts.map((abstract: any) => {
                  const assignedCount = Array.isArray(abstract.assignedReviewers)
                    ? abstract.assignedReviewers.length
                    : 0
                  const statusInfo = statusConfig[abstract.status] || statusConfig['received']
                  const StatusIcon = statusInfo.icon
                  const markRows = reviewsByAbstractId[String(abstract.id)] ?? []

                  return (
                    <tr key={abstract.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{abstract.title}</div>
                        <div className="text-xs text-gray-500">{abstract.submissionId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {assignedCount === 0 ? (
                          <span className="text-red-600 font-medium">Unassigned</span>
                        ) : (
                          <span className="text-gray-800">
                            {assignedCount} reviewer{assignedCount === 1 ? '' : 's'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm align-top">
                        {markRows.length === 0 ? (
                          <span className="text-gray-400">—</span>
                        ) : (
                          <ul className="space-y-1.5 max-w-[220px]">
                            {markRows.map((row, idx) => (
                              <li key={idx} className="flex items-baseline gap-2 flex-wrap">
                                <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-gray-900">
                                  {row.score}
                                </span>
                                <span
                                  className="text-xs text-gray-600 truncate flex-1 min-w-0"
                                  title={reviewerDisplayName(row.reviewer)}
                                >
                                  {reviewerDisplayName(row.reviewer)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/abstracts/${abstract.id}/edit`}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        >
                          Assign / Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          )}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages} ({totalDocs} abstracts)
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={assignTabHref({ page: page - 1 })}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={assignTabHref({ page: page + 1 })}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

