import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Public API endpoint to track registration and abstract status by Registration ID or Abstract Submission ID
 * This allows applicants to check their application status without authentication
 * Supports both registration IDs (SARSYC-XXXXX or REG-XXXXX) and abstract submission IDs (ABS-XXXXX)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inputId = searchParams.get('registrationId') || searchParams.get('id')

    if (!inputId) {
      return NextResponse.json(
        { error: 'Registration ID or Abstract Submission ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()
    const trimmedId = inputId.trim().toUpperCase()

    let registration = null
    let abstracts: any[] = []
    let foundEmail: string | null = null

    // Check if it's an abstract submission ID (starts with ABS-)
    if (trimmedId.startsWith('ABS-')) {
      console.log('🔍 Searching for abstract with submission ID:', trimmedId)
      
      // Find abstract by submissionId
      const abstractResult = await payload.find({
        collection: 'abstracts',
        where: {
          submissionId: { equals: trimmedId },
        },
        limit: 1,
        depth: 1, // Need depth to get primaryAuthor email
      })

      if (abstractResult.docs.length > 0) {
        const abstract = abstractResult.docs[0]
        foundEmail = abstract.primaryAuthor?.email || null
        
        // Add this abstract to the results
        abstracts.push({
          id: abstract.id,
          submissionId: abstract.submissionId || `ABS-${abstract.id}`,
          title: abstract.title,
          status: abstract.status || 'received',
          track: abstract.track,
          submittedDate: abstract.createdAt,
          reviewerComments: abstract.reviewerComments,
          adminNotes: abstract.adminNotes,
        })

        console.log('✅ Found abstract, email:', foundEmail)
      } else {
        console.log('❌ No abstract found with submission ID:', trimmedId)
      }
    } else {
      // It's a registration ID - search for registration
      console.log('🔍 Searching for registration with ID:', trimmedId)
      
      const registrationResult = await payload.find({
        collection: 'registrations',
        where: {
          registrationId: { equals: trimmedId },
        },
        limit: 1,
        depth: 0,
      })

      if (registrationResult.docs.length > 0) {
        const reg = registrationResult.docs[0]
        foundEmail = reg.email
        registration = {
          id: reg.id,
          registrationId: reg.registrationId || `REG-${reg.id}`,
          firstName: reg.firstName,
          lastName: reg.lastName,
          email: reg.email,
          phone: reg.phone,
          status: reg.status || 'pending',
          paymentStatus: reg.paymentStatus || 'pending',
          category: reg.category,
          organization: reg.organization,
          country: reg.country,
          createdAt: reg.createdAt,
          updatedAt: reg.updatedAt,
        }
        console.log('✅ Found registration, email:', foundEmail)
      } else {
        console.log('❌ No registration found with ID:', trimmedId)
      }
    }

    // If we found an email (from either registration or abstract), find all related data
    if (foundEmail) {
      // If we found via abstract but no registration yet, try to find registration by email
      if (!registration) {
        console.log('🔍 Searching for registration by email:', foundEmail)
        const registrationByEmail = await payload.find({
          collection: 'registrations',
          where: {
            email: { equals: foundEmail },
          },
          limit: 1,
          sort: '-createdAt', // Get the most recent registration
          depth: 0,
        })

        if (registrationByEmail.docs.length > 0) {
          const reg = registrationByEmail.docs[0]
          registration = {
            id: reg.id,
            registrationId: reg.registrationId || `REG-${reg.id}`,
            firstName: reg.firstName,
            lastName: reg.lastName,
            email: reg.email,
            phone: reg.phone,
            status: reg.status || 'pending',
            paymentStatus: reg.paymentStatus || 'pending',
            category: reg.category,
            organization: reg.organization,
            country: reg.country,
            createdAt: reg.createdAt,
            updatedAt: reg.updatedAt,
          }
          console.log('✅ Found registration by email')
        }
      }

      // Find all abstracts by email (if we haven't already found them)
      if (abstracts.length === 0 || registration) {
        console.log('🔍 Searching for all abstracts by email:', foundEmail)
        const abstractsResult = await payload.find({
          collection: 'abstracts',
          where: {
            'primaryAuthor.email': { equals: foundEmail },
          },
          sort: '-createdAt',
          depth: 0,
        })

        abstracts = abstractsResult.docs.map((abstract: any) => ({
          id: abstract.id,
          submissionId: abstract.submissionId || `ABS-${abstract.id}`,
          title: abstract.title,
          status: abstract.status || 'received',
          track: abstract.track,
          submittedDate: abstract.createdAt,
          reviewerComments: abstract.reviewerComments,
          adminNotes: abstract.adminNotes,
        }))
        console.log(`✅ Found ${abstracts.length} abstract(s)`)
      }
    }

    return NextResponse.json({
      success: true,
      registration,
      abstracts,
    })
  } catch (error: any) {
    console.error('Track API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration status', details: error.message },
      { status: 500 }
    )
  }
}

