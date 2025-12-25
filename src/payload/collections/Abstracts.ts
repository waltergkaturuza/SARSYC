import type { CollectionConfig } from 'payload/types'

const Abstracts: CollectionConfig = {
  slug: 'abstracts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'primaryAuthor', 'track', 'status', 'createdAt'],
    group: 'Conference',
  },
  access: {
    read: (args: any) => {
      const { req: { user } } = args
      if (user) {
        return true
      }
      return false
    },
    create: () => true, // Public can submit
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'submissionId',
      type: 'text',
      label: 'Submission ID',
      unique: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          (args: any) => {
            const { value, operation } = args
            if (operation === 'create' && !value) {
              return `ABS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
            }
            return value
          },
        ],
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Abstract Title',
    },
    {
      name: 'abstract',
      type: 'textarea',
      required: true,
      label: 'Abstract Text (300 words max)',
      maxLength: 2000,
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'Keywords (3-5)',
      minRows: 3,
      maxRows: 5,
      fields: [
        {
          name: 'keyword',
          type: 'text',
        },
      ],
    },
    {
      name: 'track',
      type: 'select',
      required: true,
      label: 'Conference Track',
      options: [
        { label: 'Track 1: Youth Sexual & Reproductive Health', value: 'srhr' },
        { label: 'Track 2: Education & Skills Development', value: 'education' },
        { label: 'Track 3: Advocacy & Policy Influence', value: 'advocacy' },
        { label: 'Track 4: Innovation & Technology for Youth', value: 'innovation' },
      ],
    },
    {
      type: 'group',
      name: 'primaryAuthor',
      label: 'Primary Author',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              required: true,
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'email',
              type: 'email',
              required: true,
            },
            {
              name: 'phone',
              type: 'text',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'organization',
              type: 'text',
              required: true,
            },
            {
              name: 'country',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'coAuthors',
      type: 'array',
      label: 'Co-Authors',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'organization',
          type: 'text',
        },
      ],
    },
    {
      name: 'abstractFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Upload Abstract (PDF/Word)',
    },
    {
      name: 'presentationType',
      type: 'select',
      label: 'Preferred Presentation Type',
      options: [
        { label: 'Oral Presentation', value: 'oral' },
        { label: 'Poster Presentation', value: 'poster' },
        { label: 'Either', value: 'either' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'received',
      label: 'Status',
      options: [
        { label: 'Received', value: 'received' },
        { label: 'Under Review', value: 'under-review' },
        { label: 'Revisions Requested', value: 'revisions' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
      ],
      access: {
        create: () => false,
        update: (args: any) => Boolean(args.req?.user),
      },
    },
    {
      name: 'reviewerComments',
      type: 'textarea',
      label: 'Reviewer Comments',
      admin: {
        condition: (data: any) => ['revisions', 'rejected'].includes(data.status),
      },
      access: {
        read: (args: any) => Boolean(args.req?.user),
        create: (args: any) => Boolean(args.req?.user),
        update: (args: any) => Boolean(args.req?.user),
      },
    },
    {
      name: 'assignedSession',
      type: 'relationship',
      relationTo: 'sessions',
      label: 'Assigned Session',
      admin: {
        condition: (data: any) => data.status === 'accepted',
      },
      access: {
        create: (args: any) => Boolean(args.req?.user),
        update: (args: any) => Boolean(args.req?.user),
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes',
      access: {
        read: (args: any) => Boolean(args.req?.user),
        create: (args: any) => Boolean(args.req?.user),
        update: (args: any) => Boolean(args.req?.user),
      },
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async (args: any) => {
        const { doc, operation, previousDoc, req } = args
        // Send confirmation email on submission
        if (operation === 'create') {
          console.log('Send abstract submission confirmation to:', doc.primaryAuthor.email)
        }
        
        // Send status update email when status changes
        if (operation === 'update' && previousDoc.status !== doc.status) {
          console.log('Send status update email to:', doc.primaryAuthor.email, '- New status:', doc.status)
        }
      },
    ],
  },
}

export default Abstracts






