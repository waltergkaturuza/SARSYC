import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { createAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = await getPayloadClient()

    // Validate required fields
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'dateOfBirth',
      'country',
      'city',
      'education',
      'preferredRoles',
      'availability',
      'motivation',
      'emergencyContact',
      'consents',
    ]

    const missingFields = requiredFields.filter((field) => {
      if (field === 'education') {
        return !body.education || !Array.isArray(body.education) || body.education.length === 0
      }
      if (field === 'preferredRoles') {
        return !body.preferredRoles || !Array.isArray(body.preferredRoles) || body.preferredRoles.length === 0
      }
      if (field === 'availability') {
        return !body.availability || !body.availability.days || body.availability.days.length === 0
      }
      if (field === 'emergencyContact') {
        return !body.emergencyContact || !body.emergencyContact.name || !body.emergencyContact.phone
      }
      if (field === 'consents') {
        return !body.consents || !body.consents.backgroundCheck || !body.consents.termsAccepted
      }
      return !body[field]
    })

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingVolunteers = await payload.find({
      collection: 'volunteers',
      where: {
        email: { equals: body.email },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingVolunteers.docs.length > 0) {
      return NextResponse.json(
        { error: 'A volunteer application with this email already exists' },
        { status: 400 }
      )
    }

    // Create media records for CV and Cover Letter if blob URLs are provided
    let cvId: string | undefined
    let coverLetterId: string | undefined

    const createDocumentMedia = async (url: string | undefined | null, label: string) => {
      if (!url || typeof url !== 'string' || !url.startsWith('http')) return undefined
      try {
        // Extract filename from URL for better metadata
        const urlPath = new URL(url).pathname
        const filename = urlPath.split('/').pop() || `${label.toLowerCase().replace(/\s+/g, '-')}`

        // Decode filename safely
        const decodedFilename = decodeURIComponent(filename)

        // Determine MIME type from extension
        let mimeType = 'application/pdf'
        const lower = decodedFilename.toLowerCase()
        if (lower.endsWith('.doc')) {
          mimeType = 'application/msword'
        } else if (lower.endsWith('.docx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }

        const media = await payload.db.collections.media.create({
          data: {
            alt: `${label}: ${body.firstName} ${body.lastName}`.trim(),
            filename: decodedFilename,
            mimeType,
            url,
            filesize: 0,
            width: null,
            height: null,
          },
        })

        const id = typeof media === 'string' ? media : media.id
        console.log('✅ Created media record with blob URL for volunteer document:', {
          label,
          url,
          id,
        })
        return id as string
      } catch (err: any) {
        console.error(`Volunteer ${label} media creation error:`, err?.message || err)
        return undefined
      }
    }

    cvId = await createDocumentMedia(body.cv, 'CV / Resume')
    coverLetterId = await createDocumentMedia(body.coverLetter, 'Cover Letter')

    // Create volunteer application
    const volunteer = await payload.create({
      collection: 'volunteers',
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        country: body.country,
        city: body.city,
        address: body.address,
        education: body.education || [],
        skills: body.skills ? {
          technical: body.skills.technical || [],
          soft: body.skills.soft || [],
          languages: body.skills.languages || [],
        } : {
          technical: [],
          soft: [],
          languages: [],
        },
        workExperience: body.workExperience || [],
        volunteerExperience: body.volunteerExperience || [],
        preferredRoles: body.preferredRoles || [],
        availability: body.availability ? {
          days: body.availability.days || [],
          timePreference: body.availability.timePreference || '',
          hoursAvailable: body.availability.hoursAvailable || undefined,
        } : {
          days: [],
          timePreference: '',
          hoursAvailable: undefined,
        },
        motivation: body.motivation,
        specialSkills: body.specialSkills,
        specialAccommodations: body.specialAccommodations,
        references: body.references || [],
        emergencyContact: body.emergencyContact,
        cv: cvId || undefined,
        coverLetter: coverLetterId || undefined,
        consents: body.consents,
        status: 'pending',
      },
      overrideAccess: true,
    })

    // Log audit trail (if user is logged in)
    try {
      const user = (request as any).user
      if (user) {
        await createAuditLog(payload, {
          action: 'create',
          collection: 'volunteers',
          documentId: volunteer.id,
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          description: `Volunteer application submitted: ${body.firstName} ${body.lastName}`,
        })
      }
    } catch (auditError) {
      // Don't fail if audit logging fails
      console.warn('Failed to log audit trail for volunteer application:', auditError)
    }

    return NextResponse.json({
      success: true,
      volunteer: {
        id: volunteer.id,
        volunteerId: volunteer.volunteerId,
        status: volunteer.status,
      },
      message: 'Volunteer application submitted successfully',
    })
  } catch (error: any) {
    console.error('Volunteer application error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit volunteer application' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const email = searchParams.get('email')

    const payload = await getPayloadClient()

    const where: any = {}

    if (status) {
      where.status = { equals: status }
    }

    if (email) {
      where.email = { equals: email }
    }

    const volunteers = await payload.find({
      collection: 'volunteers',
      where,
      sort: '-createdAt',
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      volunteers: volunteers.docs.map((vol: any) => ({
        id: vol.id,
        volunteerId: vol.volunteerId,
        firstName: vol.firstName,
        lastName: vol.lastName,
        email: vol.email,
        status: vol.status,
        preferredRoles: vol.preferredRoles,
        createdAt: vol.createdAt,
      })),
      total: volunteers.totalDocs,
    })
  } catch (error: any) {
    console.error('Error fetching volunteers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch volunteers' },
      { status: 500 }
    )
  }
}

