import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Validation schema
const partnershipInquirySchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  tier: z.enum(['platinum', 'gold', 'silver', 'bronze', 'exhibitor', 'custom']),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = partnershipInquirySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { organizationName, contactPerson, email, phone, tier, message } = validationResult.data

    const payload = await getPayloadClient()

    // Store the inquiry in the database
    const inquiry = await payload.create({
      collection: 'partnership-inquiries',
      data: {
        organizationName,
        contactPerson,
        email,
        phone: phone || null,
        tier,
        message: message || null,
        status: 'new',
      },
    })

    // TODO: Send email notification to admin
    // This can be implemented when email adapter is configured
    // await sendMail({
    //   to: process.env.ADMIN_EMAIL || 'admin@sarsyc.org',
    //   subject: `New Partnership Inquiry: ${organizationName}`,
    //   html: `...`,
    // })

    return NextResponse.json({
      success: true,
      message: 'Your partnership inquiry has been submitted successfully. We\'ll contact you within 24 hours.',
      id: inquiry.id,
    })
  } catch (error: any) {
    console.error('Partnership inquiry error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit inquiry. Please try again.',
      },
      { status: 500 }
    )
  }
}





