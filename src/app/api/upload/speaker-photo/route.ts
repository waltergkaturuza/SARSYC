import { NextRequest, NextResponse } from 'next/server'
import { put, list, del } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Dedicated endpoint for speaker photo uploads
 * This allows client to upload files directly to Vercel Blob, bypassing MIME type validation issues
 * Returns the blob URL which can then be sent to the speaker API
 * 
 * Prevents duplicates by:
 * 1. Using speaker name-based filename for consistency
 * 2. Checking for existing files and deleting them before upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const speakerName = formData.get('speakerName') as string | null // Speaker name to create unique filename

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit for high-quality photos)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ]

    const fileType = file.type || ''
    const isValidType = allowedTypes.includes(fileType) || 
      file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i)

    if (!isValidType) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload an image (JPG, PNG, GIF, or WebP)' },
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
    const fileBlob = new Blob([file], { type: file.type || 'image/jpeg' })

    // Create a consistent filename based on speaker name (if provided) or use timestamp
    let filename: string
    if (speakerName) {
      // Use speaker name to create a unique, consistent filename
      const nameHash = speakerName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50) // Limit length
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      filename = `speaker-photos/${nameHash}.${fileExt}`
      
      console.log('📧 Using speaker name-based filename:', filename)
      
      // Check for existing files with this name-based pattern and delete them
      try {
        const existingBlobs = await list({
          prefix: `speaker-photos/${nameHash}`,
          token: blobToken,
        })
        
        if (existingBlobs.blobs.length > 0) {
          console.log(`🗑️  Found ${existingBlobs.blobs.length} existing file(s) for this speaker, deleting...`)
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
      // Fallback: use timestamp if no speaker name provided
      const sanitizedFilename = file.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .toLowerCase()
      filename = `speaker-photos/${Date.now()}-${sanitizedFilename}`
      console.log('📝 Using timestamp-based filename:', filename)
    }

    // Upload to Vercel Blob
    const blob = await put(filename, fileBlob, {
      access: 'public',
      token: blobToken,
    })
    
    // Extract filename from pathname for logging
    const loggedFilename = filename.split('/').pop() || file.name
    
    console.log('✅ Speaker photo uploaded to Vercel Blob:', {
      url: blob.url,
      pathname: blob.pathname,
      filename: loggedFilename,
      originalSize: file.size,
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
    })
  } catch (error: any) {
    console.error('Speaker photo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    )
  }
}

