import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Public API endpoint to track registration, abstract, partnership, and volunteer status
 * This allows applicants to check their application status without authentication
 * Supports:
 * - Registration IDs (SARSYC-XXXXX or REG-XXXXX)
 * - Abstract submission IDs (ABS-XXXXX)
 * - Partnership inquiry IDs (PART-XXXXX or numeric ID)
 * - Volunteer application IDs (VOL-XXXXX or numeric ID)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inputId = searchParams.get('registrationId') || searchParams.get('id')

    if (!inputId) {
      return NextResponse.json(
        { error: 'Registration ID, Abstract Submission ID, Partnership Inquiry ID, or Volunteer Application ID is required' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()
    const trimmedId = inputId.trim().toUpperCase()

    let registration = null
    let abstracts: any[] = []
    let partnership = null
    let volunteer = null
    let foundEmail: string | null = null

    // Check if it's a partnership inquiry ID (starts with PART- or is numeric)
    if (trimmedId.startsWith('PART-') || (!isNaN(Number(trimmedId)) && !trimmedId.startsWith('ABS-') && !trimmedId.startsWith('REG-') && !trimmedId.startsWith('SARSYC-'))) {
      console.log('🔍 Searching for partnership inquiry with ID:', trimmedId)
      
      // Try to find by numeric ID first
      let partnershipResult
      if (!isNaN(Number(trimmedId))) {
        try {
          const inquiry = await payload.findByID({
            collection: 'partnership-inquiries',
            id: Number(trimmedId),
            depth: 0,
          })
          partnershipResult = { docs: [inquiry] }
        } catch (e) {
          partnershipResult = { docs: [] }
        }
      } else {
        // Search by email or organization name if PART- format
        partnershipResult = await payload.find({
          collection: 'partnership-inquiries',
          where: {
            or: [
              { email: { contains: trimmedId.replace('PART-', '') } },
              { organizationName: { contains: trimmedId.replace('PART-', '') } },
            ],
          },
          limit: 1,
          depth: 0,
        })
      }

      if (partnershipResult?.docs?.length > 0) {
        const inquiry = partnershipResult.docs[0]
        foundEmail = inquiry.email
        partnership = {
          id: inquiry.id,
          inquiryId: `PART-${inquiry.id}`,
          organizationName: inquiry.organizationName,
          contactPerson: inquiry.contactPerson,
          email: inquiry.email,
          phone: inquiry.phone,
          tier: inquiry.tier,
          status: inquiry.status || 'new',
          message: inquiry.message,
          adminNotes: inquiry.adminNotes,
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.updatedAt,
        }
        console.log('✅ Found partnership inquiry, email:', foundEmail)
      } else {
        console.log('❌ No partnership inquiry found with ID:', trimmedId)
      }
    }
    // Check if it's a volunteer application ID (starts with VOL-)
    else if (trimmedId.startsWith('VOL-')) {
      console.log('🔍 Searching for volunteer application with ID:', trimmedId)
      
      // Try to find by numeric ID
      const numericId = trimmedId.replace('VOL-', '')
      if (!isNaN(Number(numericId))) {
        try {
          // Check if volunteers collection exists (might not be implemented yet)
          const volunteerResult = await payload.findByID({
            collection: 'volunteers',
            id: Number(numericId),
            depth: 0,
          })
          foundEmail = volunteerResult.email
          volunteer = {
            id: volunteerResult.id,
            applicationId: `VOL-${volunteerResult.id}`,
            firstName: volunteerResult.firstName,
            lastName: volunteerResult.lastName,
            email: volunteerResult.email,
            phone: volunteerResult.phone,
            country: volunteerResult.country,
            organization: volunteerResult.organization,
            roles: volunteerResult.roles,
            availability: volunteerResult.availability,
            status: volunteerResult.status || 'pending',
            createdAt: volunteerResult.createdAt,
            updatedAt: volunteerResult.updatedAt,
          }
          console.log('✅ Found volunteer application, email:', foundEmail)
        } catch (e: any) {
          console.log('⚠️  Volunteers collection may not exist yet:', e.message)
        }
      }
    }
    // Check if it's an abstract submission ID (starts with ABS-)
    else if (trimmedId.startsWith('ABS-')) {
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

    // If we found an email (from any source), find all related data
    if (foundEmail) {
      // If we found via abstract/partnership/volunteer but no registration yet, try to find registration by email
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
      if (abstracts.length === 0 || registration || partnership || volunteer) {
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

      // If we found via registration/abstract but no partnership yet, try to find partnership by email
      if (!partnership) {
        console.log('🔍 Searching for partnership inquiry by email:', foundEmail)
        const partnershipByEmail = await payload.find({
          collection: 'partnership-inquiries',
          where: {
            email: { equals: foundEmail },
          },
          limit: 1,
          sort: '-createdAt',
          depth: 0,
        })

        if (partnershipByEmail.docs.length > 0) {
          const inquiry = partnershipByEmail.docs[0]
          partnership = {
            id: inquiry.id,
            inquiryId: `PART-${inquiry.id}`,
            organizationName: inquiry.organizationName,
            contactPerson: inquiry.contactPerson,
            email: inquiry.email,
            phone: inquiry.phone,
            tier: inquiry.tier,
            status: inquiry.status || 'new',
            message: inquiry.message,
            adminNotes: inquiry.adminNotes,
            createdAt: inquiry.createdAt,
            updatedAt: inquiry.updatedAt,
          }
          console.log('✅ Found partnership inquiry by email')
        }
      }

      // If we found via registration/abstract/partnership but no volunteer yet, try to find volunteer by email
      if (!volunteer) {
        console.log('🔍 Searching for volunteer application by email:', foundEmail)
        try {
          const volunteerByEmail = await payload.find({
            collection: 'volunteers',
            where: {
              email: { equals: foundEmail },
            },
            limit: 1,
            sort: '-createdAt',
            depth: 0,
          })

          if (volunteerByEmail.docs.length > 0) {
            const vol = volunteerByEmail.docs[0]
            volunteer = {
              id: vol.id,
              applicationId: `VOL-${vol.id}`,
              firstName: vol.firstName,
              lastName: vol.lastName,
              email: vol.email,
              phone: vol.phone,
              country: vol.country,
              organization: vol.organization,
              roles: vol.roles,
              availability: vol.availability,
              status: vol.status || 'pending',
              createdAt: vol.createdAt,
              updatedAt: vol.updatedAt,
            }
            console.log('✅ Found volunteer application by email')
          }
        } catch (e: any) {
          console.log('⚠️  Volunteers collection may not exist yet:', e.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      registration,
      abstracts,
      partnership,
      volunteer,
    })
  } catch (error: any) {
    console.error('Track API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration status', details: error.message },
      { status: 500 }
    )
  }
}

