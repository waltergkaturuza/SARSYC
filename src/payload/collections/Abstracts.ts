import type { CollectionConfig } from 'payload/types'
import { getCountryOptions } from '@/lib/countries'

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
        return true // Admins can read all
      }
      // Public API can read abstracts by email/submissionId (handled via API routes)
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
      required: false, // Make it optional for public submissions
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
      required: false, // Make it optional for public submissions
      admin: {
        description: 'Optional: Upload a PDF or Word document version of your abstract',
      },
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
        condition: (data: any) => ['revisions', 'rejected', 'accepted'].includes(data.status),
        description: 'These comments will be visible to the author when status is updated',
      },
      access: {
        // Authors can read their own reviewer comments via API
        // Admins can always read/write
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
        // Wrap entire hook in try-catch to prevent hook errors from failing the update
        try {
          const { doc, operation, previousDoc, req } = args
          
          // Only proceed if we have the necessary data
          if (!doc || !doc.primaryAuthor || !doc.primaryAuthor.email) {
            console.warn('Abstract hook: Missing required data for email', { hasDoc: !!doc, hasAuthor: !!doc?.primaryAuthor })
            return
          }
          
          // Import email function dynamically to avoid circular dependencies
          // Use fire-and-forget pattern to not block the update
          const emailPromise = (async () => {
            try {
              const { sendAbstractStatusUpdate } = await import('@/lib/mail')
              
              // Send confirmation email on submission
              if (operation === 'create') {
                await sendAbstractStatusUpdate({
                  to: doc.primaryAuthor.email,
                  firstName: doc.primaryAuthor.firstName,
                  submissionId: doc.submissionId || `ABS-${doc.id}`,
                  title: doc.title,
                  status: 'received',
                })
                console.log('Abstract submission confirmation sent to:', doc.primaryAuthor.email)
              }
              
              // Send status update email when status changes
              if (operation === 'update' && previousDoc?.status !== doc.status) {
                await sendAbstractStatusUpdate({
                  to: doc.primaryAuthor.email,
                  firstName: doc.primaryAuthor.firstName,
                  submissionId: doc.submissionId || `ABS-${doc.id}`,
                  title: doc.title,
                  status: doc.status,
                  reviewerComments: doc.reviewerComments || undefined,
                })
                console.log('Abstract status update email sent to:', doc.primaryAuthor.email, '- New status:', doc.status)
              }
            } catch (emailError: any) {
              // Log but don't throw - email failures shouldn't block updates
              console.error('Email sending error in abstract hook:', emailError.message || emailError)
            }
          })()
          
          // Don't await - let it run in background
          // This ensures the update completes even if email fails
          emailPromise.catch((err) => {
            console.error('Email promise error (non-blocking):', err)
          })
        } catch (hookError: any) {
          // Catch any unexpected errors in the hook itself
          // Log but don't throw - we don't want hook errors to fail the update
          console.error('Abstract hook error (non-blocking):', hookError.message || hookError)
        }
      },
    ],
  },
}

export default Abstracts






