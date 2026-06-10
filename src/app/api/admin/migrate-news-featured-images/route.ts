import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function migrateNewsFeaturedImages() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
  }

  const payload = await getPayloadClient()

  const { blobs } = await list({
    prefix: 'News/featured/',
    token,
  })

  const newsArticles = await payload.find({
    collection: 'news',
    limit: 500,
    depth: 1,
    overrideAccess: true,
  })

  let updatedCount = 0
  let skippedCount = 0
  const updates: Array<{ mediaId: string | number; oldUrl?: string; newUrl: string }> = []

  for (const article of newsArticles.docs) {
    const featured = article.featuredImage
    if (!featured || typeof featured !== 'object') {
      skippedCount++
      continue
    }

    const media = featured as { id: string | number; url?: string; filename?: string }
    if (media.url?.includes('blob.vercel-storage.com')) {
      skippedCount++
      continue
    }

    const mediaFilename = media.filename || media.url?.split('/').pop()
    if (!mediaFilename) {
      skippedCount++
      continue
    }

    const matchingBlob = blobs.find((blob) => {
      const blobFilename = blob.pathname.split('/').pop()
      return blobFilename === mediaFilename || blob.pathname.endsWith(`/${mediaFilename}`)
    })

    if (!matchingBlob) {
      skippedCount++
      continue
    }

    await payload.update({
      collection: 'media',
      id: media.id,
      data: { url: matchingBlob.url },
      overrideAccess: true,
    })

    updatedCount++
    updates.push({
      mediaId: media.id,
      oldUrl: media.url,
      newUrl: matchingBlob.url,
    })
  }

  return {
    success: true,
    message: `News featured image migration: ${updatedCount} updated, ${skippedCount} skipped`,
    blobCount: blobs.length,
    updatedCount,
    skippedCount,
    updates,
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await migrateNewsFeaturedImages())
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Migration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
