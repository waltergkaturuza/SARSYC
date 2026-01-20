import { NextRequest, NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Generate a presigned URL for client-side uploads to Vercel Blob
 * This allows the client to upload files directly to blob storage, completely bypassing
 * the serverless function and its 4.5MB limit
 * 
 * Flow:
 * 1. Client requests presigned URL from this endpoint
 * 2. This endpoint returns a token/URL
 * 3. Client uploads directly to Vercel Blob
 * 4. Client sends the resulting blob URL to the resource API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Parse client payload to check if addRandomSuffix is requested
        let addRandomSuffix = false
        try {
          if (clientPayload) {
            const payload = JSON.parse(clientPayload)
            addRandomSuffix = payload.addRandomSuffix === true
          }
        } catch (e) {
          // Ignore parsing errors
        }

        console.log('Generating token for:', pathname, { addRandomSuffix })
        
        return {
          allowedContentTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
          addRandomSuffix: addRandomSuffix, // Add random suffix if requested
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('✅ Client upload completed:', blob.url)
        // You can store metadata here if needed
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL', details: error.message },
      { status: 500 }
    )
  }
}
