import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Dedicated endpoint for passport file uploads
 * This allows client to upload files directly, bypassing the 4.5MB API limit
 * Returns the blob URL which can then be sent to the registration API
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    const fileType = file.type || ''
    const isValidType = allowedTypes.some(type => 
      fileType.includes(type.split('/')[1]) || fileType === type
    )

    if (!isValidType && fileType) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Get the blob token
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      return NextResponse.json(
        { error: 'Blob storage not configured' },
        { status: 500 }
      )
    }

    // Convert File to Blob for Vercel Blob SDK
    const fileBlob = new Blob([file], { type: file.type || 'application/octet-stream' })

    // Sanitize filename to avoid URL encoding issues
    // Replace spaces and special characters with hyphens
    const sanitizedFilename = file.name
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9.-]/g, '-') // Replace special chars with hyphens
      .toLowerCase()

    // Upload to Vercel Blob
    const blob = await put(`passport-scans/${Date.now()}-${sanitizedFilename}`, fileBlob, {
      access: 'public',
      token: blobToken,
    })
    
    console.log('✅ File uploaded to Vercel Blob:', {
      url: blob.url,
      pathname: blob.pathname,
      filename: sanitizedFilename,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    })

    // Verify the URL is accessible (quick check)
    if (!blob.url || !blob.url.startsWith('https://')) {
      console.error('❌ Invalid blob URL returned:', blob.url)
      throw new Error('Invalid blob URL returned from upload')
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
    })
  } catch (error: any) {
    console.error('Passport upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    )
  }
}

