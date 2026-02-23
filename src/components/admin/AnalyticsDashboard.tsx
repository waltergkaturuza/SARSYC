'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FiUsers,
  FiFileText,
  FiActivity,
  FiDownload,
  FiInbox,
  FiSettings,
  FiFilter,
  FiMail,
  FiCalendar,
} from 'react-icons/fi'
import { PageViewsChart, EventsChart } from '@/components/admin/AnalyticsCharts'

type TimeRange = '7d' | '14d' | '30d' | '3m' | '1y'

type AnalyticsData = {
  totalPageViews: number
  uniqueVisitors: number
  topPages: { path: string; count: number }[]
  viewsByDay: { date: string; count: number }[]
  eventsByDay: { date: string; download?: number; form_submit?: number; page_view?: number; other?: number; total?: number }[]
  recentEvents: { id: string; eventType: string; path?: string; createdAt: string }[]
  interactionCounts: {
    registrations: number
    abstracts: number
    volunteers: number
    contactMessages: number
    newsletterSubscriptions: number
    newsletterNewInRange: number
    orathonRegistrations: number
  }
  rangeLabel: string
}

const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: '3m', label: '3 months' },
  { value: '1y', label: '1 year' },
]

const defaultData: AnalyticsData = {
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
    newsletterSubscriptions: 0,
    newsletterNewInRange: 0,
    orathonRegistrations: 0,
  },
  rangeLabel: '14 days',
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState<TimeRange>('14d')
  const [data, setData] = useState<AnalyticsData>(defaultData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/admin/analytics?range=${range}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch analytics')
        return res.json()
      })
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Error loading analytics')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [range])

  const viewsToday =
    data.viewsByDay.length > 0 ? data.viewsByDay[data.viewsByDay.length - 1]?.count ?? 0 : 0

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Header with time filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Site visitors and interactions</p>
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-slate-500" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as TimeRange)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
              <FiSettings className="w-4 h-4 text-slate-500" />
              Tracking settings
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Window: {data.rangeLabel}</p>
              <p>Unique visitors: {data.rangeLabel}</p>
            </div>
          </div>

          {/* Page views chart */}
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

          {/* Unique visitors */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-medium text-slate-900 mb-1">Unique visitors</h3>
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">{data.rangeLabel}</p>
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

          {/* Events chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-medium text-slate-900 mb-1">Events</h3>
            <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">
              By type ({data.rangeLabel})
            </p>
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
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">{data.rangeLabel}</p>
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

          {/* Key interactions - incl newsletters, subscriptions */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Key interactions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                href="/admin/registrations"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <FiUsers className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{data.interactionCounts.registrations}</div>
                  <div className="text-xs text-slate-500">Registrations</div>
                </div>
              </Link>
              <Link
                href="/admin/abstracts"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <FiFileText className="w-5 h-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{data.interactionCounts.abstracts}</div>
                  <div className="text-xs text-slate-500">Abstracts</div>
                </div>
              </Link>
              <Link
                href="/admin/volunteers"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <FiActivity className="w-5 h-5 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{data.interactionCounts.volunteers}</div>
                  <div className="text-xs text-slate-500">Volunteers</div>
                </div>
              </Link>
              <Link
                href="/admin/contact-messages"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <FiInbox className="w-5 h-5 text-orange-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{data.interactionCounts.contactMessages}</div>
                  <div className="text-xs text-slate-500">Contact</div>
                </div>
              </Link>
              <Link
                href="/admin/newsletter-subscriptions"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <FiMail className="w-5 h-5 text-teal-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{data.interactionCounts.newsletterSubscriptions}</div>
                  <div className="text-xs text-slate-500">
                    Newsletters (+{data.interactionCounts.newsletterNewInRange} in period)
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/orathon-registrations"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <FiCalendar className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{data.interactionCounts.orathonRegistrations}</div>
                  <div className="text-xs text-slate-500">Orathon</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent events */}
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
                    {data.recentEvents.map((ev) => (
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
      )}
    </div>
  )
}
