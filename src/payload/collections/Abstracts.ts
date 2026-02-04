import type { CollectionConfig } from 'payload/types'
import { getCountryOptions } from '@/lib/countries'
import crypto from 'crypto'
import { addAuditHooks } from '@/lib/auditHooks'

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
        { label: 'Track 1: Education Rights and Equity', value: 'education-rights' },
        { label: 'Track 2: HIV/AIDS, STIs and Vulnerable Groups', value: 'hiv-aids' },
        { label: 'Track 3: Non-Communicable Diseases (NCDs) Prevention and Health Lifestyles', value: 'ncd-prevention' },
        { label: 'Track 4: Digital Health and Safety', value: 'digital-health' },
        { label: 'Track 5: Mental Health and Substance Abuse', value: 'mental-health' },
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
      name: 'assignedReviewers',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      label: 'Assigned Reviewers',
      admin: {
        description: 'Select the reviewers who should evaluate this abstract',
      },
      access: {
        read: (args: any) => Boolean(args.req?.user),
        create: (args: any) => args.req?.user?.role === 'admin',
        update: (args: any) => args.req?.user?.role === 'admin',
      },
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
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'User Account',
      admin: {
        description: 'Automatically created user account for this presenter',
        readOnly: true,
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
          
          const payload = req.payload
          const authorEmail = doc.primaryAuthor.email.toLowerCase().trim()
          
          // Create user account when abstract is accepted (if not already exists)
          if (operation === 'update' && previousDoc?.status !== doc.status && doc.status === 'accepted') {
            try {
              // Check if user already exists for this email
              const existingUsers = await payload.find({
                collection: 'users',
                where: {
                  email: {
                    equals: authorEmail,
                  },
                },
                limit: 1,
                depth: 0,
              })
              
              if (existingUsers.totalDocs > 0) {
                // User already exists, link abstract to existing user
                const existingUser = existingUsers.docs[0]
                await payload.update({
                  collection: 'abstracts',
                  id: doc.id,
                  data: {
                    user: existingUser.id,
                  },
                  overrideAccess: true,
                })
                
                // Update user to link to abstract if not already linked
                if (!existingUser.abstract) {
                  await payload.update({
                    collection: 'users',
                    id: existingUser.id,
                    data: {
                      abstract: doc.id,
                    },
                    overrideAccess: true,
                  })
                }
                
                console.log(`Abstract ${doc.id} linked to existing user ${existingUser.id}`)
              } else {
                // Create new user account
                const randomPassword = crypto.randomBytes(16).toString('hex')
                const firstName = doc.primaryAuthor.firstName || 'Author'
                const lastName = doc.primaryAuthor.lastName || 'User'
                
                const newUser = await payload.create({
                  collection: 'users',
                  data: {
                    email: authorEmail,
                    password: randomPassword, // Will be hashed automatically
                    firstName,
                    lastName,
                    role: 'presenter',
                    organization: doc.primaryAuthor.organization || undefined,
                    phone: doc.primaryAuthor.phone || undefined,
                    abstract: doc.id,
                  },
                  overrideAccess: true,
                })
                
                // Link abstract to user
                await payload.update({
                  collection: 'abstracts',
                  id: doc.id,
                  data: {
                    user: typeof newUser === 'string' ? newUser : newUser.id,
                  },
                  overrideAccess: true,
                })
                
                // Generate password reset token
                const resetToken = crypto.randomBytes(32).toString('hex')
                const resetTokenExpiry = new Date()
                resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24) // 24 hours
                
                // Store reset token
                await payload.update({
                  collection: 'users',
                  id: typeof newUser === 'string' ? newUser : newUser.id,
                  data: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpiration: resetTokenExpiry.toISOString(),
                  },
                  overrideAccess: true,
                })
                
                // Send welcome email (non-blocking)
                const welcomeEmailPromise = (async () => {
                  try {
                    const { sendWelcomeEmail } = await import('@/lib/mail')
                    await sendWelcomeEmail({
                      to: authorEmail,
                      firstName,
                      lastName,
                      role: 'presenter',
                      resetToken,
                    })
                    console.log(`Welcome email sent to presenter: ${authorEmail}`)
                  } catch (emailError: any) {
                    console.error('Failed to send welcome email to presenter:', emailError.message || emailError)
                  }
                })()
                
                welcomeEmailPromise.catch((err) => {
                  console.error('Welcome email promise error (non-blocking):', err)
                })
                
                console.log(`User account created for presenter ${doc.id} (${authorEmail})`)
              }
            } catch (userError: any) {
              // Log but don't throw - user creation failure shouldn't block abstract update
              console.error('Error creating user account for presenter:', userError.message || userError)
            }
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

// Add audit hooks (preserves existing hooks automatically)
export default addAuditHooks(Abstracts)






