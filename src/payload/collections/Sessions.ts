import type { CollectionConfig } from 'payload/types'

const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'track', 'status', 'date'],
    group: 'Conference',
  },
  access: {
    read: (args: any) => {
      if (args.req?.user) return true
      // Public can only see published sessions
      return { status: { equals: 'published' } }
    },
    create: (args: any) => Boolean(args.req?.user),
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => Boolean(args.req?.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Session Title',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      label: 'Visibility',
      defaultValue: 'published',
      options: [
        { label: 'Published (public)', value: 'published' },
        { label: 'Draft (hidden from public)', value: 'draft' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        description: 'Draft and archived sessions stay in admin but are hidden from the public programme, PDF, and calendar.',
        position: 'sidebar',
      },
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
        { label: 'Welcome Remarks', value: 'welcome-remarks' },
        { label: 'Introductions', value: 'introductions' },
        { label: 'Presentation', value: 'presentation' },
        { label: 'Panel Discussion', value: 'panel' },
        { label: 'Round Table Discussion', value: 'round-table' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Oral / Abstract Presentations', value: 'oral' },
        { label: 'Poster Session', value: 'poster' },
        { label: 'Launch Event', value: 'launch-event' },
        { label: 'Concluding Presentation', value: 'concluding-presentation' },
        { label: 'Forum Reflection', value: 'forum-reflection' },
        { label: 'Award Ceremony', value: 'award-ceremony' },
        { label: 'Music / Dance', value: 'music-dance' },
        { label: 'Networking', value: 'networking' },
        { label: 'Lunch', value: 'lunch' },
        { label: 'Dinner', value: 'dinner' },
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
      label: 'Session Moderator (Speaker)',
      admin: {
        description: 'Optional speaker moderating this session. Use Youth Steering Committee moderator below if a committee member is moderating.',
      },
    },
    {
      name: 'committeeModerator',
      type: 'relationship',
      relationTo: 'youth-steering-committee',
      label: 'Session Moderator (Youth Steering Committee)',
      admin: {
        description: 'Optional Youth Steering Committee member moderating this session.',
      },
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






