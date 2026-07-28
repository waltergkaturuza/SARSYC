import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'

const RANGES = {
  '7d': { interval: '7 days', days: 7, groupBy: 'day' as const },
  '14d': { interval: '14 days', days: 14, groupBy: 'day' as const },
  '30d': { interval: '30 days', days: 30, groupBy: 'day' as const },
  '3m': { interval: '90 days', days: 90, groupBy: 'week' as const },
  '1y': { interval: '365 days', days: 365, groupBy: 'month' as const },
}

function getRangeConfig(range: string) {
  const key = (range || '14d') as keyof typeof RANGES
  return RANGES[key] ?? RANGES['14d']
}

async function getUniqueVisitors(days: number): Promise<number> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return 0
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })
    const rows = await sql`
      SELECT COUNT(DISTINCT session_id)::int as count
      FROM page_views
      WHERE created_at >= NOW() - (${String(days)} || ' days')::interval
    `
    await sql.end()
    return Number(rows[0]?.count ?? 0)
  } catch {
    return 0
  }
}

async function getTopPages(days: number): Promise<{ path: string; count: number; displayPath: string }[]> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return []
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })
    const rows = await sql`
      SELECT 
        COALESCE(NULLIF(TRIM(TRAILING '/' FROM COALESCE(path, '')), ''), '/') as path,
        COUNT(*)::int as count
      FROM page_views
      WHERE created_at >= NOW() - (${String(days)} || ' days')::interval
      GROUP BY COALESCE(NULLIF(TRIM(TRAILING '/' FROM COALESCE(path, '')), ''), '/')
      ORDER BY count DESC
      LIMIT 20
    `
    await sql.end()
    const result = (rows as unknown as { path: string; count: number }[]).map((r) => ({
      ...r,
      displayPath: r.path === '/' || !r.path ? 'Home' : r.path,
    }))
    return result
  } catch {
    return []
  }
}

async function countPageViewsMatching(days: number, patterns: string[]): Promise<number> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl || patterns.length === 0) return 0
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })
    let total = 0
    for (const pattern of patterns) {
      const rows = await sql`
        SELECT COUNT(*)::int as count
        FROM page_views
        WHERE created_at >= NOW() - (${String(days)} || ' days')::interval
          AND path LIKE ${pattern}
      `
      total += Number(rows[0]?.count ?? 0)
    }
    await sql.end()
    return total
  } catch {
    return 0
  }
}

async function countSiteEvents(
  days: number,
  opts: { eventType?: string; metadataSource?: string } = {},
): Promise<number> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return 0
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })

    let rows
    if (opts.metadataSource) {
      rows = await sql`
        SELECT COUNT(*)::int as count
        FROM site_events
        WHERE created_at >= NOW() - (${String(days)} || ' days')::interval
          AND event_type = ${opts.eventType || 'download'}
          AND (
            metadata->>'source' = ${opts.metadataSource}
            OR metadata::text ILIKE ${'%' + opts.metadataSource + '%'}
          )
      `
    } else if (opts.eventType) {
      rows = await sql`
        SELECT COUNT(*)::int as count
        FROM site_events
        WHERE created_at >= NOW() - (${String(days)} || ' days')::interval
          AND event_type = ${opts.eventType}
      `
    } else {
      rows = await sql`
        SELECT COUNT(*)::int as count
        FROM site_events
        WHERE created_at >= NOW() - (${String(days)} || ' days')::interval
      `
    }

    await sql.end()
    return Number(rows[0]?.count ?? 0)
  } catch {
    return 0
  }
}

type ViewsByDay = { date: string; count: number }
type EventsByDay = { date: string; download?: number; form_submit?: number; page_view?: number; other?: number; total?: number }

async function getViewsByDay(config: { days: number; groupBy: string }): Promise<ViewsByDay[]> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return []
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })

    const rows =
      config.groupBy === 'day'
        ? ((await sql`
          SELECT DATE(created_at)::text as date, COUNT(*)::int as count
          FROM page_views
          WHERE created_at >= NOW() - (${String(config.days)} || ' days')::interval
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `) as unknown as { date: string; count: number }[])
        : config.groupBy === 'week'
        ? ((await sql`
          SELECT DATE_TRUNC('week', created_at)::date::text as date, COUNT(*)::int as count
          FROM page_views
          WHERE created_at >= NOW() - (${String(config.days)} || ' days')::interval
          GROUP BY DATE_TRUNC('week', created_at)
          ORDER BY date ASC
        `) as unknown as { date: string; count: number }[])
        : ((await sql`
          SELECT DATE_TRUNC('month', created_at)::date::text as date, COUNT(*)::int as count
          FROM page_views
          WHERE created_at >= NOW() - (${String(config.days)} || ' days')::interval
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY date ASC
        `) as unknown as { date: string; count: number }[])

    await sql.end()
    return fillDateGaps(rows, config.days, config.groupBy, (d) => ({ date: d, count: 0 }))
  } catch {
    return []
  }
}

