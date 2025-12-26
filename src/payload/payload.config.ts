import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
// webpack bundler removed (incompatible version). Using default bundler.
import { slateEditor } from '@payloadcms/richtext-slate'
import vercelBlobStorage from '@payloadcms/storage-vercel-blob'
import path from 'path'

// Collections
import Users from './collections/Users'
import Registrations from './collections/Registrations'
import Abstracts from './collections/Abstracts'
import Speakers from './collections/Speakers'
import Sessions from './collections/Sessions'
import Participants from './collections/Participants'
import Resources from './collections/Resources'
import News from './collections/News'
import Partners from './collections/Partners'
import FAQs from './collections/FAQs'
import Media from './collections/Media'

// Globals
import SiteSettings from './globals/SiteSettings'
import Header from './globals/Header'
import Footer from './globals/Footer'

// Get secret - required for Payload
// Note: buildConfig() is synchronous, so we can only check env var here
// The actual secret (with database fallback) is retrieved async in lib/payload.ts
// and passed to payload.init(). This value is just for buildConfig validation.
const getSecret = () => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) {
    // Use a placeholder - the real secret will be retrieved async in lib/payload.ts
    // Payload's buildConfig accepts this, but we override it during init()
    if (process.env.NODE_ENV === 'production') {
      // Placeholder for production - actual secret retrieved in payload.init()
      return 'placeholder-will-be-replaced-in-init'
    }
    console.warn('⚠️  PAYLOAD_SECRET not set, using default (development only)')
    return 'changeme-local-dev-only'
  }
  return secret
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  secret: getSecret(),
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- SARSYC VI Admin',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },
  editor: slateEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }),
  collections: [
    Users,
    Registrations,
    Abstracts,
    Speakers,
    Participants,
    Sessions,
    Resources,
    News,
    Partners,
    FAQs,
    Media,
  ],
  globals: [
    SiteSettings,
    Header,
    Footer,
  ],
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src', 'types', 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(process.cwd(), 'src', 'payload', 'generated-schema.graphql'),
  },
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
    process.env.NEXT_PUBLIC_SERVER_URL || '',
  ].filter(Boolean),
  plugins: [
    // Configure Vercel Blob storage for file uploads
    // Only enable when BLOB_READ_WRITE_TOKEN is available (Vercel automatically provides this)
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: {
              media: {
                // Vercel Blob token is automatically available in Vercel environment
                // For local development, set BLOB_READ_WRITE_TOKEN in .env
                token: process.env.BLOB_READ_WRITE_TOKEN,
              },
            },
          }),
        ]
      : []),
  ],
  rateLimit: {
    max: 2000,
    window: 15 * 60 * 1000, // 15 minutes
  },
})






