import type { CollectionConfig } from 'payload/types'

const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'track', 'date', 'time'],
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
      name: 'title',
      type: 'text',
      required: true,
      label: 'Session Title',
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      label: 'Session Description',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Session Type',
      options: [
        { label: 'Keynote', value: 'keynote' },
        { label: 'Plenary', value: 'plenary' },
        { label: 'Panel Discussion', value: 'panel' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Oral Presentations', value: 'oral' },
        { label: 'Poster Session', value: 'poster' },
        { label: 'Networking', value: 'networking' },
        { label: 'Side Event', value: 'side-event' },
      ],
    },
    {
      name: 'track',
      type: 'select',
      label: 'Conference Track',
      options: [
        { label: 'Track 1: Youth Sexual & Reproductive Health', value: 'srhr' },
        { label: 'Track 2: Education & Skills Development', value: 'education' },
        { label: 'Track 3: Advocacy & Policy Influence', value: 'advocacy' },
        { label: 'Track 4: Innovation & Technology for Youth', value: 'innovation' },
        { label: 'General/Plenary', value: 'general' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'date',
          type: 'date',
          required: true,
          label: 'Date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'startTime',
          type: 'date',
          required: true,
          label: 'Start Time',
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
            },
          },
        },
        {
          name: 'endTime',
          type: 'date',
          required: true,
          label: 'End Time',
          admin: {
            date: {
              pickerAppearance: 'timeOnly',
            },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'venue',
          type: 'text',
          required: true,
          label: 'Venue/Room',
          admin: {
            placeholder: 'e.g., Main Hall A',
          },
        },
        {
          name: 'capacity',
          type: 'number',
          label: 'Room Capacity',
        },
      ],
    },
    {
      name: 'speakers',
      type: 'relationship',
      relationTo: 'speakers',
      hasMany: true,
      label: 'Speakers/Moderators',
    },
    {
      name: 'moderator',
      type: 'relationship',
      relationTo: 'speakers',
      label: 'Session Moderator',
    },
    {
      name: 'presentations',
      type: 'relationship',
      relationTo: 'abstracts',
      hasMany: true,
      label: 'Linked Presentations',
      admin: {
        condition: (data: any) => ['oral', 'poster'].includes(data.type),
      },
    },
    {
      name: 'requiresRegistration',
      type: 'checkbox',
      label: 'Requires Separate Registration',
      defaultValue: false,
      admin: {
        description: 'For workshops with limited capacity',
      },
    },
    {
      name: 'materials',
      type: 'array',
      label: 'Session Materials',
      fields: [
        {
          name: 'material',
          type: 'upload',
          relationTo: 'media',
          label: 'File',
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
      ],
    },
  ],
  timestamps: true,
}

export default Sessions






