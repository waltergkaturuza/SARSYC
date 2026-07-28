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
        { label: 'Oral / Abstract Presentations', value: 'oral' },
        { label: 'Poster Session', value: 'poster' },
        { label: 'Launch Event', value: 'launch-event' },
        { label: 'Concluding Presentation', value: 'concluding-presentation' },
        { label: 'Forum Reflection', value: 'forum-reflection' },
        { label: 'Award Ceremony', value: 'award-ceremony' },
        { label: 'Networking', value: 'networking' },
        { label: 'Registration / Break', value: 'break' },
        { label: 'Side Event', value: 'side-event' },
        { label: 'Post-Conference Activity', value: 'post-conference' },
        { label: 'Orathon', value: 'orathon' },
      ],
    },
    {
      name: 'day',
      type: 'select',
      required: true,
      label: 'Day',
      options: [
        { label: 'Day 1', value: 'day-1' },
        { label: 'Day 2', value: 'day-2' },
        { label: 'Day 3', value: 'day-3' },
        { label: 'Orathon (November 2026)', value: 'day-4' },
      ],
      defaultValue: 'day-1',
    },
    {
      name: 'track',
      type: 'select',
      label: 'Conference Track',
      options: [
        { label: 'General / Plenary', value: 'general' },
        { label: 'Track 1: Education Rights & Equity', value: 'education-rights' },
        { label: 'Track 2: HIV/AIDS, STIs, & Sexual Health', value: 'hiv-aids' },
        { label: 'Track 3: NCDs Prevention & Healthy Lifestyles', value: 'ncd-prevention' },
        { label: 'Track 4: Digital Health & Safety', value: 'digital-health' },
        { label: 'Track 5: Mental Health & Substance Abuse', value: 'mental-health' },
        // Legacy values kept so older records remain valid.
        { label: 'Legacy: Youth SRHR', value: 'srhr' },
        { label: 'Legacy: Education & Skills', value: 'education' },
        { label: 'Legacy: Advocacy & Policy', value: 'advocacy' },
        { label: 'Legacy: Innovation & Technology', value: 'innovation' },
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
      name: 'committeeMembers',
      type: 'relationship',
      relationTo: 'youth-steering-committee',
      hasMany: true,
      label: 'Youth Steering Committee Members',
      admin: {
        description: 'Committee members taking part in this session (e.g. chairing or giving remarks)',
      },
    },
    {
      name: 'speakerNames',
      type: 'text',
      label: 'Additional Speaker Names',
      admin: {
        description:
          'Guest presenters not yet in the speakers list, separated by commas (e.g. "Harry Chiwoza (Malawi), Dr. Kahimbi Sylvia Mahoto (Namibia)")',
      },
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