async function getEventsByDay(config: { days: number; groupBy: string }): Promise<EventsByDay[]> {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) return []
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { max: 1 })

    const rows =
      config.groupBy === 'day'
        ? ((await sql`
          SELECT DATE(created_at)::text as date,
            COALESCE(SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END), 0)::int as download,
            COALESCE(SUM(CASE WHEN event_type = 'form_submit' THEN 1 ELSE 0 END), 0)::int as form_submit,
            COALESCE(SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END), 0)::int as page_view,
            COALESCE(SUM(CASE WHEN event_type NOT IN ('download','form_submit','page_view') THEN 1 ELSE 0 END), 0)::int as other
          FROM site_events
          WHERE created_at >= NOW() - (${String(config.days)} || ' days')::interval
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `) as unknown as EventsByDay[])
        : config.groupBy === 'week'
        ? ((await sql`
          SELECT DATE_TRUNC('week', created_at)::date::text as date,
            COALESCE(SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END), 0)::int as download,
            COALESCE(SUM(CASE WHEN event_type = 'form_submit' THEN 1 ELSE 0 END), 0)::int as form_submit,
            COALESCE(SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END), 0)::int as page_view,
            COALESCE(SUM(CASE WHEN event_type NOT IN ('download','form_submit','page_view') THEN 1 ELSE 0 END), 0)::int as other
          FROM site_events
          WHERE created_at >= NOW() - (${String(config.days)} || ' days')::interval
          GROUP BY DATE_TRUNC('week', created_at)
          ORDER BY date ASC
        `) as unknown as EventsByDay[])
        : ((await sql`
          SELECT DATE_TRUNC('month', created_at)::date::text as date,
            COALESCE(SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END), 0)::int as download,
            COALESCE(SUM(CASE WHEN event_type = 'form_submit' THEN 1 ELSE 0 END), 0)::int as form_submit,
            COALESCE(SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END), 0)::int as page_view,
            COALESCE(SUM(CASE WHEN event_type NOT IN ('download','form_submit','page_view') THEN 1 ELSE 0 END), 0)::int as other
          FROM site_events
          WHERE created_at >= NOW() - (${String(config.days)} || ' days')::interval
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY date ASC
        `) as unknown as EventsByDay[])

    await sql.end()
    return fillDateGaps(rows, config.days, config.groupBy, (d) => ({
      date: d,
      download: 0,
      form_submit: 0,
      page_view: 0,
      other: 0,
      total: 0,
    }))
  } catch {
    return []
  }
}

