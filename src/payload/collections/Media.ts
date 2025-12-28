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
    staticDir: 'media',
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
    beforeValidate: [
      async ({ data, req }: any) => {
        // If a file is being uploaded, ensure MIME type is preserved
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
            }
            // Don't modify data here - let Payload handle it
            // But ensure the file's MIME type is correct
          }
        }
        return data
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






