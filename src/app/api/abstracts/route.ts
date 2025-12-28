import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendMail } from '@/lib/mail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = await getPayloadClient()

    // Transform keywords from string to array
    const keywords = body.keywords 
      ? body.keywords.split(',').map((k: string) => ({ keyword: k.trim() }))
      : []

    // Transform coAuthors from array of strings or objects to proper format
    let coAuthors = []
    if (body.coAuthors && Array.isArray(body.coAuthors)) {
      coAuthors = body.coAuthors.map((ca: any) => {
        if (typeof ca === 'string') {
          // If it's just a string, assume it's a name
          return { name: ca.trim(), organization: '' }
        }
        // If it's an object, use it as is
        return { name: ca.name?.trim() || '', organization: ca.organization?.trim() || '' }
      }).filter((ca: any) => ca.name.length > 0)
    }

    // Create abstract submission
    // Use overrideAccess: true to bypass access control since this is a public submission endpoint
    // Note: abstractFile is not included here as the public form doesn't support file uploads
    const abstract = await payload.create({
      collection: 'abstracts',
      data: {
        title: body.title,
        abstract: body.abstract,
        keywords: keywords,
        track: body.track,
        primaryAuthor: body.primaryAuthor,
        coAuthors: coAuthors,
        presentationType: body.presentationType,
        status: 'received',
        // Explicitly set abstractFile to undefined/null to avoid storage adapter issues
        abstractFile: undefined,
      },
      overrideAccess: true, // Bypass access control for public submissions
    })

    // Send confirmation email
    try {
      const subject = `Abstract Submission Confirmation — ${abstract.submissionId || abstract.id}`
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0ea5e9;">Abstract Submission Received</h2>
          <p>Dear ${abstract.primaryAuthor?.firstName || 'Author'},</p>
          <p>Thank you for submitting your abstract "<strong>${abstract.title}</strong>" to SARSYC VI.</p>
          <p><strong>Submission ID:</strong> ${abstract.submissionId || abstract.id}</p>
          <p><strong>Track:</strong> ${abstract.track}</p>
          <p><strong>Status:</strong> Received - Under Review</p>
          <p>Our review committee will evaluate your submission and notify you of the outcome. You can expect to hear back within 4-6 weeks.</p>
          <p>We appreciate your contribution to SARSYC VI and look forward to potentially featuring your work.</p>
          <p>Best regards,<br>The SARSYC VI Steering Committee</p>
        </div>
      `
      const text = `
Abstract Submission Received

Dear ${abstract.primaryAuthor?.firstName || 'Author'},

Thank you for submitting your abstract "${abstract.title}" to SARSYC VI.

Submission ID: ${abstract.submissionId || abstract.id}
Track: ${abstract.track}
Status: Received - Under Review

Our review committee will evaluate your submission and notify you of the outcome. You can expect to hear back within 4-6 weeks.

Best regards,
The SARSYC VI Steering Committee
      `

      await sendMail({
        to: abstract.primaryAuthor?.email || '',
        subject,
        html,
        text,
      })
    } catch (emailError: any) {
      // Log but don't fail the submission if email fails
      console.error('Failed to send abstract confirmation email:', emailError)
    }

    console.log('Abstract submitted:', abstract.submissionId)

    return NextResponse.json({
      success: true,
      doc: abstract,
      message: 'Abstract submitted successfully',
    })
  } catch (error: any) {
    console.error('Abstract submission error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Submission failed',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = { equals: status }
    }

    const abstracts = await payload.find({
      collection: 'abstracts',
      where,
      page,
      limit,
      sort: '-createdAt',
    })

    return NextResponse.json(abstracts)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

