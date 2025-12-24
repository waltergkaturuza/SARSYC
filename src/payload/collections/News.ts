import type { CollectionConfig } from 'payload/types'

const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedDate', 'status'],
    group: 'Content',
  },
  access: {
    read: (args: any) => {
      const { req: { user } } = args
      if (user) {
        return true
      }
      // Public can only read published articles
      return {
        status: {
          equals: 'published',
        },
      }
    },
    create: (args: any) => Boolean(args.req?.user),
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Article Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      hooks: {
        beforeValidate: [
          (args: any) => {
            const { value, data } = args
            if (!value && data.title) {
              return data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      label: 'Excerpt (1-2 sentences)',
      maxLength: 200,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Article Content',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Featured Image',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      hasMany: true,
      label: 'Categories',
      options: [
        { label: 'Conference Updates', value: 'conference' },
        { label: 'Speaker Announcements', value: 'speakers' },
        { label: 'Partnership News', value: 'partnerships' },
        { label: 'Youth Stories', value: 'youth-stories' },
        { label: 'Research', value: 'research' },
        { label: 'Advocacy', value: 'advocacy' },
        { label: 'Events', value: 'events' },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Author',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Publication Status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Published Date',
      admin: {
        condition: (data: any) => data.status === 'published', 
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on Homepage',
      defaultValue: false,
    },
  ],
  timestamps: true,
}

export default News



