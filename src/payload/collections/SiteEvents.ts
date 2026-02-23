import type { CollectionConfig } from 'payload/types'

const SiteEvents: CollectionConfig = {
  slug: 'site-events',
  admin: {
    useAsTitle: 'eventType',
    defaultColumns: ['eventType', 'path', 'sessionId', 'createdAt'],
    group: 'Analytics',
    description: 'Track key interactions (form submissions, downloads, etc.)',
  },
  access: {
    read: ({ req }: any) => req?.user?.role === 'admin',
    create: () => true, // API route creates (no auth)
    update: () => false,
    delete: ({ req }: any) => req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'eventType',
      type: 'text',
      required: true,
      label: 'Event Type',
      admin: {
        description: 'e.g. form_submit, download, registration_start',
      },
    },
    {
      name: 'path',
      type: 'text',
      label: 'Path',
      admin: {
        description: 'Page where the event occurred',
      },
    },
    {
      name: 'sessionId',
      type: 'text',
      label: 'Session ID',
      admin: {
        description: 'Anonymized session for correlation',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      label: 'Metadata',
      admin: {
        description: 'Additional context (e.g. form name, file name)',
      },
    },
  ],
  timestamps: true,
}

export default SiteEvents
