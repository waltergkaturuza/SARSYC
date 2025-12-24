import type { CollectionConfig } from 'payload/types'

const FAQs: CollectionConfig = {
  slug: 'faqs',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: (args: any) => Boolean(args.req?.user),
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
      label: 'Question',
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      label: 'Answer',
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Category',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Registration', value: 'registration' },
        { label: 'Abstract Submission', value: 'abstracts' },
        { label: 'Travel & Accommodation', value: 'travel' },
        { label: 'Visa', value: 'visa' },
        { label: 'Programme', value: 'programme' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Partnerships', value: 'partnerships' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first',
      },
    },
  ],
  timestamps: true,
}

export default FAQs



