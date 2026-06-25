import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureSpeakersLatestColumns } from '@/lib/ensureSpeakersSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    await ensureSpeakersLatestColumns(payload)
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const title = formData.get('title') as string
    const organization = formData.get('organization') as string
    const country = formData.get('country') as string
    const bio = formData.get('bio') as string
    const type = JSON.parse(formData.get('type') as string || '[]')
    const featured = formData.get('featured') === 'true'
    const socialMedia = JSON.parse(formData.get('socialMedia') as string || '{}')
    const expertise = JSON.parse(formData.get('expertise') as string || '[]')
    const abstractTitle = formData.get('abstractTitle') as string | null
    // Photo URL — already uploaded to Blob by the form on file select
    const photoUrl = formData.get('photoUrl') as string | null

    // Validate required fields
    if (!name || !email || !title || !organization || !country || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, title, organization, country, and bio are required' },
        { status: 400 }
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 })
    }
    if (!type || type.length === 0) {
      return NextResponse.json({ error: 'At least one speaker type is required' }, { status: 400 })
    }
    if (!photoUrl || !photoUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: photoUrl ? 'Photo URL must be a valid Blob URL (https://). Please re-upload the photo.' : 'Professional photo is required. Please upload a photo.' },
        { status: 400 },
      )
    }

    // Create media record — photo is already on Blob, store URL only
    let photoId: string | undefined
    try {
      const photoUpload = await payload.create({
        collection: 'media',
        data: { alt: `Speaker photo: ${name}`, url: photoUrl },
        overrideAccess: true,
      })
      photoId = typeof photoUpload === 'string' ? photoUpload : photoUpload?.id
      if (!photoId) throw new Error('No ID returned from media create')
    } catch (uploadError: any) {
      console.error('Media create error:', uploadError.message)
      return NextResponse.json(
        { error: 'Failed to create media record', details: uploadError.message },
        { status: 500 }
      )
    }

    // Create speaker
    const speaker = await payload.create({
      collection: 'speakers',
      data: {
        name,
        email: email.toLowerCase().trim(),
        title,
        organization,
        country,
        bio,
        type,
        ...(abstractTitle ? { abstractTitle } : {}),
        featured,
        socialMedia,
        expertise: expertise.map((area: string) => ({ area })),
        photo: photoId,
      },
      overrideAccess: true, // Ensure admin can create
    })

    return NextResponse.json({ success: true, doc: speaker })
  } catch (error: any) {
    console.error('Create speaker error:', {
      message: error.message,
      stack: error.stack,
      data: error.data,
      status: error.status,
      statusCode: error.statusCode,
      errors: error.errors,
    })
    
    // Return more detailed error information
    const errorResponse: any = {
      error: error.message || 'Failed to create speaker',
    }
    
    // Include validation errors if available
    if (error.data?.errors) {
      errorResponse.validationErrors = error.data.errors
    }
    
    // Include field-specific errors
    if (error.errors) {
      errorResponse.fieldErrors = error.errors
    }
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        stack: error.stack,
        data: error.data,
      }
    }
    
    return NextResponse.json(
      errorResponse,
      { status: error.status || error.statusCode || 500 }
    )
  }
}



