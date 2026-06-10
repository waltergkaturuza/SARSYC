import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendNewsletterWelcomeEmail } from '@/lib/mail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Check if email already exists
    const existing = await payload.find({
      collection: 'newsletter-subscriptions',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    // If already subscribed and active, return success
    if (existing.totalDocs > 0) {
      const subscription = existing.docs[0]
      if (subscription.status === 'subscribed') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
        })
      }
      
      // If unsubscribed, resubscribe them
      await payload.update({
        collection: 'newsletter-subscriptions',
        id: subscription.id,
        data: {
          status: 'subscribed',
          firstName: firstName || subscription.firstName,
          lastName: lastName || subscription.lastName,
          subscribedAt: new Date().toISOString(),
          unsubscribedAt: null,
        },
      })
    } else {
      // Create new subscription
      await payload.create({
        collection: 'newsletter-subscriptions',
        data: {
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          status: 'subscribed',
          subscribedAt: new Date().toISOString(),
        },
      })
    }

    await sendNewsletterWelcomeEmail({
      to: email,
      firstName,
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Newsletter subscription failed',
      },
      { status: 500 }
    )
  }
}



