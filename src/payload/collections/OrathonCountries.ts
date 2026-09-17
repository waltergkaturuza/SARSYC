import type { CollectionConfig } from 'payload/types'

const OrathonCountries: CollectionConfig = {
  slug: 'orathon-countries',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['country', 'title', 'registrationUrl', 'active', 'displayOrder'],
    group: 'Conference',
    description: 'Orathon registration links and flyers by country',
  },
  access: {
    read: () => true,
    create: (args: any) => Boolean(args.req?.user),
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'country',
      type: 'text',
      required: true,
      label: 'Country',
      admin: {
        description: 'ISO country code (e.g. ZW, NA) — set via admin form',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Card Title',
      admin: {
        placeholder: 'e.g. Register for Orathon — Zimbabwe',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short Description',
      admin: {
        description: 'Shown under the title on the registration card',
      },
    },
    {
      name: 'registrationUrl',
      type: 'text',
      required: true,
      label: 'Registration Link',
      admin: {
        placeholder: 'https://',
        description: 'External ticket / registration URL for this country',
      },
    },
    {
      name: 'flyer',
      type: 'upload',
      relationTo: 'media',
      label: 'Flyer Image',
      admin: {
        description: 'Optional flyer shown in the Orathon slideshow',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Active / Published',
      defaultValue: true,
    },
  ],
  timestamps: true,
}

export default OrathonCountries
