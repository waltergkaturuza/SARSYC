import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const currentUser = await getCurrentUserFromRequest(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const payload = await getPayloadClient()
    const userEmail = currentUser.email

    // Get user's registration
    const registrations = await payload.find({
      collection: 'registrations',
      where: {
        email: { equals: userEmail },
      },
      limit: 1,
      sort: '-createdAt',
      overrideAccess: true,
    })

    // Get user's abstracts (for presenters)
    const abstracts = await payload.find({
      collection: 'abstracts',
      where: {
        'primaryAuthor.email': { equals: userEmail },
      },
      sort: '-createdAt',
      overrideAccess: true,
    })

    // Get speaker profile and sessions (for speakers)
    let speaker = null
    let sessions = []
    
    if (currentUser.role === 'speaker' && currentUser.speaker) {
      const speakerId = typeof currentUser.speaker === 'string' 
        ? currentUser.speaker 
        : (currentUser.speaker as any).id || currentUser.speaker
      
      try {
        speaker = await payload.findByID({
          collection: 'speakers',
          id: speakerId,
          depth: 2,
          overrideAccess: true,
        })

        // Get sessions for this speaker
        if (speaker.sessions && Array.isArray(speaker.sessions)) {
          sessions = speaker.sessions.map((s: any) => {
            const session = typeof s === 'object' ? s : null
            return session ? {
              id: session.id,
              title: session.title,
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              venue: session.venue,
              type: session.type,
            } : null
          }).filter(Boolean)
        }
      } catch (err) {
        console.warn('Could not fetch speaker data:', err)
      }
    }

    // Get latest registration
    const registration = registrations.docs.length > 0 ? registrations.docs[0] : null

    // Format abstracts
    const abstractSubmissions = abstracts.docs.map((abstract: any) => ({
      id: abstract.id.toString(),
      title: abstract.title,
      submissionId: abstract.submissionId || `ABS-${abstract.id}`,
      status: abstract.status || 'received',
      submittedDate: abstract.createdAt,
      track: abstract.track,
      reviewerComments: abstract.reviewerComments || null,
      assignedSession: abstract.assignedSession || null,
    }))

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
        organization: currentUser.organization,
        phone: currentUser.phone,
      },
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
      speaker: speaker ? {
        id: speaker.id,
        name: speaker.name,
        title: speaker.title,
        organization: speaker.organization,
        photo: speaker.photo,
        bio: speaker.bio,
        type: speaker.type,
        featured: speaker.featured,
      } : null,
      sessions,
    })
  } catch (error: any) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile data' },
      { status: 500 }
    )
  }
}



