import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { ensureYouthSteeringCommitteeLatestColumns } from '@/lib/ensureYouthSteeringCommitteeSchema'
import { seedYouthSteeringCommitteeFromStatic } from '@/lib/seedYouthSteeringCommittee'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

async function runSeed(request: NextRequest) {
  const migrateKey = request.nextUrl.searchParams.get('key')
  const expectedKey = process.env.MIGRATE_SECRET || process.env.PAYLOAD_SECRET
  const keyOk = Boolean(migrateKey && expectedKey && migrateKey === expectedKey)

  if (!keyOk) {
    const user = await getCurrentUserFromRequest(request)
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const payload = await getPayloadClient()
  await ensureYouthSteeringCommitteeLatestColumns(payload)
  const result = await seedYouthSteeringCommitteeFromStatic(payload)

  return NextResponse.json({
    success: result.errors.length === 0,
    ...result,
  })
}

export async function GET(request: NextRequest) {
  try {
    return await runSeed(request)
  } catch (error: any) {
    console.error('Youth steering committee seed failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to seed youth steering committee' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    return await runSeed(request)
  } catch (error: any) {
    console.error('Youth steering committee seed failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to seed youth steering committee' },
      { status: 500 },
    )
  }
}
