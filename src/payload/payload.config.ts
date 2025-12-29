import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
// webpack bundler removed (incompatible version). Using default bundler.
import { slateEditor } from '@payloadcms/richtext-slate'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import nodemailer from 'nodemailer'
import sharp from 'sharp'
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
import NewsletterSubscriptions from './collections/NewsletterSubscriptions'
import ContactMessages from './collections/ContactMessages'
import SponsorshipTiers from './collections/SponsorshipTiers'
import PartnershipInquiries from './collections/PartnershipInquiries'
import VenueLocations from './collections/VenueLocations'
import AuditLogs from './collections/AuditLogs'

// Globals
import SiteSettings from './globals/SiteSettings'
import Header from './globals/Header'
import Footer from './globals/Footer'

// Get secret - required for Payload
// IMPORTANT: This secret MUST match the one passed to payload.init() in lib/payload.ts
// Both should read from process.env.PAYLOAD_SECRET to ensure consistency
// Note: buildConfig() is synchronous, so we can only check env var here
// The actual secret (with database fallback) is retrieved async in lib/payload.ts
// and passed to payload.init(). Payload should use the init() secret, not this one,
// but we set it here for validation and to ensure they match.
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
  
  // Log secret length for debugging (only in dev)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Config] PAYLOAD_SECRET in config (length:', secret.length + '):', secret.substring(0, 20) + '...')
  }
  
  return secret
}

// Configure email adapter if SMTP is configured
const getEmailAdapter = () => {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || `noreply@${process.env.NEXT_PUBLIC_SITE_DOMAIN || 'sarsyc.org'}`

  if (!host || !port) {
    // No email adapter - emails will be logged to console
    return undefined
  }

  // Create transport with timeout settings to prevent build-time hangs
  const transport = nodemailer.createTransport({
    host: host!,
    port: port!,
    secure: port === 465, // true for 465, false for other ports
    auth: user && pass ? { user, pass } : undefined,
    // Add connection timeout settings to prevent hanging during build
    connectionTimeout: 5000, // 5 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 5000, // 5 seconds
    // Disable verification during build/initialization
    // Verification will happen on first email send if needed
    pool: false, // Disable connection pooling to avoid persistent connections
  } as any)

  // Verify connection asynchronously (non-blocking)
  // This prevents build-time timeouts
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    // Only verify in development, not during Vercel builds
    transport.verify().catch((err: any) => {
      console.warn('SMTP connection verification failed (non-blocking):', err?.message || err)
      // Don't throw - allow the adapter to be created even if verification fails
      // Emails will still attempt to send, and will fail gracefully if SMTP is misconfigured
    })
  }

  return nodemailerAdapter({
    defaultFromAddress: from,
    defaultFromName: 'SARSYC VI',
    transport,
  })
}

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  secret: getSecret(),
  sharp, // Pass sharp for image resizing
  email: getEmailAdapter(), // Configure email adapter if SMTP is available
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- SARSYC VI Admin',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
    // Disable document locking to prevent concurrent edit conflicts
    // This prevents the "payload_locked_documents" query errors
    maxConcurrentEditing: 0,
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
    NewsletterSubscriptions,
    ContactMessages,
    SponsorshipTiers,
    PartnershipInquiries,
    VenueLocations,
    AuditLogs,
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
    // Vercel automatically provides BLOB_READ_WRITE_TOKEN in production
    // For local development, set BLOB_READ_WRITE_TOKEN in .env or use local storage
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            // Vercel Blob token is automatically available in Vercel environment
            // For local development, set BLOB_READ_WRITE_TOKEN in .env
            token: process.env.BLOB_READ_WRITE_TOKEN,
            collections: {
              media: true, // Enable Vercel Blob storage for media collection
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






