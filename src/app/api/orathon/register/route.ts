import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const data = await request.json()

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
