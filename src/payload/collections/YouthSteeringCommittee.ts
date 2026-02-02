import type { CollectionConfig } from 'payload/types'
import { getCountryOptions } from '@/lib/countries'
import { addAuditHooks } from '@/lib/auditHooks'

const YouthSteeringCommittee: CollectionConfig = {
  slug: 'youth-steering-committee',
  labels: {
    singular: 'Youth Steering Committee Member',
    plural: 'Youth Steering Committee',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'country', 'role', 'featured'],
    group: 'Conference',
    description: 'Manage Youth Steering Committee members',
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
      name: 'role',
      type: 'text',
      required: true,
      label: 'Role/Position',
      admin: {
        placeholder: 'e.g., Chairperson, Vice Chair, Member',
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
      label: 'Profile Photo',
      admin: {
        description: 'Upload profile photo. Photos are stored in Vercel Blob storage.',
      },
    },
    {
      name: 'bio',
      type: 'richText',
      required: true,
      label: 'Biography',
      admin: {
        description: 'Brief biography of the committee member (2-3 paragraphs)',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      admin: {
        description: 'Optional email for contact',
      },
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
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on Homepage',
      defaultValue: false,
      admin: {
        description: 'Display this member prominently on the homepage',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Display Order',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first. Use this to control the order of display.',
      },
    },
  ],
  timestamps: true,
}

export default addAuditHooks(YouthSteeringCommittee)
