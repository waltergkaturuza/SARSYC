import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { logExport, incrementFallback } from '@/lib/telemetry'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const RATE_LIMIT_MAX = 3 // max exports per window
const rateLimitMap = new Map<string, { timestamps: number[] }>()

function snakeCase(s: string) {
  return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`).replace(/\s+/g, '_')
}

function toCsv(rows: Record<string, any>[], columns: string[]) {
  const hdr = columns.map((c) => snakeCase(c)).join(',')
  const lines = rows.map((r) => {
    return columns
      .map((col) => {
        const v = r[col]
        if (v == null) return ''
        if (typeof v === 'object') return `"${JSON.stringify(v).replace(/"/g, '""')}"`
        const str = String(v)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(',')
  })
  return [hdr, ...lines].join('\n')
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    
    // Get current authenticated user from session
    const foundUser = await getCurrentUserFromRequest(req)
    
    if (!foundUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to access this resource.' }, { status: 401 })
    }
    
    if (!['admin', 'super-admin'].includes(foundUser.role)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const payload = await getPayloadClient()

    // Rate limiting
    const key = `exports:${foundUser.id}`
    const entry = rateLimitMap.get(key) || { timestamps: [] }
    const now = Date.now()
    entry.timestamps = entry.timestamps.filter((t) => t > now - RATE_LIMIT_WINDOW_MS)
    if (entry.timestamps.length >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    entry.timestamps.push(now)
    rateLimitMap.set(key, entry)

    // Fetch registrations (allow query params for filters later)
    const results = await payload.find({ collection: 'registrations', limit: 10000, sort: '-createdAt' })
    const docs = results?.docs || []

    // Assemble CSV columns (snake_case headers required by request)
    const columns = [
      'registrationId',
      'firstName',
      'lastName',
      'email',
      'status',
      'paymentStatus',
      'category',
      'ticketType',
      'country',
      'organization',
      'gender',
      'phone',
      'checkedIn',
      'checkedInAt',
      'source',
      'createdAt',
      'updatedAt',
      'notes',
      'metadata',
    ]

    // Map docs to flat rows
    const rows = docs.map((d: any) => ({
      registrationId: d.registrationId || d.registrationId || d.registration_id || d.registrationId,
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      email: d.email || '',
      status: d.status || '',
      paymentStatus: d.paymentStatus || '',
      category: d.category || '',
      ticketType: d.ticketType || '',
      country: d.country || '',
      organization: d.organization || d.organization || '',
      gender: d.gender || '',
      phone: d.phone || '',
      checkedIn: d.checkedIn || false,
      checkedInAt: d.checkedInAt || '',
      source: d.source || '',
      createdAt: d.createdAt || '',
      updatedAt: d.updatedAt || '',
      notes: d.notes || '',
      metadata: d.metadata || null,
    }))

    const csv = toCsv(rows, columns)

    // Audit log
    await incrementFallback('exports.registrations')
    await logExport('registrations', { user: { id: foundUser.id, email: foundUser.email }, count: rows.length })

    const filename = `registrations-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('Export error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Export failed' }, { status: 500 })
  }
}
