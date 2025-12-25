import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
// webpack bundler removed (incompatible version). Using default bundler.
import { slateEditor } from '@payloadcms/richtext-slate'
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

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  // Temporary local fallback for CLI operations — replace with secure env var in production
  secret: process.env.PAYLOAD_SECRET || 'changeme-local',
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
  plugins: [],
  rateLimit: {
    max: 2000,
    window: 15 * 60 * 1000, // 15 minutes
  },
})






