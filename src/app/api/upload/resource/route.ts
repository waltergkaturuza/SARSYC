import { NextRequest, NextResponse } from 'next/server'
import { put, list, del } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Dedicated endpoint for resource file uploads
 * This allows client to upload files directly, bypassing the 4.5MB API limit
 * Returns the blob URL which can then be sent to the resource API
 * 
 * File structure: Resources/sarsyc_{edition}/{resource_type}/{sanitized_filename}
 * Example: Resources/sarsyc_V/conference_report/annual-report-2024.pdf
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const sarsycEdition = formData.get('sarsycEdition') as string | null // e.g., '1', '2', '3', etc.
    const resourceType = formData.get('resourceType') as string | null // e.g., 'report', 'paper', 'brief', etc.
    const title = formData.get('title') as string | null // For creating a clean filename

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (4MB limit to stay under Vercel's 4.5MB function body limit)
    const maxSize = 4 * 1024 * 1024 // 4MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
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

    // Map SARSYC edition numbers to Roman numerals
    const editionMap: Record<string, string> = {
      '1': 'I',
      '2': 'II',
      '3': 'III',
      '4': 'IV',
      '5': 'V',
      '6': 'VI',
      'other': 'general',
    }

    // Build the file path structure: Resources/sarsyc_{edition}/{resource_type}/{filename}
    const edition = sarsycEdition ? editionMap[sarsycEdition] || sarsycEdition : 'general'
    const typeFolder = resourceType || 'other'
    
    // Create a clean filename from title or use original filename
    let filename: string
    if (title) {
      // Sanitize title to create a clean filename
      const sanitizedTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100) // Limit length
      const fileExt = file.name.split('.').pop() || 'pdf'
      filename = `Resources/sarsyc_${edition}/${typeFolder}/${sanitizedTitle}.${fileExt}`
    } else {
      // Fallback: use original filename with sanitization
      const sanitizedFilename = file.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .toLowerCase()
      filename = `Resources/sarsyc_${edition}/${typeFolder}/${sanitizedFilename}`
    }

    console.log('📁 Uploading resource file:', {
      originalName: file.name,
      path: filename,
      size: file.size,
      edition,
      type: typeFolder,
    })

    // Upload to Vercel Blob. Use addRandomSuffix to avoid \"blob already exists\" errors.
    const blob = await put(filename, fileBlob, {
      access: 'public',
      token: blobToken,
      addRandomSuffix: true,
    })
    
    console.log('✅ Resource file uploaded to Vercel Blob:', {
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
    console.error('Resource upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    )
  }
}
