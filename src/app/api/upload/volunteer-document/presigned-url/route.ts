import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Generate presigned URL for client-side volunteer document uploads
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as HandleUploadBody

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
        } catch (e) {
          // Ignore parsing errors
        }

        console.log('Generating token for volunteer document:', pathname, { addRandomSuffix })
        
        return {
          allowedContentTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
          addRandomSuffix: addRandomSuffix,
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('✅ Volunteer document uploaded:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error('Volunteer document presigned URL error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL', details: error.message },
      { status: 500 }
    )
  }
}
