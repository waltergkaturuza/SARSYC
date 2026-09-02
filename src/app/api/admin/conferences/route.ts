import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { ensureLockedDocsRelsColumns } from '@/lib/ensureLockedDocsRelsColumns'
import { seedPreviousConferencesIfEmpty } from '@/lib/conferencesContent'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { createAuditLog } from '@/lib/audit'
import {
  normalizeConferenceBody,
  resolveConferenceGallery,
  resolveConferenceFeaturedSpeakers,
  syncConferenceGallery,
  syncConferenceFeaturedSpeakers,
} from '@/lib/conferenceAdmin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function canManageConferences(user: { role?: string | null } | null): boolean {
  if (!user?.role) return false
  return user.role === 'admin' || user.role === 'editor'
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!canManageConferences(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)
    await ensureLockedDocsRelsColumns(payload)
    await seedPreviousConferencesIfEmpty(payload)

    const results = await payload.find({
      collection: 'conferences',
      limit: 100,
      sort: '-year',
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, docs: results.docs, totalDocs: results.totalDocs })
  } catch (error: any) {
    console.error('List conferences error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list conferences' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!canManageConferences(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)
    await ensureLockedDocsRelsColumns(payload)
    const body = await request.json()
    const data = normalizeConferenceBody(body)
    const gallery = await resolveConferenceGallery(payload, body.gallery, data.title)
    const featuredSpeakers = await resolveConferenceFeaturedSpeakers(
      payload,
      body.featuredSpeakers,
    )

    const conference = await payload.create({
      collection: 'conferences',
      data,
      overrideAccess: true,
      depth: 0,
      context: { skipAudit: true },
    })

    await syncConferenceGallery(payload, conference.id, gallery)
    await syncConferenceFeaturedSpeakers(payload, conference.id, featuredSpeakers)

    await createAuditLog(
      payload,
      {
        action: 'create',
        collection: 'conferences',
        documentId: conference.id,
        userId: user!.id,
        userEmail: user!.email,
        userRole: user!.role as string | undefined,
        after: {
          ...data,
          galleryCount: gallery.length,
          featuredSpeakersCount: featuredSpeakers.length,
        },
        description: `Created conference "${data.title}" (ID: ${conference.id}) — ${gallery.length} gallery photos, ${featuredSpeakers.length} featured speakers`,
        metadata: {
          title: data.title,
          year: data.year,
          galleryCount: gallery.length,
          featuredSpeakersCount: featuredSpeakers.length,
          featuredSpeakerNames: featuredSpeakers.map((s) => s.name),
        },
      },
      request,
    )

    const full = await payload.findByID({
      collection: 'conferences',
      id: conference.id,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc: full })
  } catch (error: any) {
    console.error('Create conference error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create conference' },
      { status: 500 },
    )
  }
}
