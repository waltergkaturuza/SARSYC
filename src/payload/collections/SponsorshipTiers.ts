import type { CollectionConfig } from 'payload/types'

const SponsorshipTiers: CollectionConfig = {
  slug: 'sponsorship-tiers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'isPopular', 'order', 'isActive'],
    group: 'Conference',
  },
  access: {
    read: () => true, // Public can read
    create: (args: any) => {
      return args.req?.user?.role === 'admin'
    },
    update: (args: any) => {
      return args.req?.user?.role === 'admin'
    },
    delete: (args: any) => {
      return args.req?.user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Tier Name',
      admin: {
        description: 'e.g., Platinum, Gold, Silver, Bronze',
      },
    },
    {
      name: 'price',
      type: 'text',
      required: true,
      label: 'Price',
      admin: {
        description: 'Display price (e.g., "$25,000" or "Custom")',
      },
    },
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      label: 'Display Order',
      admin: {
        description: 'Lower numbers appear first (0, 1, 2, 3...)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        description: 'Only active tiers will be displayed on the website',
      },
    },
    {
      name: 'isPopular',
      type: 'checkbox',
      defaultValue: false,
      label: 'Mark as "Most Popular"',
      admin: {
        description: 'Shows a "MOST POPULAR" badge on this tier',
      },
    },
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: 'star',
      options: [
        { label: 'Star', value: 'star' },
        { label: 'Award', value: 'award' },
        { label: 'Trending Up', value: 'trending' },
        { label: 'Heart', value: 'heart' },
        { label: 'Diamond', value: 'diamond' },
        { label: 'Trophy', value: 'trophy' },
      ],
      label: 'Icon',
    },
    {
      name: 'color',
      type: 'select',
      required: true,
      defaultValue: 'gray',
      options: [
        { label: 'Gray', value: 'gray' },
        { label: 'Yellow/Gold', value: 'yellow' },
        { label: 'Silver', value: 'silver' },
        { label: 'Orange', value: 'orange' },
        { label: 'Blue', value: 'blue' },
        { label: 'Purple', value: 'purple' },
        { label: 'Green', value: 'green' },
        { label: 'Red', value: 'red' },
      ],
      label: 'Color Theme',
      admin: {
        description: 'Color gradient for the tier card',
      },
    },
    {
      name: 'benefits',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Benefits',
      fields: [
        {
          name: 'benefit',
          type: 'text',
          required: true,
          label: 'Benefit',
        },
      ],
      admin: {
        description: 'List of benefits included in this tier',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Optional description or additional information',
      },
    },
  ],
  timestamps: true,
}

export default SponsorshipTiers



