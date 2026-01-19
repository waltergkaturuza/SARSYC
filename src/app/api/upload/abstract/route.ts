import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Dedicated endpoint for abstract file uploads
 * File structure: Abstracts/{track}/{sanitized_filename}
 * Example: Abstracts/education-rights/john-doe-abstract-2026.pdf
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const track = formData.get('track') as string | null // e.g., 'education-rights', 'hiv-aids', etc.
    const email = formData.get('email') as string | null // Primary author email for unique filename
    const title = formData.get('title') as string | null // For creating a clean filename

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (4MB limit for direct upload, use chunked for larger)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 4MB limit for direct upload. Use chunked upload instead.' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
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
        { error: 'File type not allowed. Please upload PDF or Word document.' },
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

    // Build the file path structure: Abstracts/{track}/{filename}
    const trackFolder = track || 'general'
    
    // Create a clean filename from email/title or use original filename
    let filename: string
    if (email && title) {
      // Use email and title to create a unique, clean filename
      const emailHash = email.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)
      const sanitizedTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50)
      const fileExt = file.name.split('.').pop() || 'pdf'
      filename = `Abstracts/${trackFolder}/${emailHash}-${sanitizedTitle}.${fileExt}`
    } else if (email) {
      // Use email-based filename
      const emailHash = email.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)
      const fileExt = file.name.split('.').pop() || 'pdf'
      filename = `Abstracts/${trackFolder}/${emailHash}-abstract.${fileExt}`
    } else {
      // Fallback: use original filename with sanitization
      const sanitizedFilename = file.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .toLowerCase()
      filename = `Abstracts/${trackFolder}/${Date.now()}-${sanitizedFilename}`
    }

    console.log('📁 Uploading abstract file:', {
      originalName: file.name,
      path: filename,
      size: file.size,
      track: trackFolder,
    })

    // Upload to Vercel Blob
    const blob = await put(filename, fileBlob, {
      access: 'public',
      token: blobToken,
    })
    
    console.log('✅ Abstract file uploaded to Vercel Blob:', {
      url: blob.url,
      pathname: blob.pathname,
      filename: filename.split('/').pop(),
      originalSize: file.size,
    })

    // Verify the URL is accessible
    if (!blob.url || !blob.url.startsWith('https://')) {
      console.error('❌ Invalid blob URL returned:', blob.url)
      throw new Error('Invalid blob URL returned from upload')
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error: any) {
    console.error('Abstract upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    )
  }
}
