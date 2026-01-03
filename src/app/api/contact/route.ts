import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Validation schema
const contactSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.enum(['general', 'registration', 'abstract', 'partnership', 'media', 'technical', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = contactSchema.safeParse(body)
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

    const { firstName, lastName, email, subject, message } = validationResult.data

    const payload = await getPayloadClient()

    // Store the message in the database
    const contactMessage = await payload.create({
      collection: 'contact-messages',
      data: {
        firstName,
        lastName,
        email,
        subject,
        message,
        status: 'new',
      },
    })

    // TODO: Send email notification to admin
    // This can be implemented when email adapter is configured
    // await sendMail({
    //   to: process.env.ADMIN_EMAIL || 'admin@sarsyc.org',
    //   subject: `New Contact Message: ${subject}`,
    //   html: `...`,
    // })

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you within 24-48 hours.',
      id: contactMessage.id,
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send message. Please try again.',
      },
      { status: 500 }
    )
  }
}





