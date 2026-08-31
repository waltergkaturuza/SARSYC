import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Upload conference gallery photos to Vercel Blob.
 * Path: Conferences/gallery/{slug-or-name}/{timestamp}-{filename}
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conferenceSlug = (formData.get('conferenceSlug') as string | null) || 'conference'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 12 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 12MB limit' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const fileType = file.type || ''
    const isValidType =
      allowedTypes.includes(fileType) ||
      file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i)

    if (!isValidType) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload an image (JPG, PNG, GIF, or WebP)' },
        { status: 400 },
      )
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      return NextResponse.json({ error: 'Blob storage not configured' }, { status: 500 })
    }

    const slug = conferenceSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) || 'conference'

    const sanitizedFilename = file.name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .toLowerCase()
    const filename = `Conferences/gallery/${slug}/${Date.now()}-${sanitizedFilename}`

    const fileBlob = new Blob([file], { type: file.type || 'image/jpeg' })
    const blob = await put(filename, fileBlob, {
      access: 'public',
      token: blobToken,
    })

    if (!blob.url || !blob.url.startsWith('https://')) {
      throw new Error('Invalid blob URL returned from upload')
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error: any) {
    console.error('Conference gallery upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 },
    )
  }
}
