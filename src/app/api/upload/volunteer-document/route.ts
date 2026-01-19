import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB for blob storage)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
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

    // Generate organized filename: Volunteers/{type}/{email_hash}-{sanitized_filename}
    const email = formData.get('email') as string | null
    let filename: string
    if (email) {
      const emailHash = email.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30)
      const sanitizedFilename = file.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '-')
        .toLowerCase()
      filename = `Volunteers/${type}/${emailHash}-${sanitizedFilename}`
    } else {
      const timestamp = Date.now()
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase()
      filename = `Volunteers/${type}/${timestamp}-${sanitizedFilename}`
    }

    console.log('📁 Uploading volunteer document:', {
      originalName: file.name,
      path: filename,
      size: file.size,
      type,
    })

    // Upload to Vercel Blob
    const blob = await put(filename, fileBlob, {
      access: 'public',
      token: blobToken,
    })

    console.log('✅ Volunteer document uploaded to Vercel Blob:', {
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
    console.error('Volunteer document upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    )
  }
}



