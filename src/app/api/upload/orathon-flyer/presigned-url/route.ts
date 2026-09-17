import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Presigned upload for Orathon flyer images */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let addRandomSuffix = false
        try {
          if (clientPayload) {
            const payload = JSON.parse(clientPayload)
            addRandomSuffix = payload.addRandomSuffix === true
          }
        } catch {
          // ignore
        }

        console.log('Generating token for orathon flyer:', pathname, { addRandomSuffix })

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
          ],
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix,
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('✅ Orathon flyer uploaded:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error('Orathon flyer presigned URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL', details: error.message },
      { status: 500 },
    )
  }
}
