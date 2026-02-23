'use client'

import {
  LineChart,
  Line,
  Area,
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

type ViewsByDay = { date: string; count: number }
type EventsByDay = { date: string; views?: number; download?: number; form_submit?: number; page_view?: number; other?: number; total?: number }

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
