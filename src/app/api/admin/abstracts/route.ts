import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const formData = await request.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const abstract = formData.get('abstract') as string
    const keywords = JSON.parse(formData.get('keywords') as string || '[]')
    const track = formData.get('track') as string
    const primaryAuthor = JSON.parse(formData.get('primaryAuthor') as string || '{}')
    const coAuthors = JSON.parse(formData.get('coAuthors') as string || '[]')
    const presentationType = formData.get('presentationType') as string
    const abstractFile = formData.get('abstractFile') as File | null
    
    // Upload file if provided
    let abstractFileId: string | undefined
    if (abstractFile && abstractFile.size > 0) {
      const fileUpload = await payload.create({
        collection: 'media',
        data: {},
        file: abstractFile,
      })
      abstractFileId = typeof fileUpload === 'string' ? fileUpload : fileUpload.id
    }

    // Create abstract
    const abstractDoc = await payload.create({
      collection: 'abstracts',
      data: {
        title,
        abstract,
        keywords: keywords.map((k: string) => ({ keyword: k })),
        track,
        primaryAuthor,
        coAuthors: coAuthors.map((ca: any) => ({ name: ca.name, organization: ca.organization })),
        presentationType,
        status: 'received',
        ...(abstractFileId && { abstractFile: abstractFileId }),
      },
    })

    return NextResponse.json({ success: true, doc: abstractDoc })
  } catch (error: any) {
    console.error('Create abstract error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create abstract' },
      { status: 500 }
    )
  }
}



