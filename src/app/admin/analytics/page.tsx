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
  FiDownload,
  FiInbox,
  FiSettings,
} from 'react-icons/fi'
import { PageViewsChart, EventsChart } from '@/components/admin/AnalyticsCharts'

export const revalidate = 0

async function getAnalyticsData() {
  const payload = await getPayloadClient()

  const [
    pageViewsResult,
    uniqueVisitorsResult,
    topPagesResult,
    viewsByDayResult,
    eventsByDayResult,
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
    getEventsByDay(),
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
    eventsByDay: eventsByDayResult,
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
    const byDate = new Map<string, number>()
    const start = new Date()
    start.setDate(start.getDate() - 13)
    for (let i = 0; i < 14; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      byDate.set(d.toISOString().slice(0, 10), 0)
    }
    for (const r of rows as unknown as { date: string; count: number }[]) {
      byDate.set(r.date, r.count)
    }
    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))
  } catch {
    return []
  }
}

type EventsByDay = { date: string; download?: number; form_submit?: number; page_view?: number; other?: number; total?: number }

async function getEventsByDay(): Promise<EventsByDay[]> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return []
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })
    const rows = await sql`
      SELECT 
        DATE(created_at)::text as date,
        COALESCE(SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END), 0)::int as download,
        COALESCE(SUM(CASE WHEN event_type = 'form_submit' THEN 1 ELSE 0 END), 0)::int as form_submit,
        COALESCE(SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END), 0)::int as page_view,
        COALESCE(SUM(CASE WHEN event_type NOT IN ('download','form_submit','page_view') THEN 1 ELSE 0 END), 0)::int as other
      FROM site_events
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
    await sql.end()
    const byDate = new Map<string, EventsByDay>()
    const start = new Date()
    start.setDate(start.getDate() - 13)
    for (let i = 0; i < 14; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      byDate.set(dateStr, {
        date: dateStr,
        download: 0,
        form_submit: 0,
        page_view: 0,
        other: 0,
        total: 0,
      })
    }
    for (const r of rows as unknown as EventsByDay[]) {
      const existing = byDate.get(r.date)
      if (existing) {
        existing.download = r.download ?? 0
        existing.form_submit = r.form_submit ?? 0
        existing.page_view = r.page_view ?? 0
        existing.other = r.other ?? 0
        existing.total =
          (existing.download ?? 0) +
          (existing.form_submit ?? 0) +
          (existing.page_view ?? 0) +
          (existing.other ?? 0)
      }
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
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
      eventsByDay: [],
      recentEvents: [],
      interactionCounts: {
        registrations: 0,
        abstracts: 0,
        volunteers: 0,
        contactMessages: 0,
      },
    }
  }

  const viewsToday =
    data.viewsByDay.length > 0 ? data.viewsByDay[data.viewsByDay.length - 1]?.count ?? 0 : 0

  return (
    <div className="min-h-screen bg-slate-50/80">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Site visitors and interactions</p>
      </div>

      {/* Neon-style grid: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings card - informational */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <FiSettings className="w-4 h-4 text-slate-500" />
            Tracking settings
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>Window: Last 14 days</p>
            <p>Unique visitors: 30 days</p>
          </div>
        </div>

        {/* Page views - line chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Page views</h3>
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">Count</p>
          {data.viewsByDay.length > 0 ? (
            <PageViewsChart data={data.viewsByDay} />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              No data yet. Visitors will appear as they browse.
            </div>
          )}
        </div>

        {/* Unique visitors - metric card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Unique visitors</h3>
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">30 days</p>
          <div className="text-3xl font-semibold text-slate-900">
            {data.uniqueVisitors.toLocaleString()}
          </div>
        </div>

        {/* Total page views */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Total page views</h3>
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">All time</p>
          <div className="text-3xl font-semibold text-slate-900">
            {data.totalPageViews.toLocaleString()}
          </div>
        </div>

        {/* Views today */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Views today</h3>
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">Count</p>
          <div className="text-3xl font-semibold text-slate-900">{viewsToday}</div>
        </div>

        {/* Events by type - stacked area */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-1">Events</h3>
          <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">By type (last 14 days)</p>
          {data.eventsByDay.length > 0 ? (
            <EventsChart data={data.eventsByDay} />
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              No events yet. Downloads and form submissions will appear here.
            </div>
          )}
        </div>

        {/* Top pages */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Top pages</h3>
          <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">30 days</p>
          {data.topPages.length > 0 ? (
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {data.topPages.map((p, i) => (
                <div
                  key={p.path}
                  className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                >
                  <span className="text-slate-400 text-xs w-4">{i + 1}</span>
                  <code className="text-xs text-slate-700 truncate flex-1 mx-1">
                    {p.path || '/'}
                  </code>
                  <span className="font-medium text-slate-900 text-sm">{p.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8">No data yet.</p>
          )}
        </div>

        {/* Key interactions - links */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Key interactions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/registrations"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <FiUsers className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-slate-900">{data.interactionCounts.registrations}</div>
                <div className="text-xs text-slate-500">Registrations</div>
              </div>
            </Link>
            <Link
              href="/admin/abstracts"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <FiFileText className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold text-slate-900">{data.interactionCounts.abstracts}</div>
                <div className="text-xs text-slate-500">Abstracts</div>
              </div>
            </Link>
            <Link
              href="/admin/volunteers"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <FiActivity className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-semibold text-slate-900">{data.interactionCounts.volunteers}</div>
                <div className="text-xs text-slate-500">Volunteers</div>
              </div>
            </Link>
            <Link
              href="/admin/contact-messages"
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <FiInbox className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-semibold text-slate-900">{data.interactionCounts.contactMessages}</div>
                <div className="text-xs text-slate-500">Contact form</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent events table */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Recent events</h3>
          {data.recentEvents.length > 0 ? (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Path
                    </th>
                    <th className="py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentEvents.map((ev: any) => (
                    <tr key={ev.id}>
                      <td className="py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          {ev.eventType}
                        </span>
                      </td>
                      <td className="py-2 text-sm text-slate-600">{ev.path || '—'}</td>
                      <td className="py-2 text-sm text-slate-500">
                        {new Date(ev.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-sm py-8 text-center">
              No custom events yet. Use <code className="bg-slate-100 px-1 rounded">trackEvent()</code>{' '}
              in forms and downloads to record interactions.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
