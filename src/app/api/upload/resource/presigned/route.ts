import { NextRequest, NextResponse } from 'next/server'
import { generateClientToken } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Generate a client token for direct client-side uploads to Vercel Blob
 * This bypasses the 4.5MB serverless function limit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, contentType } = body

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      )
    }

    // Generate a client token for the specific file
    const token = await generateClientToken({
      pathname: filename,
      onUploadCompleted: {
        callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sarsyc.org'}/api/upload/resource/callback`,
        metadata: JSON.stringify({
          filename,
          contentType: contentType || 'application/octet-stream',
        }),
      },
    })

    return NextResponse.json({
      token,
      url: `https://blob.vercel-storage.com/${filename}`,
    })
  } catch (error: any) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload token', details: error.message },
      { status: 500 }
    )
  }
}
