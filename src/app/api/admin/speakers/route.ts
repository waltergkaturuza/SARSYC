import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const title = formData.get('title') as string
    const organization = formData.get('organization') as string
    const country = formData.get('country') as string
    const bio = formData.get('bio') as string
    const type = JSON.parse(formData.get('type') as string || '[]')
    const featured = formData.get('featured') === 'true'
    const socialMedia = JSON.parse(formData.get('socialMedia') as string || '{}')
    const expertise = JSON.parse(formData.get('expertise') as string || '[]')
    const photoFile = formData.get('photo') as File | null
    
    // Upload photo if provided
    let photoId: string | undefined
    if (photoFile && photoFile.size > 0) {
      const photoUpload = await payload.create({
        collection: 'media',
        data: {},
        file: photoFile,
      })
      photoId = typeof photoUpload === 'string' ? photoUpload : photoUpload.id
    }

    // Create speaker
    const speaker = await payload.create({
      collection: 'speakers',
      data: {
        name,
        title,
        organization,
        country,
        bio,
        type,
        featured,
        socialMedia,
        expertise: expertise.map((area: string) => ({ area })),
        ...(photoId && { photo: photoId }),
      },
    })

    return NextResponse.json({ success: true, doc: speaker })
  } catch (error: any) {
    console.error('Create speaker error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create speaker' },
      { status: 500 }
    )
  }
}