function fillDateGaps<T extends { date: string }>(
  rows: T[],
  days: number,
  groupBy: string,
  empty: (dateStr: string) => T
): T[] {
  const byDate = new Map<string, T>()
  const start = new Date()
  start.setDate(start.getDate() - days)

  const step = groupBy === 'day' ? 1 : groupBy === 'week' ? 7 : 30
  const count = groupBy === 'day' ? days : groupBy === 'week' ? Math.ceil(days / 7) : Math.ceil(days / 30)

  for (let i = 0; i < count; i++) {
    const d = new Date(start)
    if (groupBy === 'day') d.setDate(d.getDate() + i)
    else if (groupBy === 'week') d.setDate(d.getDate() + i * 7)
    else d.setMonth(d.getMonth() + i)
    const dateStr = d.toISOString().slice(0, 10)
    byDate.set(dateStr, empty(dateStr))
  }
  for (const r of rows) {
    const k = r.date.slice(0, 10)
    byDate.set(k, r)
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '14d'
    const config = getRangeConfig(range)

    const payload = await getPayloadClient()

    const sinceIso = new Date(Date.now() - config.days * 24 * 60 * 60 * 1000).toISOString()

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
      newsletterSubs,
      orathonRegs,
      partnershipInquiries,
      downloads,
      programmePdfDownloads,
      formSubmits,
      sessionsPageViews,
      steeringPageViews,
      programmePageViews,
      speakersPageViews,
      resourcesPageViews,
      newsPageViews,
      partnershipsPageViews,
      sarsycViPageViews,
      aboutPageViews,
      participatePageViews,
      mediaPageViews,
      contactPageViews,
    ] = await Promise.all([
      payload.find({ collection: 'page-views', limit: 0 }),
      getUniqueVisitors(config.days),
      getTopPages(config.days),
      getViewsByDay(config),
      getEventsByDay(config),
      payload.find({ collection: 'site-events', limit: 40, sort: '-createdAt' }).catch(() => ({ docs: [], totalDocs: 0 })),
      payload.find({ collection: 'registrations', limit: 0, where: { createdAt: { greater_than_equal: sinceIso } } }),
      payload.find({ collection: 'abstracts', limit: 0, where: { createdAt: { greater_than_equal: sinceIso } } }),
      payload.find({ collection: 'volunteers', limit: 0, where: { createdAt: { greater_than_equal: sinceIso } } }),
      payload.find({ collection: 'contact-messages', limit: 0, where: { createdAt: { greater_than_equal: sinceIso } } }),
      payload.find({ collection: 'newsletter-subscriptions', limit: 0 }).catch(() => ({ totalDocs: 0 })),
      payload.find({
        collection: 'orathon-registrations',
        limit: 0,
        where: { createdAt: { greater_than_equal: sinceIso } },
      }).catch(() => ({ totalDocs: 0 })),
      payload
        .find({
          collection: 'partnership-inquiries',
          limit: 0,
          where: { createdAt: { greater_than_equal: sinceIso } },
        })
        .catch(() => ({ totalDocs: 0 })),
      countSiteEvents(config.days, { eventType: 'download' }),
      countSiteEvents(config.days, { eventType: 'download', metadataSource: 'programme-pdf' }),
      countSiteEvents(config.days, { eventType: 'form_submit' }),
      countPageViewsMatching(config.days, ['/programme/sessions%']),
      countPageViewsMatching(config.days, [
        '/about/youth-steering-committee%',
        '/about/governance%',
      ]),
      countPageViewsMatching(config.days, ['/programme', '/programme/%']),
      countPageViewsMatching(config.days, ['/programme/speakers%']),
      countPageViewsMatching(config.days, ['/resources%']),
      countPageViewsMatching(config.days, ['/news', '/news/%']),
      countPageViewsMatching(config.days, ['/partnerships%']),
      countPageViewsMatching(config.days, ['/sarsyc-vi', '/sarsyc-vi/%']),
      countPageViewsMatching(config.days, ['/about', '/about/%']),
      countPageViewsMatching(config.days, ['/participate', '/participate/%']),
      countPageViewsMatching(config.days, ['/media', '/media/%']),
      countPageViewsMatching(config.days, ['/contact%']),
    ])

    const newsletterTotal = newsletterSubs?.totalDocs ?? 0
    let newsletterInRange = 0
    try {
      const subsInRange = await payload.find({
        collection: 'newsletter-subscriptions',
        limit: 0,
        where: { subscribedAt: { greater_than_equal: sinceIso } },
      })
      newsletterInRange = subsInRange.totalDocs
    } catch {
      newsletterInRange = 0
    }

    // Merge page views into events data so Events chart populates (page views are in page_views, not site_events)
    const viewsByDate = new Map(viewsByDayResult.map((v) => [v.date.slice(0, 10), v.count]))
    const eventsByDayWithViews = eventsByDayResult.map((r) => {
      const dateKey = r.date.slice(0, 10)
      const views = viewsByDate.get(dateKey) ?? 0
      const customTotal = (r.download ?? 0) + (r.form_submit ?? 0) + (r.page_view ?? 0) + (r.other ?? 0)
      return {
        ...r,
        views,
        total: views + customTotal,
      }
    })

    return NextResponse.json({
      totalPageViews: pageViewsResult.totalDocs,
      uniqueVisitors: uniqueVisitorsResult,
      topPages: topPagesResult,
      viewsByDay: viewsByDayResult,
      eventsByDay: eventsByDayWithViews,
      recentEvents: recentEvents.docs,
      interactionCounts: {
        registrations: registrations.totalDocs,
        abstracts: abstracts.totalDocs,
        volunteers: volunteers.totalDocs,
        contactMessages: contactMessages.totalDocs,
        newsletterSubscriptions: newsletterTotal,
        newsletterNewInRange: newsletterInRange,
        orathonRegistrations: orathonRegs?.totalDocs ?? 0,
        partnershipInquiries: partnershipInquiries?.totalDocs ?? 0,
        downloads,
        programmePdfDownloads,
        formSubmits,
        sessionsPageViews,
        steeringPageViews,
        programmePageViews,
        speakersPageViews,
        resourcesPageViews,
        newsPageViews,
        partnershipsPageViews,
        sarsycViPageViews,
        aboutPageViews,
        participatePageViews,
        mediaPageViews,
        contactPageViews,
      },
      rangeLabel: range === '7d' ? '7 days' : range === '14d' ? '14 days' : range === '30d' ? '30 days' : range === '3m' ? '3 months' : '1 year',
    })
  } catch (error: unknown) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
