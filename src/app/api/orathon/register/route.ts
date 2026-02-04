import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const data = await request.json()

    // Prevent duplicate registrations by email
    if (data?.email) {
      const existing = await payload.find({
        collection: 'orathon-registrations',
        where: { email: { equals: data.email } },
        limit: 1,
        depth: 0,
      })
      if (existing.docs?.length) {
        const doc = existing.docs[0]
        return NextResponse.json(
          {
            success: false,
            error: 'You have already registered for the Orathon with this email.',
            registration: {
              id: doc.id,
              email: doc.email,
              registrationId: doc.registrationId,
              status: doc.status,
            },
          },
          { status: 409 }
        )
      }
    }

    // Create Orathon registration
    const registration = await payload.create({
      collection: 'orathon-registrations',
      data: {
        ...data,
        status: 'pending',
      },
    })

    // TODO: Send confirmation email
    // await sendOrathonConfirmationEmail(registration)

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        registration: {
          id: registration.id,
          email: registration.email,
          registrationId: registration.registrationId,
          status: registration.status,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Orathon registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      },
      { status: 500 }
    )
  }
}
