import type { CollectionConfig } from 'payload/types'

const VenueLocations: CollectionConfig = {
  slug: 'venue-locations',
  admin: {
    useAsTitle: 'venueName',
    defaultColumns: ['venueName', 'city', 'country', 'conferenceEdition', 'isActive'],
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
      name: 'conferenceEdition',
      type: 'text',
      required: true,
      label: 'Conference Edition',
      admin: {
        description: 'e.g., SARSYC VI, SARSYC V, SARSYC VII',
      },
    },
    {
      name: 'venueName',
      type: 'text',
      required: true,
      label: 'Venue Name',
      admin: {
        description: 'Full name of the conference venue',
      },
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      label: 'City',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
      label: 'Country',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Full Address',
      admin: {
        description: 'Complete street address',
      },
    },
    {
      name: 'latitude',
      type: 'number',
      required: true,
      label: 'Latitude',
      admin: {
        description: 'Decimal degrees (e.g., -22.5597)',
        step: 0.000001,
      },
    },
    {
      name: 'longitude',
      type: 'number',
      required: true,
      label: 'Longitude',
      admin: {
        description: 'Decimal degrees (e.g., 17.0832)',
        step: 0.000001,
      },
    },
    {
      name: 'zoomLevel',
      type: 'number',
      required: true,
      defaultValue: 15,
      label: 'Default Zoom Level',
      admin: {
        description: 'Zoom level (1-20, higher = more zoomed in)',
        min: 1,
        max: 20,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Additional information about the venue',
      },
    },
    {
      name: 'facilities',
      type: 'array',
      label: 'Facilities',
      fields: [
        {
          name: 'facility',
          type: 'text',
          required: true,
          label: 'Facility',
        },
      ],
      admin: {
        description: 'List of venue facilities',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Active',
      admin: {
        description: 'Only active venues will be displayed',
      },
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      defaultValue: false,
      label: 'Current Conference',
      admin: {
        description: 'Mark as the current/upcoming conference venue',
      },
    },
  ],
  timestamps: true,
}

export default VenueLocations



