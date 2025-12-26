import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendMail } from '@/lib/mail'

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

    // TODO: Store newsletter subscription in database
    // For now, we'll just send a confirmation email
    // You can create a NewsletterSubscribers collection if needed

    const payload = await getPayloadClient()

    // Send confirmation email
    const subject = 'Welcome to SARSYC VI Newsletter!'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0ea5e9;">Thank You for Subscribing!</h2>
        <p>Dear ${firstName || 'Subscriber'},</p>
        <p>You've successfully subscribed to the SARSYC VI newsletter. You'll now receive:</p>
        <ul>
          <li>Conference updates and announcements</li>
          <li>Speaker announcements</li>
          <li>Programme updates</li>
          <li>Important deadlines and reminders</li>
          <li>Youth health and education news</li>
        </ul>
        <p>We're excited to have you join our community as we prepare for SARSYC VI in Windhoek, Namibia (August 5-7, 2026).</p>
        <p>If you did not subscribe, please ignore this email.</p>
        <p>Best regards,<br>The SARSYC VI Team</p>
      </div>
    `
    const text = `
Thank You for Subscribing!

Dear ${firstName || 'Subscriber'},

You've successfully subscribed to the SARSYC VI newsletter. You'll now receive:
- Conference updates and announcements
- Speaker announcements
- Programme updates
- Important deadlines and reminders
- Youth health and education news

We're excited to have you join our community as we prepare for SARSYC VI in Windhoek, Namibia (August 5-7, 2026).

If you did not subscribe, please ignore this email.

Best regards,
The SARSYC VI Team
    `

    await sendMail({
      to: email,
      subject,
      html,
      text,
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

