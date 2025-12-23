import { buildConfig } from 'payload/config'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { slateEditor } from '@payloadcms/richtext-slate'
import path from 'path'

// Collections
import Users from './collections/Users'
import Registrations from './collections/Registrations'
import Abstracts from './collections/Abstracts'
import Speakers from './collections/Speakers'
import Sessions from './collections/Sessions'
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
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    meta: {
      titleSuffix: '- SARSYC VI Admin',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
  },
  editor: slateEditor({}),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI!,
  }),
  collections: [
    Users,
    Registrations,
    Abstracts,
    Speakers,
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
    outputFile: path.resolve(__dirname, '../types/payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
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


