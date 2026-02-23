import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import Link from 'next/link'
import {
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiActivity,
  FiEye,
  FiCalendar,
  FiDownload,
  FiInbox,
} from 'react-icons/fi'

export const revalidate = 0

async function getAnalyticsData() {
  const payload = await getPayloadClient()

  const [
    pageViewsResult,
    uniqueVisitorsResult,
    topPagesResult,
    viewsByDayResult,
    recentEvents,
    registrations,
    abstracts,
    volunteers,
    contactMessages,
  ] = await Promise.all([
    payload.find({ collection: 'page-views', limit: 0 }),
    getUniqueVisitors(),
    getTopPages(),
    getViewsByDay(),
    payload
      .find({
        collection: 'site-events',
        limit: 20,
        sort: '-createdAt',
      })
      .catch(() => ({ docs: [], totalDocs: 0 })),
    payload.find({ collection: 'registrations', limit: 0 }),
    payload.find({ collection: 'abstracts', limit: 0 }),
    payload.find({ collection: 'volunteers', limit: 0 }),
    payload.find({ collection: 'contact-messages', limit: 0 }),
  ])

  return {
    totalPageViews: pageViewsResult.totalDocs,
    uniqueVisitors: uniqueVisitorsResult,
    topPages: topPagesResult,
    viewsByDay: viewsByDayResult,
    recentEvents: recentEvents.docs,
    interactionCounts: {
      registrations: registrations.totalDocs,
      abstracts: abstracts.totalDocs,
      volunteers: volunteers.totalDocs,
      contactMessages: contactMessages.totalDocs,
    },
  }
}

async function getUniqueVisitors(): Promise<number> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return 0
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })
    const rows = await sql`
      SELECT COUNT(DISTINCT session_id)::int as count
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `
    await sql.end()
    return Number(rows[0]?.count ?? 0)
  } catch {
    return 0
  }
}

async function getTopPages(): Promise<{ path: string; count: number }[]> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return []
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })
    const rows = await sql`
      SELECT path, COUNT(*)::int as count
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `
    await sql.end()
    return rows as unknown as { path: string; count: number }[]
  } catch {
    return []
  }
}

async function getViewsByDay(): Promise<{ date: string; count: number }[]> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return []
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })
    const rows = await sql`
      SELECT DATE(created_at)::text as date, COUNT(*)::int as count
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
    await sql.end()
    return rows as unknown as { date: string; count: number }[]
  } catch {
    return []
  }
}

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUserFromCookies()
  if (!user || user.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin/analytics')
  }

  let data
  try {
    data = await getAnalyticsData()
  } catch (err) {
    data = {
      totalPageViews: 0,
      uniqueVisitors: 0,
      topPages: [],
      viewsByDay: [],
      recentEvents: [],
      interactionCounts: {
        registrations: 0,
        abstracts: 0,
        volunteers: 0,
        contactMessages: 0,
      },
    }
  }

  const maxViews = Math.max(...data.viewsByDay.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Site visitors and interactions
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <FiEye className="w-8 h-8 text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.totalPageViews.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total page views</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <FiUsers className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.uniqueVisitors.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Unique visitors (30 days)</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <FiActivity className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.recentEvents.length}</div>
          <div className="text-sm text-gray-600">Recent events</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <FiTrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {data.viewsByDay.length > 0
              ? data.viewsByDay[data.viewsByDay.length - 1]?.count ?? 0
              : 0}
          </div>
          <div className="text-sm text-gray-600">Views today</div>
        </div>
      </div>

      {/* Interaction counts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key interactions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/registrations"
            className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
          >
            <FiUsers className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-bold text-gray-900">{data.interactionCounts.registrations}</div>
              <div className="text-xs text-gray-500">Registrations</div>
            </div>
          </Link>
          <Link
            href="/admin/abstracts"
            className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
          >
            <FiFileText className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-bold text-gray-900">{data.interactionCounts.abstracts}</div>
              <div className="text-xs text-gray-500">Abstracts</div>
            </div>
          </Link>
          <Link
            href="/admin/volunteers"
            className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
          >
            <FiActivity className="w-6 h-6 text-purple-600" />
            <div>
              <div className="font-bold text-gray-900">{data.interactionCounts.volunteers}</div>
              <div className="text-xs text-gray-500">Volunteers</div>
            </div>
          </Link>
          <Link
            href="/admin/contact-messages"
            className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200"
          >
            <FiInbox className="w-6 h-6 text-orange-600" />
            <div>
              <div className="font-bold text-gray-900">{data.interactionCounts.contactMessages}</div>
              <div className="text-xs text-gray-500">Contact form</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Page views over time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Page views (last 14 days)</h2>
          {data.viewsByDay.length > 0 ? (
            <div className="space-y-2">
              {data.viewsByDay.map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600 shrink-0">
                    {new Date(d.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded min-w-[2px]"
                      style={{
                        width: `${Math.max((d.count / maxViews) * 100, 2)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">
              No page view data yet. Data will appear as visitors browse the site.
            </p>
          )}
        </div>

        {/* Top pages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top pages (30 days)</h2>
          {data.topPages.length > 0 ? (
            <div className="space-y-2">
              {data.topPages.map((p, i) => (
                <div
                  key={p.path}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-5">{i + 1}</span>
                    <code className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {p.path || '/'}
                    </code>
                  </div>
                  <span className="font-medium text-gray-900">{p.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-8 text-center">
              No top pages data yet.
            </p>
          )}
        </div>
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent events</h2>
        {data.recentEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Event
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Path
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentEvents.map((ev: any) => (
                  <tr key={ev.id}>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {ev.eventType}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">{ev.path || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-8 text-center">
            No custom events yet. Use <code className="bg-gray-100 px-1 rounded">trackEvent()</code> in
            forms and downloads to record interactions.
          </p>
        )}
      </div>
    </div>
  )
}
