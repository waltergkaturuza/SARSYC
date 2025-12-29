import type { CollectionConfig } from 'payload/types'
import { addAuditHooks } from '@/lib/auditHooks'

const Users: CollectionConfig = {
  slug: 'users',
  auth: {},
  access: {
    read: () => true,
    create: (args: any) => {
      const { req: { user } } = args
      // Only admins can create users
      return user?.role === 'admin'
    },
    update: (args: any) => {
      const { req: { user } } = args
      // Only admins or the user themselves can update
      return user?.role === 'admin' || Boolean(user)
    },
    delete: (args: any) => {
      const { req: { user } } = args
      // Only admins can delete users
      return user?.role === 'admin'
    },
  },
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
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Contributor',
          value: 'contributor',
        },
        {
          label: 'Speaker',
          value: 'speaker',
        },
        {
          label: 'Presenter',
          value: 'presenter',
        },
        {
          label: 'Volunteer',
          value: 'volunteer',
        },
      ],
      access: {
        create: (args: any) => args.req?.user?.role === 'admin',
        update: (args: any) => args.req?.user?.role === 'admin',
      },
    },
    {
      name: 'speaker',
      type: 'relationship',
      relationTo: 'speakers',
      label: 'Associated Speaker Profile',
      admin: {
        description: 'Link to speaker profile (if this user is a speaker)',
      },
    },
    {
      name: 'abstract',
      type: 'relationship',
      relationTo: 'abstracts',
      label: 'Associated Abstract',
      admin: {
        description: 'Link to abstract submission (if this user is a presenter)',
      },
    },
    {
      name: 'volunteer',
      type: 'relationship',
      relationTo: 'volunteers',
      label: 'Associated Volunteer Profile',
      admin: {
        description: 'Link to volunteer application (if this user is a volunteer)',
      },
    },
    {
      name: 'organization',
      type: 'text',
      label: 'Organization',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
  ],
  timestamps: true,
}

export default Users






