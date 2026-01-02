import type { CollectionConfig } from 'payload/types'

const NewsletterSubscriptions: CollectionConfig = {
  slug: 'newsletter-subscriptions',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'subscribedAt', 'status'],
    group: 'Communication',
  },
  access: {
    read: (args: any) => {
      const { req: { user } } = args
      if (user) {
        return true
      }
      return false
    },
    create: () => true, // Public can subscribe
    update: (args: any) => {
      return args.req?.user?.role === 'admin'
    },
    delete: (args: any) => {
      return args.req?.user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email Address',
      admin: {
        description: 'Subscriber email address',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      admin: {
        description: 'Optional first name',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      admin: {
        description: 'Optional last name',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'subscribed',
      options: [
        { label: 'Subscribed', value: 'subscribed' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
        { label: 'Bounced', value: 'bounced' },
      ],
      label: 'Subscription Status',
    },
    {
      name: 'subscribedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      label: 'Subscribed At',
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      label: 'Unsubscribed At',
    },
    {
      name: 'source',
      type: 'text',
      label: 'Source',
      admin: {
        description: 'Where the subscription came from (e.g., homepage, footer)',
      },
    },
  ],
  timestamps: true,
}

export default NewsletterSubscriptions




