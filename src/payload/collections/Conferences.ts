import type { CollectionConfig } from 'payload/types'

const Conferences: CollectionConfig = {
  slug: 'conferences',
  labels: {
    singular: 'Conference',
    plural: 'Conferences',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'location', 'isCurrent', 'status'],
    group: 'Conference',
    description: 'Current and previous SARSYC conference editions',
  },
  access: {
    read: (args: any) => {
      if (args.req?.user) return true
      return { status: { equals: 'published' } }
    },
    create: (args: any) => Boolean(args.req?.user),
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => Boolean(args.req?.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }: any) => {
        // When marking a conference as current, demote any other current edition
        // so it automatically appears under Previous Conferences.
        if (data?.isCurrent === true) {
          const payload = req?.payload
          if (payload) {
            const others = await payload.find({
              collection: 'conferences',
              where: { isCurrent: { equals: true } },
              limit: 50,
              depth: 0,
              overrideAccess: true,
            })
            const currentId = originalDoc?.id
            for (const doc of others.docs) {
              if (currentId != null && String(doc.id) === String(currentId)) continue
              await payload.update({
                collection: 'conferences',
                id: doc.id,
                data: { isCurrent: false },
                overrideAccess: true,
                depth: 0,
              })
            }
          }
        }
        return data
      },
    ],
    beforeValidate: [
      ({ data }: any) => {
        if (data && !data.slug && data.title) {
          data.slug = String(data.title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Conference Title',
      admin: { placeholder: 'e.g. SARSYC V' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'Used in /conferences/[slug]. Auto-generated from title if left empty on create.',
      },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      label: 'Year',
      admin: { placeholder: '2024' },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      label: 'Location',
      admin: { placeholder: 'e.g. Windhoek, Namibia' },
    },
    {
      name: 'theme',
      type: 'text',
      label: 'Theme',
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      label: 'Summary',
      admin: { description: 'Short blurb shown on the Previous Conferences list.' },
    },
    {
      name: 'participants',
      type: 'text',
      label: 'Participants',
      admin: { placeholder: 'e.g. 500 or 500+' },
    },
    {
      name: 'highlights',
      type: 'text',
      label: 'Highlights',
    },
    {
      name: 'keyOutcomes',
      type: 'array',
      label: 'Key Outcomes',
      fields: [
        {
          name: 'outcome',
          type: 'text',
          required: true,
          label: 'Outcome',
        },
      ],
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Full Description',
      admin: {
        description: 'Optional longer description for the conference detail page.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Photo Gallery',
      admin: {
        description:
          'Add at least one photo per conference. Multiple photos slide automatically on the public pages.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
        },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'relatedLinks',
      type: 'array',
      label: 'Related Links / Materials',
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Label' },
        { name: 'url', type: 'text', required: true, label: 'URL' },
      ],
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      label: 'Current Conference',
      defaultValue: false,
      admin: {
        description:
          'Only one conference should be current. Marking a new edition as current automatically moves the previous current edition into Previous Conferences.',
        position: 'sidebar',
      },
    },
    {
      name: 'currentPath',
      type: 'text',
      label: 'Current Conference Path',
      admin: {
        description: 'Public path for the live conference site (e.g. /sarsyc-vi). Used when this edition is current.',
        placeholder: '/sarsyc-vi',
        condition: (_: any, siblingData: any) => Boolean(siblingData?.isCurrent),
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      label: 'Visibility',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}

export default Conferences
