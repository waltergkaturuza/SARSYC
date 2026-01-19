/**
 * Utility for chunked file uploads to bypass Vercel's 4.5MB limit
 * Automatically chooses direct or chunked upload based on file size
 */

const CHUNK_SIZE = 3 * 1024 * 1024 // 3MB chunks

export interface ChunkedUploadOptions {
  file: File
  endpoint: string // e.g., '/api/upload/resource', '/api/upload/abstract'
  chunkedEndpoint: string // e.g., '/api/upload/resource/chunked'
  metadata: Record<string, string> // Additional metadata to send with upload
  buildFilename: () => string // Function to build the filename for chunked uploads
  onProgress?: (progress: number) => void // Progress callback (0-100)
}

export async function uploadFile(options: ChunkedUploadOptions): Promise<string> {
  const { file, endpoint, chunkedEndpoint, metadata, buildFilename, onProgress } = options

  if (file.size <= CHUNK_SIZE) {
    // DIRECT UPLOAD for small files (<= 3MB)
    const formData = new FormData()
    formData.append('file', file)
    
    // Add all metadata
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Upload failed')
    }

    const result = await response.json()
    return result.url
  } else {
    // CHUNKED UPLOAD for large files (> 3MB)
    const filename = buildFilename()
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    const uploadId = `${Date.now()}-${Math.random().toString(36).substring(7)}`

    console.log(`📦 Uploading ${totalChunks} chunks for large file...`)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE
      const end = Math.min(start + CHUNK_SIZE, file.size)
      const chunk = file.slice(start, end)

      const chunkFormData = new FormData()
      chunkFormData.append('chunk', chunk)
      chunkFormData.append('chunkIndex', i.toString())
      chunkFormData.append('totalChunks', totalChunks.toString())
      chunkFormData.append('uploadId', uploadId)
      chunkFormData.append('filename', filename)
      chunkFormData.append('contentType', file.type || 'application/octet-stream')

      const chunkResponse = await fetch(chunkedEndpoint, {
        method: 'POST',
        body: chunkFormData,
      })

      if (!chunkResponse.ok) {
        const errorData = await chunkResponse.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to upload chunk ${i + 1}/${totalChunks}`)
      }

      const chunkResult = await chunkResponse.json()
      const progress = Math.round(((i + 1) / totalChunks) * 100)
      
      if (onProgress) {
        onProgress(progress)
      }

      console.log(`✅ Uploaded chunk ${i + 1}/${totalChunks}`)

      // If this was the last chunk, get the final URL
      if (chunkResult.complete && chunkResult.url) {
        console.log('✅ All chunks uploaded, file available at:', chunkResult.url)
        return chunkResult.url
      }
    }

    throw new Error('Upload completed but no URL returned')
  }
}
