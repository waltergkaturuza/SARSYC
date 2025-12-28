import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendMail } from '@/lib/mail'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: any = null
  try {
    body = await request.json()
    const payload = await getPayloadClient()

    // Transform keywords from string to array
    // Payload requires minRows: 3, so ensure we have at least 3 keywords
    let keywords: any[] = []
    if (body.keywords) {
      const keywordArray = typeof body.keywords === 'string' 
        ? body.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
        : Array.isArray(body.keywords) 
          ? body.keywords.map((k: any) => typeof k === 'string' ? k.trim() : k.keyword?.trim() || '').filter((k: string) => k.length > 0)
          : []
      
      keywords = keywordArray.map((k: string) => ({ keyword: k }))
      
      // If less than 3 keywords, pad with empty ones to meet minRows requirement
      // Or we can make it optional by not including it if empty
      if (keywords.length === 0) {
        // If no keywords provided, don't include the field (it's not required)
        keywords = []
      } else if (keywords.length < 3) {
        // Pad to meet minimum requirement
        while (keywords.length < 3) {
          keywords.push({ keyword: '' })
        }
      }
    }

    // Transform coAuthors from array to proper format
    let coAuthors: any[] = []
    if (body.coAuthors && Array.isArray(body.coAuthors)) {
      coAuthors = body.coAuthors
        .map((ca: any) => {
          if (typeof ca === 'string') {
            // If it's just a string, assume it's a name
            return { name: ca.trim(), organization: '' }
          }
          // If it's an object, use it as is
          return {
            name: ca.name?.trim() || '',
            organization: ca.organization?.trim() || '',
          }
        })
        .filter((ca: any) => ca.name && ca.name.length > 0)
    }

    // Validate required fields
    if (!body.title || !body.abstract || !body.track || !body.primaryAuthor || !body.presentationType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missing: {
            title: !body.title,
            abstract: !body.abstract,
            track: !body.track,
            primaryAuthor: !body.primaryAuthor,
            presentationType: !body.presentationType,
          },
        },
        { status: 400 }
      )
    }

    // Validate primaryAuthor structure
    if (!body.primaryAuthor.firstName || !body.primaryAuthor.lastName || !body.primaryAuthor.email || !body.primaryAuthor.organization || !body.primaryAuthor.country) {
      return NextResponse.json(
        {
          success: false,
          error: 'Primary author information is incomplete',
          missing: {
            firstName: !body.primaryAuthor.firstName,
            lastName: !body.primaryAuthor.lastName,
            email: !body.primaryAuthor.email,
            organization: !body.primaryAuthor.organization,
            country: !body.primaryAuthor.country,
          },
        },
        { status: 400 }
      )
    }

    // Prepare data for creation
    // Note: status has access.create: () => false, but overrideAccess: true should bypass this
    // However, to be safe, we'll let Payload set the default status
    const abstractData: any = {
      title: body.title.trim(),
      abstract: body.abstract.trim(),
      track: body.track,
      primaryAuthor: {
        firstName: body.primaryAuthor.firstName.trim(),
        lastName: body.primaryAuthor.lastName.trim(),
        email: body.primaryAuthor.email.trim(),
        phone: body.primaryAuthor.phone?.trim() || undefined,
        organization: body.primaryAuthor.organization.trim(),
        country: body.primaryAuthor.country.trim(),
      },
      presentationType: body.presentationType,
      // Don't set status explicitly - let Payload use the defaultValue: 'received'
      // The access control prevents setting it, but defaultValue should still work
    }

    // Handle keywords - Payload requires minRows: 3, so pad if needed
    if (keywords.length > 0) {
      // If we have keywords but less than 3, pad with empty strings to meet minRows
      while (keywords.length < 3) {
        keywords.push({ keyword: '' })
      }
      abstractData.keywords = keywords
    }
    // If no keywords, don't include the field (it's optional)

    // Only include coAuthors if there are any
    if (coAuthors.length > 0) {
      abstractData.coAuthors = coAuthors
    }

    // Don't include abstractFile at all (let Payload handle it)
    // abstractFile is optional and should not be set to undefined

    console.log('Creating abstract with data:', JSON.stringify(abstractData, null, 2))

    // Create abstract submission
    // Use overrideAccess: true to bypass access control since this is a public submission endpoint
    const abstract = await payload.create({
      collection: 'abstracts',
      data: abstractData,
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
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      data: error.data,
      status: error.status,
    })
    if (body) {
      console.error('Request body received:', {
        title: body.title,
        track: body.track,
        primaryAuthor: body.primaryAuthor,
        coAuthors: body.coAuthors,
        keywords: body.keywords,
        presentationType: body.presentationType,
      })
    } else {
      console.error('Request body could not be parsed')
    }
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Submission failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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

