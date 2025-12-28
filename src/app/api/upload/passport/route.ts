import { NextRequest, NextResponse } from 'next/server'
import { put, list, del } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Dedicated endpoint for passport file uploads
 * This allows client to upload files directly, bypassing the 4.5MB API limit
 * Returns the blob URL which can then be sent to the registration API
 * 
 * Prevents duplicates by:
 * 1. Using email-based filename for consistency
 * 2. Checking for existing files and deleting them before upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const email = formData.get('email') as string | null // Email to create unique filename

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

    // Create a consistent filename based on email (if provided) or use timestamp
    // This allows us to replace existing files instead of creating duplicates
    let filename: string
    if (email) {
      // Use email to create a unique, consistent filename
      const emailHash = email.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const fileExt = file.name.split('.').pop() || 'pdf'
      filename = `passport-scans/${emailHash}.${fileExt}`
      
      console.log('📧 Using email-based filename:', filename)
      
      // Check for existing files with this email-based name and delete them
      try {
        const existingBlobs = await list({
          prefix: `passport-scans/${emailHash}`,
          token: blobToken,
        })
        
        if (existingBlobs.blobs.length > 0) {
          console.log(`🗑️  Found ${existingBlobs.blobs.length} existing file(s) for this email, deleting...`)
          for (const existingBlob of existingBlobs.blobs) {
            try {
              await del(existingBlob.url, { token: blobToken })
              console.log('✅ Deleted existing file:', existingBlob.url)
            } catch (deleteError: any) {
              console.warn('⚠️  Failed to delete existing file:', existingBlob.url, deleteError.message)
              // Continue with upload even if deletion fails
            }
          }
        }
      } catch (listError: any) {
        console.warn('⚠️  Failed to check for existing files:', listError.message)
        // Continue with upload even if list check fails
      }
    } else {
      // Fallback: use timestamp if no email provided
      const sanitizedFilename = file.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .toLowerCase()
      filename = `passport-scans/${Date.now()}-${sanitizedFilename}`
      console.log('📝 Using timestamp-based filename:', filename)
    }

    // Upload to Vercel Blob
    const blob = await put(filename, fileBlob, {
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

