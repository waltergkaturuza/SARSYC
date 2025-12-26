import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Find user's registration by email
    const registrations = await payload.find({
      collection: 'registrations',
      where: {
        email: { equals: email },
      },
      limit: 1,
      sort: '-createdAt',
    })

    // Find user's abstracts by email (primary author email)
    const abstracts = await payload.find({
      collection: 'abstracts',
      where: {
        'primaryAuthor.email': { equals: email },
      },
      sort: '-createdAt',
    })

    // Get latest registration if exists
    const registration = registrations.docs.length > 0 ? registrations.docs[0] : null

    // Format abstracts for dashboard
    const abstractSubmissions = abstracts.docs.map((abstract: any) => ({
      id: abstract.id.toString(),
      title: abstract.title,
      submissionId: abstract.submissionId || `ABS-${abstract.id}`,
      status: abstract.status || 'received',
      submittedDate: abstract.createdAt,
      track: abstract.track,
    }))

    return NextResponse.json({
      registration: registration ? {
        id: registration.id,
        firstName: registration.firstName,
        lastName: registration.lastName,
        email: registration.email,
        registrationId: registration.registrationId || `REG-${registration.id}`,
        status: registration.status || 'pending',
        paymentStatus: registration.paymentStatus || 'pending',
        category: registration.category,
        country: registration.country,
        organization: registration.organization,
        createdAt: registration.createdAt,
      } : null,
      abstractSubmissions,
    })
  } catch (error: any) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}


