import type { CollectionConfig } from 'payload/types'

const Partners: CollectionConfig = {
  slug: 'partners',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'tier', 'type', 'active'],
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Partner/Organization Name',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Logo',
    },
    {
      name: 'description',
      type: 'richText',
      label: 'About the Partner',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Partnership Type',
      options: [
        { label: 'Implementing Partner', value: 'implementing' },
        { label: 'Funding Partner', value: 'funding' },
        { label: 'Technical Partner', value: 'technical' },
        { label: 'Media Partner', value: 'media' },
        { label: 'Sponsor', value: 'sponsor' },
      ],
    },
    {
      name: 'tier',
      type: 'select',
      label: 'Sponsorship Tier',
      options: [
        { label: 'Platinum', value: 'platinum' },
        { label: 'Gold', value: 'gold' },
        { label: 'Silver', value: 'silver' },
        { label: 'Bronze', value: 'bronze' },
        { label: 'In-Kind', value: 'in-kind' },
        { label: 'Not Applicable', value: 'n/a' },
      ],
      admin: {
        condition: (data: any) => data.type === 'sponsor',
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website URL',
      admin: {
        placeholder: 'https://',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Currently Active',
      defaultValue: true,
    },
    {
      name: 'sarsycEditions',
      type: 'select',
      hasMany: true,
      label: 'Partnered at SARSYC Editions',
      options: [
        { label: 'SARSYC I (2014)', value: '1' },
        { label: 'SARSYC II (2016)', value: '2' },
        { label: 'SARSYC III (2018)', value: '3' },
        { label: 'SARSYC IV (2020)', value: '4' },
        { label: 'SARSYC V (2022)', value: '5' },
        { label: 'SARSYC VI (2026)', value: '6' },
      ],
    },
    {
      name: 'displayOrder',
      type: 'number',
      label: 'Display Order',
      admin: {
        description: 'Lower numbers appear first',
      },
    },
  ],
  timestamps: true,
}

export default Partners






