import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Public API endpoint to track registration and abstract status by Registration ID
 * This allows applicants to check their application status without authentication
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('registrationId')

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Find registration by registrationId
    const registrationResult = await payload.find({
      collection: 'registrations',
      where: {
        registrationId: { equals: registrationId.trim() },
      },
      limit: 1,
      depth: 0, // No need to populate relationships for public tracking
    })

    let registration = null
    if (registrationResult.docs.length > 0) {
      const reg = registrationResult.docs[0]
      registration = {
        id: reg.id,
        registrationId: reg.registrationId || `REG-${reg.id}`,
        firstName: reg.firstName,
        lastName: reg.lastName,
        email: reg.email,
        phone: reg.phone,
        status: reg.status || 'pending',
        paymentStatus: reg.paymentStatus || 'pending',
        category: reg.category,
        organization: reg.organization,
        country: reg.country,
        createdAt: reg.createdAt,
        updatedAt: reg.updatedAt,
      }
    }

    // Find abstracts by registration email (primary author email)
    // We use email to link abstracts to registrations
    let abstracts: any[] = []
    if (registration?.email) {
      const abstractsResult = await payload.find({
        collection: 'abstracts',
        where: {
          'primaryAuthor.email': { equals: registration.email },
        },
        sort: '-createdAt',
        depth: 0,
      })

      abstracts = abstractsResult.docs.map((abstract: any) => ({
        id: abstract.id,
        submissionId: abstract.submissionId || `ABS-${abstract.id}`,
        title: abstract.title,
        status: abstract.status || 'received',
        track: abstract.track,
        submittedDate: abstract.createdAt,
        reviewerComments: abstract.reviewerComments,
        adminNotes: abstract.adminNotes,
      }))
    }

    return NextResponse.json({
      success: true,
      registration,
      abstracts,
    })
  } catch (error: any) {
    console.error('Track API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration status', details: error.message },
      { status: 500 }
    )
  }
}

