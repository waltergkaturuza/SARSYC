import type { CollectionConfig } from 'payload/types'

const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Content',
  },
  access: {
    read: () => true,
    // Allow public uploads for registration passport scans and abstract files
    // Access control is handled at the API level
    create: () => true,
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  upload: {
    // Remove staticDir when using Vercel Blob storage
    // staticDir is only needed for local file storage
    // When using Vercel Blob, files are stored externally and accessed via URL
    ...(process.env.BLOB_READ_WRITE_TOKEN ? {} : { staticDir: 'media' }),
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 800,
        height: 450,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    // Explicitly list all allowed MIME types instead of using wildcards
    // Payload validates MIME types strictly, so we need to be explicit
    mimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    // Ensure PDFs are handled correctly
    adminThumbnail: ({ doc }: any) => {
      // For PDFs, don't try to generate a thumbnail (would fail)
      if (doc?.mimeType === 'application/pdf') {
        return doc?.url || ''
      }
      return doc?.thumbnailURL || doc?.url || ''
    },
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }: any) => {
        // If URL is external (Vercel Blob), skip file upload processing
        // This allows creating media records with external URLs without requiring file uploads
        if (data?.url && (data.url.startsWith('https://') || data.url.startsWith('http://'))) {
          // External URL - ensure filename doesn't cause Payload to generate file paths
          // The URL should be used directly, not through /api/media/file/...
          console.log('🌐 External URL detected in media record, using URL directly:', data.url)
          
          // For external URLs, we don't need file processing
          // Clear any file-related data that might cause issues
          if (req) {
            req.file = undefined
            req.files = undefined
          }
          
          return data
        }
        
        // Intercept before Payload's internal validation
        // This runs before the upload field's beforeChange hook
        if (operation === 'create' && req?.file) {
          const file = req.file
          const filename = file.originalname || file.filename || ''
          const mimetype = file.mimetype || ''
          
          // If it's a PDF file, ensure the MIME type is set correctly
          if (filename.toLowerCase().endsWith('.pdf') || mimetype === 'application/pdf') {
            console.log('📄 PDF file detected in beforeChange hook, ensuring MIME type...', {
              filename,
              mimetype,
              dataMimeType: data?.mimeType,
            })
            
            // Force set the MIME type to application/pdf
            // This should happen before Payload's validation
            if (data) {
              data.mimeType = 'application/pdf'
            }
          }
        }
        
        return data
      },
    ],
    beforeValidate: [
      async ({ data, req, operation }: any) => {
        console.log('🔍 Media beforeValidate hook called:', {
          operation,
          hasUrl: !!data?.url,
          url: data?.url?.substring(0, 50),
          hasFile: !!req?.file,
          hasFiles: !!req?.files,
          reqKeys: req ? Object.keys(req) : [],
          dataKeys: data ? Object.keys(data) : [],
          contentType: req?.headers?.['content-type'],
        })
        
        // If URL is external (Vercel Blob), skip file upload validation
        // This must happen in beforeValidate to prevent Payload's upload handler from expecting files
        const isExternalUrl = data?.url && (data.url.startsWith('https://') || data.url.startsWith('http://'))
        const isJsonRequest = req?.headers?.['content-type']?.includes('application/json')
        const hasNoFiles = !req?.file && !req?.files
        
        if (isExternalUrl || (isJsonRequest && hasNoFiles && data?.url)) {
          console.log('🌐 External URL detected in beforeValidate, skipping file validation:', {
            url: data.url,
            isExternalUrl,
            isJsonRequest,
            hasNoFiles,
          })
          
          // CRITICAL: Clear ALL file-related properties to prevent Payload upload validation
          if (req) {
            req.file = undefined
            req.files = undefined
            delete req.body?.file
            delete req.body?.files
            // Also clear any multer-related properties
            delete (req as any).files
            delete (req as any).file
          }
          
          // Mark this as an external URL to skip upload processing
          if (data) {
            data._skipUpload = true
            data._externalUrl = true
            // Ensure URL is set
            if (!data.url && req?.body?.url) {
              data.url = req.body.url
            }
          }
          
          // Ensure we have required fields for external URLs
          if (!data.mimeType && data.url) {
            // Try to infer MIME type from URL
            const urlLower = data.url.toLowerCase()
            if (urlLower.includes('.png')) {
              data.mimeType = 'image/png'
            } else if (urlLower.includes('.gif')) {
              data.mimeType = 'image/gif'
            } else if (urlLower.includes('.webp')) {
              data.mimeType = 'image/webp'
            } else {
              data.mimeType = 'image/jpeg' // Default
            }
          }
          
          console.log('✅ External URL processed in beforeValidate:', {
            hasUrl: !!data.url,
            mimeType: data.mimeType,
            _skipUpload: data._skipUpload,
            reqFileCleared: !req?.file,
            reqFilesCleared: !req?.files,
          })
          
          return data
        }
        
        // Additional validation hook for actual file uploads
        if (req?.file && data) {
          const file = req.file
          // If the file is a PDF, ensure the MIME type is set correctly
          if (file.originalname?.toLowerCase().endsWith('.pdf') || file.mimetype === 'application/pdf') {
            // Ensure MIME type is set to application/pdf
            if (data.mimeType && data.mimeType !== 'application/pdf') {
              console.warn('⚠️  MIME type mismatch for PDF file, correcting...', {
                detected: data.mimeType,
                expected: 'application/pdf',
                filename: file.originalname,
              })
              data.mimeType = 'application/pdf'
            } else if (!data.mimeType) {
              data.mimeType = 'application/pdf'
            }
          }
        }
        return data
      },
    ],
    afterRead: [
      async ({ doc, req }: any) => {
        // If the media has an external URL (e.g., from Vercel Blob), ensure it's used directly
        // This is important for serverless environments where files aren't stored locally
        if (doc?.url && (doc.url.startsWith('https://') || doc.url.startsWith('http://'))) {
          // External URL - ensure it's preserved and used directly
          // Don't let Payload try to generate local file paths
          return doc
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Caption',
    },
  ],
  timestamps: true,
}

export default Media






