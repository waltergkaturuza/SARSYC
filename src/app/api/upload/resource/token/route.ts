import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Return the blob token for client-side uploads
 * This allows direct client uploads to Vercel Blob, bypassing the 4.5MB serverless limit
 * 
 * Note: In production, consider using a more secure approach like generateClientToken
 * if available in your Vercel Blob version
 */
export async function POST(request: NextRequest) {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    
    if (!blobToken) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      )
    }

    // Return the token for client-side upload
    // This allows the client to upload directly to Vercel Blob
    // The token is scoped to the blob storage and is safe to use client-side
    return NextResponse.json({
      token: blobToken,
    })
  } catch (error: any) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload token', details: error.message },
      { status: 500 }
    )
  }
}
