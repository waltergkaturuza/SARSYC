import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { list } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function migrateResources() {
  try {
    const payload = await getPayloadClient()
    
    // List all blobs in the Resources/ folder
    const { blobs } = await list({
      prefix: 'Resources/',
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    })
    
    console.log(`📄 Found ${blobs.length} resource files in Vercel Blob`)
    
    // Fetch all media records for PDFs and documents
    const mediaRecords = await payload.find({
      collection: 'media',
      limit: 1000,
      where: {
        mimeType: {
          in: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        },
      },
    })
    
    console.log(`📄 Found ${mediaRecords.docs.length} document media records`)
    
    let updatedCount = 0
    let skippedCount = 0
    const updates = []
    
    // Match media records to blob files by filename
    for (const media of mediaRecords.docs) {
      // Skip if already has a valid Blob URL
      if (media.url && media.url.includes('blob.vercel-storage.com')) {
        console.log(`✅ Media ${media.id} already has Blob URL, skipping`)
        skippedCount++
        continue
      }
      
      const mediaFilename = media.filename
      
      if (!mediaFilename) {
        console.warn(`⚠️ Media ${media.id} has no filename, skipping`)
        skippedCount++
        continue
      }
      
      // Find matching blob
      const matchingBlob = blobs.find(blob => {
        const blobFilename = blob.pathname.split('/').pop()
        return blobFilename === mediaFilename || blob.pathname.includes(mediaFilename)
      })
      
      if (matchingBlob) {
        console.log(`🔄 Updating media ${media.id} with Blob URL:`, matchingBlob.url)
        
        try {
          await payload.update({
            collection: 'media',
            id: media.id,
            data: {
              thumbnailURL: matchingBlob.url, // Store in thumbnailURL like speaker photos
            },
            overrideAccess: true,
          })
          
          updatedCount++
          updates.push({
            mediaId: media.id,
            oldUrl: media.url,
            newUrl: matchingBlob.url,
            filename: mediaFilename,
          })
        } catch (error: any) {
          console.error(`❌ Failed to update media ${media.id}:`, error.message)
        }
      } else {
        console.warn(`⚠️ No matching blob found for media ${media.id} (${mediaFilename})`)
        skippedCount++
      }
    }
    
    return {
      success: true,
      message: `Migration complete: ${updatedCount} resource files updated, ${skippedCount} skipped`,
      updatedCount,
      skippedCount,
      updates,
    }
  } catch (error: any) {
    console.error('Migration error:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await migrateResources()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Failed to migrate resource files',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await migrateResources()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message || 'Failed to migrate resource files',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
