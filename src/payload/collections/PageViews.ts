import type { CollectionConfig } from 'payload/types'

const PageViews: CollectionConfig = {
  slug: 'page-views',
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'sessionId', 'referrer', 'createdAt'],
    group: 'Analytics',
    description: 'Track page views on the public site for analytics',
  },
  access: {
    read: ({ req }: any) => req?.user?.role === 'admin',
    create: () => true, // API route creates (no auth)
    update: () => false,
    delete: ({ req }: any) => req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      label: 'Page Path',
      admin: {
        description: 'URL path visited (e.g. /participate/register)',
      },
    },
    {
      name: 'referrer',
      type: 'text',
      label: 'Referrer',
      admin: {
        description: 'Where the visitor came from (optional)',
      },
    },
    {
      name: 'sessionId',
      type: 'text',
      required: true,
      label: 'Session ID',
      admin: {
        description: 'Anonymized session identifier for unique visitor counts',
      },
    },
  ],
  timestamps: true,
}

export default PageViews
