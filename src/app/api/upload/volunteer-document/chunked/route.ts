import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const uploadSessions = new Map<string, { chunks: Buffer[], metadata: any }>()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File | null
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    const uploadId = formData.get('uploadId') as string
    const filename = formData.get('filename') as string
    const contentType = formData.get('contentType') as string

    if (!chunk || !uploadId || !filename) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())

    if (!uploadSessions.has(uploadId)) {
      uploadSessions.set(uploadId, {
        chunks: new Array(totalChunks),
        metadata: { filename, contentType, totalChunks },
      })
    }

    const session = uploadSessions.get(uploadId)!
    session.chunks[chunkIndex] = chunkBuffer

    console.log(`✅ Received chunk ${chunkIndex + 1}/${totalChunks} for ${filename}`)

    const allChunksReceived = session.chunks.every(c => c !== undefined && c !== null)

    if (allChunksReceived) {
      console.log(`🎉 All chunks received for ${filename}, uploading...`)

      try {
        const completeFile = Buffer.concat(session.chunks)
        const blobToken = process.env.BLOB_READ_WRITE_TOKEN
        if (!blobToken) {
          throw new Error('Blob storage not configured')
        }

        const blob = await put(filename, completeFile, {
          access: 'public',
          token: blobToken,
          addRandomSuffix: true,
          contentType: contentType || 'application/octet-stream',
        })

        uploadSessions.delete(uploadId)
        console.log('✅ Volunteer document uploaded to Vercel Blob:', blob.url)

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
