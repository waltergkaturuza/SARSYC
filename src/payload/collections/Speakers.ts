import type { CollectionConfig } from 'payload/types'
import { getCountryOptions } from '@/lib/countries'
import crypto from 'crypto'

const Speakers: CollectionConfig = {
  slug: 'speakers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'type', 'featured'],
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full Name',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email Address',
      admin: {
        description: 'Email address for speaker account and communications',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'User Account',
      admin: {
        description: 'Automatically created user account for this speaker',
        readOnly: true,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Professional Title',
      admin: {
        placeholder: 'e.g., Professor of Public Health',
      },
    },
    {
      name: 'organization',
      type: 'text',
      required: true,
      label: 'Organization/Institution',
    },
    {
      name: 'country',
      type: 'select',
      required: true,
      label: 'Country',
      options: getCountryOptions(),
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Professional Photo',
    },
    {
      name: 'bio',
      type: 'richText',
      required: true,
      label: 'Biography (2-3 paragraphs)',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      hasMany: true,
      label: 'Speaker Type',
      options: [
        { label: 'Keynote Speaker', value: 'keynote' },
        { label: 'Plenary Speaker', value: 'plenary' },
        { label: 'Panel Moderator', value: 'moderator' },
        { label: 'Workshop Facilitator', value: 'facilitator' },
        { label: 'Session Presenter', value: 'presenter' },
      ],
    },
    {
      name: 'sessions',
      type: 'relationship',
      relationTo: 'sessions',
      hasMany: true,
      label: 'Speaking At',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on Homepage',
      defaultValue: false,
    },
    {
      name: 'socialMedia',
      type: 'group',
      label: 'Social Media Links',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          label: 'Twitter/X Handle',
          admin: {
            placeholder: '@username',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
        {
          name: 'website',
          type: 'text',
          label: 'Personal Website',
        },
      ],
    },
    {
      name: 'expertise',
      type: 'array',
      label: 'Areas of Expertise',
      fields: [
        {
          name: 'area',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async (args: any) => {
        try {
          const { doc, operation, req } = args
          
          // Only create user on speaker creation
          if (operation !== 'create') {
            return
          }
          
          // Check if email exists
          if (!doc?.email) {
            console.warn('Speaker created without email, skipping user account creation')
            return
          }
          
          // Check if user already exists for this email
          const payload = req.payload
          const existingUsers = await payload.find({
            collection: 'users',
            where: {
              email: {
                equals: doc.email.toLowerCase().trim(),
              },
            },
            limit: 1,
            depth: 0,
          })
          
          if (existingUsers.totalDocs > 0) {
            // User already exists, link speaker to existing user
            const existingUser = existingUsers.docs[0]
            await payload.update({
              collection: 'speakers',
              id: doc.id,
              data: {
                user: existingUser.id,
              },
              overrideAccess: true,
            })
            
            // Update user to link to speaker if not already linked
            if (!existingUser.speaker) {
              await payload.update({
                collection: 'users',
                id: existingUser.id,
                data: {
                  speaker: doc.id,
                },
                overrideAccess: true,
              })
            }
            
            console.log(`Speaker ${doc.id} linked to existing user ${existingUser.id}`)
            return
          }
          
          // Generate random password
          const randomPassword = crypto.randomBytes(16).toString('hex')
          
          // Create user account
          const nameParts = doc.name.split(' ').filter((p: string) => p.trim())
          const firstName = nameParts[0] || doc.name
          const lastName = nameParts.slice(1).join(' ') || nameParts[0] || doc.name
          
          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: doc.email.toLowerCase().trim(),
              password: randomPassword, // Will be hashed automatically
              firstName,
              lastName,
              role: 'speaker',
              organization: doc.organization || undefined,
              phone: undefined, // Speakers don't have phone in their collection
              speaker: doc.id,
            },
            overrideAccess: true,
          })
          
          // Link speaker to user
          await payload.update({
            collection: 'speakers',
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
          const emailPromise = (async () => {
            try {
              const { sendWelcomeEmail } = await import('@/lib/mail')
              await sendWelcomeEmail({
                to: doc.email,
                firstName,
                lastName,
                role: 'speaker',
                resetToken,
              })
              console.log(`Welcome email sent to speaker: ${doc.email}`)
            } catch (emailError: any) {
              console.error('Failed to send welcome email to speaker:', emailError.message || emailError)
            }
          })()
          
          // Don't await - let it run in background
          emailPromise.catch((err) => {
            console.error('Email promise error (non-blocking):', err)
          })
          
          console.log(`User account created for speaker ${doc.id} (${doc.email})`)
        } catch (error: any) {
          // Log but don't throw - user creation failure shouldn't block speaker creation
          console.error('Error creating user account for speaker:', error.message || error)
        }
      },
    ],
  },
}

export default Speakers






