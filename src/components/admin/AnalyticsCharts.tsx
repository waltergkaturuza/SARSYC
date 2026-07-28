'use client'

import {
  LineChart,
  Line,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

const CHART_COLORS = {
  views: '#0284c7', // primary-600 - page views from page_views table
  download: '#16a34a', // green
  form_submit: '#1d4ed8', // dark blue
  page_view: '#0ea5e9', // primary-500 - custom page_view events (rare)
  other: '#64748b', // slate
}

const PAGE_ENGAGEMENT_COLORS: Record<string, string> = {
  Sessions: '#e11d48',
  Programme: '#0284c7',
  Speakers: '#c026d3',
  'Steering / Governance': '#059669',
  About: '#0891b2',
  'SARSYC VI': '#2563eb',
  Participate: '#ea580c',
  Resources: '#b45309',
  News: '#475569',
  Partnerships: '#f43f5e',
  Media: '#6366f1',
  Contact: '#0d9488',
}

type ViewsByDay = { date: string; count: number }
type EventsByDay = { date: string; views?: number; download?: number; form_submit?: number; page_view?: number; other?: number; total?: number }

export type PageEngagementDatum = {
  section: string
  views: number
}

export function PageViewsChart({ data }: { data: ViewsByDay[] }) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }))

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => String(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#334155', fontWeight: 600 }}
            formatter={(value: number) => [value, 'Views']}
            labelFormatter={(_: string, payload: { payload?: { date?: string } }[]) =>
              payload?.[0]?.payload?.date
                ? new Date(payload[0].payload.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
                : ''
            }
          />
          <Legend
            wrapperStyle={{ paddingTop: 8 }}
            iconType="line"
            iconSize={10}
            formatter={() => 'Page views'}
          />
          <Line
            type="monotone"
            dataKey="count"
            name="Page views"
            stroke={CHART_COLORS.views}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS.views }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EventsChart({ data }: { data: EventsByDay[] }) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  }))

  const hasData = chartData.some((d) => (d.total ?? 0) > 0 || (d.views ?? 0) > 0)

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => String(v)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#334155', fontWeight: 600 }}
            formatter={(value: number, name: string) => [value ?? 0, name.replace(/_/g, ' ')]}
            labelFormatter={(_: string, payload: { payload?: { date?: string } }[]) =>
              payload?.[0]?.payload?.date
                ? new Date(payload[0].payload.date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
                : ''
            }
          />
          <Legend wrapperStyle={{ paddingTop: 8 }} iconType="square" iconSize={10} />
          {hasData && (
            <>
              <Area
                type="monotone"
                dataKey="views"
                name="Page views"
                stackId="1"
                fill={CHART_COLORS.views}
                stroke={CHART_COLORS.views}
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="download"
                name="Download"
                stackId="1"
                fill={CHART_COLORS.download}
                stroke={CHART_COLORS.download}
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="form_submit"
                name="Form submit"
                stackId="1"
                fill={CHART_COLORS.form_submit}
                stroke={CHART_COLORS.form_submit}
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="page_view"
                name="Page view"
                stackId="1"
                fill={CHART_COLORS.page_view}
                stroke={CHART_COLORS.page_view}
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="other"
                name="Other"
                stackId="1"
                fill={CHART_COLORS.other}
                stroke={CHART_COLORS.other}
                strokeWidth={1}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PageEngagementChart({ data }: { data: PageEngagementDatum[] }) {
  const chartData = [...data].sort((a, b) => b.views - a.views)
  const hasData = chartData.some((d) => d.views > 0)

  if (!hasData) {
    return (
      <div className="h-[320px] flex items-center justify-center text-slate-400 text-sm">
        No page views in this period yet.
      </div>
    )
  }

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="section"
            width={132}
            tick={{ fontSize: 11, fill: '#334155' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#334155', fontWeight: 600 }}
            formatter={(value: number) => [value.toLocaleString(), 'Views']}
          />
          <Legend
            wrapperStyle={{ paddingTop: 12 }}
            iconType="square"
            iconSize={10}
            payload={chartData.map((d) => ({
              value: d.section,
              type: 'square' as const,
              color: PAGE_ENGAGEMENT_COLORS[d.section] || CHART_COLORS.other,
            }))}
          />
          <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {chartData.map((entry) => (
              <Cell
                key={entry.section}
                fill={PAGE_ENGAGEMENT_COLORS[entry.section] || CHART_COLORS.other}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
