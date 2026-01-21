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
        
        // If URL is external (Vercel Blob), prevent Payload from generating file paths
        if (data?.url && (data.url.startsWith('https://') || data.url.startsWith('http://'))) {
          // External URL - ensure Payload doesn't generate /api/media/file/... paths
          console.log('🌐 External URL detected in media record, preserving URL:', data.url)
          
          // Mark this as an external file so Payload doesn't try to generate paths
          // We'll use a flag that Payload won't override
          if (data.filename) {
            // Keep filename for admin display, but don't let it trigger file path generation
            data._externalUrl = data.url
          }
        }
        
        return data
      },
    ],
    beforeValidate: [
      async ({ data, req }: any) => {
        // Additional validation hook
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
        // This is critical for Vercel Blob storage
        if (doc?._externalUrl) {
          // Restore the external URL if Payload overwrote it
          doc.url = doc._externalUrl
          console.log('🔄 Restored external URL from _externalUrl:', doc.url)
        } else if (doc?.url && (doc.url.startsWith('https://') || doc.url.startsWith('http://'))) {
          // External URL - ensure it's preserved
          console.log('✅ External URL already set:', doc.url)
        } else if (doc?.url && doc.url.includes('/api/media/file/')) {
          // Payload generated a file URL, but check if we have an external URL stored
          console.warn('⚠️ Payload file URL detected, may cause 404:', doc.url)
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
    {
      name: '_externalUrl',
      type: 'text',
      label: 'External URL (Blob Storage)',
      admin: {
        readOnly: true,
        description: 'Auto-populated for Vercel Blob storage',
      },
    },
  ],
  timestamps: true,
}

export default Media






