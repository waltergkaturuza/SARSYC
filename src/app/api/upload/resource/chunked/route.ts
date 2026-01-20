import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Chunked upload endpoint for large resource files
 * Accepts file chunks and assembles them server-side before uploading to Vercel Blob
 * This bypasses the 4.5MB request limit by processing files in smaller chunks
 */

// Store chunks in memory (for serverless, we need to handle this differently)
// For production, consider using a temporary storage solution
const uploadSessions = new Map<string, { chunks: Buffer[], metadata: any }>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File | null
    const chunkIndexStr = formData.get('chunkIndex') as string
    const totalChunksStr = formData.get('totalChunks') as string
    const uploadId = formData.get('uploadId') as string
    const filename = formData.get('filename') as string
    const contentType = formData.get('contentType') as string

    console.log('📦 Chunked upload request:', {
      hasChunk: !!chunk,
      chunkSize: chunk?.size,
      chunkIndex: chunkIndexStr,
      totalChunks: totalChunksStr,
      uploadId,
      filename,
    })

    if (!chunk || !uploadId || !filename || !chunkIndexStr || !totalChunksStr) {
      console.error('❌ Missing required parameters:', {
        hasChunk: !!chunk,
        uploadId,
        filename,
        chunkIndex: chunkIndexStr,
        totalChunks: totalChunksStr,
      })
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          details: {
            hasChunk: !!chunk,
            hasUploadId: !!uploadId,
            hasFilename: !!filename,
            hasChunkIndex: !!chunkIndexStr,
            hasTotalChunks: !!totalChunksStr,
          }
        },
        { status: 400 }
      )
    }

    const chunkIndex = parseInt(chunkIndexStr)
    const totalChunks = parseInt(totalChunksStr)

    if (isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json(
        { error: 'Invalid chunk index or total chunks' },
        { status: 400 }
      )
    }

    // Convert chunk to buffer
    let chunkBuffer: Buffer
    try {
      const arrayBuffer = await chunk.arrayBuffer()
      chunkBuffer = Buffer.from(arrayBuffer)
      console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} converted to buffer (${chunkBuffer.length} bytes)`)
    } catch (bufferError: any) {
      console.error('❌ Failed to convert chunk to buffer:', bufferError)
      return NextResponse.json(
        { error: 'Failed to process chunk data', details: bufferError.message },
        { status: 500 }
      )
    }

    // Initialize or get upload session
    if (!uploadSessions.has(uploadId)) {
      uploadSessions.set(uploadId, {
        chunks: new Array(totalChunks),
        metadata: { filename, contentType, totalChunks },
      })
    }

    const session = uploadSessions.get(uploadId)!
    session.chunks[chunkIndex] = chunkBuffer

    console.log(`✅ Received chunk ${chunkIndex + 1}/${totalChunks} for ${filename}`)

    // Check if all chunks are received
    const allChunksReceived = session.chunks.every(c => c !== undefined && c !== null)

    if (allChunksReceived) {
      console.log(`🎉 All chunks received for ${filename}, assembling and uploading...`)

      try {
        // Combine all chunks
        const completeFile = Buffer.concat(session.chunks)

        // Get the blob token
        const blobToken = process.env.BLOB_READ_WRITE_TOKEN
        if (!blobToken) {
          throw new Error('Blob storage not configured')
        }

        // Upload to Vercel Blob with random suffix to avoid conflicts
        const blob = await put(filename, completeFile, {
          access: 'public',
          token: blobToken,
          addRandomSuffix: true,
          contentType: contentType || 'application/octet-stream',
        })

        // Clean up session
        uploadSessions.delete(uploadId)

        console.log('✅ File uploaded to Vercel Blob:', blob.url)

        return NextResponse.json({
          success: true,
          complete: true,
          url: blob.url,
          pathname: blob.pathname,
        })
      } catch (uploadError: any) {
        console.error('Blob upload error:', uploadError)
        uploadSessions.delete(uploadId)
        return NextResponse.json(
          { error: 'Failed to upload to blob storage', details: uploadError.message },
          { status: 500 }
        )
      }
    } else {
      // More chunks to come
      return NextResponse.json({
        success: true,
        complete: false,
        received: chunkIndex + 1,
        total: totalChunks,
      })
    }
  } catch (error: any) {
    console.error('Chunked upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process chunk', details: error.message },
      { status: 500 }
    )
  }
}
