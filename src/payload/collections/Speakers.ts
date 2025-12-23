import { CollectionConfig } from 'payload/types'

const Speakers: CollectionConfig = {
  slug: 'speakers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'type', 'featured'],
    group: 'Conference',
  },
  access: {
    read: () => true, // Public can read
    create: (args: any) => Boolean(args.req?.user),
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Professional Title',
      admin: {
        placeholder: 'e.g., Professor of Public Health',
      },
    },
    {
      name: 'organization',
      type: 'text',
      required: true,
      label: 'Organization/Institution',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
      label: 'Country',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Professional Photo',
    },
    {
      name: 'bio',
      type: 'richText',
      required: true,
      label: 'Biography (2-3 paragraphs)',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      hasMany: true,
      label: 'Speaker Type',
      options: [
        { label: 'Keynote Speaker', value: 'keynote' },
        { label: 'Plenary Speaker', value: 'plenary' },
        { label: 'Panel Moderator', value: 'moderator' },
        { label: 'Workshop Facilitator', value: 'facilitator' },
        { label: 'Session Presenter', value: 'presenter' },
      ],
    },
    {
      name: 'sessions',
      type: 'relationship',
      relationTo: 'sessions',
      hasMany: true,
      label: 'Speaking At',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on Homepage',
      defaultValue: false,
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Social Media Links',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          label: 'Twitter/X Handle',
          admin: {
            placeholder: '@username',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
        {
          name: 'website',
          type: 'text',
          label: 'Personal Website',
        },
      ],
    },
    {
      name: 'expertise',
      type: 'array',
      label: 'Areas of Expertise',
      fields: [
        {
          name: 'area',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
}

export default Speakers


