import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { ensureLockedDocsRelsColumns } from '@/lib/ensureLockedDocsRelsColumns'
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    let beforeDoc: Record<string, unknown> | null = null
    try {
      beforeDoc = (await payload.findByID({
        collection: 'conferences',
        id: params.id,
        depth: 0,
        overrideAccess: true,
      })) as Record<string, unknown>
    } catch {
      beforeDoc = null
    }

    const conference = await payload.update({
      collection: 'conferences',
      id: params.id,
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
        action: 'update',
        collection: 'conferences',
        documentId: conference.id,
        userId: user!.id,
        userEmail: user!.email,
        userRole: user!.role as string | undefined,
        before: beforeDoc || undefined,
        after: {
          ...data,
          galleryCount: gallery.length,
          featuredSpeakersCount: featuredSpeakers.length,
        },
        description: `Updated conference "${data.title}" (ID: ${conference.id}) — ${gallery.length} gallery photos, ${featuredSpeakers.length} featured speakers`,
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
    console.error('Update conference error:', {
      message: error.message,
      data: error.data,
      errors: error.errors || error.data?.errors,
      stack: error.stack,
    })

    const validationErrors = error.data?.errors || error.errors
    const validationMessage = Array.isArray(validationErrors)
      ? validationErrors
          .map((e: any) => e.message || e.label || JSON.stringify(e))
          .filter(Boolean)
          .join('; ')
      : null

    return NextResponse.json(
      {
        error: validationMessage || error.message || 'Failed to update conference',
        validationErrors: validationErrors || undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(request)
    if (!canManageConferences(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayloadClient()
    await ensureConferencesSchema(payload)

    let beforeDoc: Record<string, unknown> | null = null
    try {
      beforeDoc = (await payload.findByID({
        collection: 'conferences',
        id: params.id,
        depth: 0,
        overrideAccess: true,
      })) as Record<string, unknown>
    } catch {
      beforeDoc = null
    }

    await payload.delete({
      collection: 'conferences',
      id: params.id,
      overrideAccess: true,
      context: { skipAudit: true },
    })

    await createAuditLog(
      payload,
      {
        action: 'delete',
        collection: 'conferences',
        documentId: params.id,
        userId: user!.id,
        userEmail: user!.email,
        userRole: user!.role as string | undefined,
        before: beforeDoc || undefined,
        description: `Deleted conference${beforeDoc?.title ? ` "${String(beforeDoc.title)}"` : ''} (ID: ${params.id})`,
        metadata: {
          title: beforeDoc?.title,
          year: beforeDoc?.year,
        },
      },
      request,
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete conference error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete conference' },
      { status: 500 },
    )
  }
}
