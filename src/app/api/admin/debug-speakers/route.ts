import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    // Fetch all speakers with photo relationships
    const speakers = await payload.find({
      collection: 'speakers',
      limit: 10,
      depth: 2, // Full population to see photo object
      overrideAccess: true,
    })
    
    // Format the data for easy debugging
    const debugData = speakers.docs.map((speaker: any) => ({
      id: speaker.id,
      name: speaker.name,
      photo: {
        type: typeof speaker.photo,
        value: speaker.photo,
        // If it's an object, show its structure
        ...(typeof speaker.photo === 'object' && speaker.photo !== null ? {
          id: speaker.photo.id,
          url: speaker.photo.url,
          filename: speaker.photo.filename,
          mimeType: speaker.photo.mimeType,
          hasUrl: !!speaker.photo.url,
          urlStartsWith: speaker.photo.url ? speaker.photo.url.substring(0, 50) : null,
          hasSizes: !!speaker.photo.sizes,
          sizesKeys: speaker.photo.sizes ? Object.keys(speaker.photo.sizes) : null,
        } : {}),
      },
    }))
    
    return NextResponse.json({
      success: true,
      totalSpeakers: speakers.docs.length,
      speakers: debugData,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Debug speakers error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch speakers',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
