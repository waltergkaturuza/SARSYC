import type { CollectionConfig } from 'payload/types'

const Participants: CollectionConfig = {
  slug: 'participants',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'organization', 'country', 'checkedIn'],
    group: 'Conference',
  },
  access: {
    read: (args: any) => Boolean(args.req?.user), // Admins only by default
    create: (args: any) => Boolean(args.req?.user),
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
      label: 'First Name',
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      label: 'Last Name',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: { readOnly: false },
      label: 'Email Address',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'country',
      type: 'text',
      label: 'Country',
    },
    {
      name: 'organization',
      type: 'text',
      label: 'Organization/Institution',
    },
    {
      name: 'jobTitle',
      type: 'text',
      label: 'Job Title',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Photo',
    },
    {
      name: 'dietaryRestrictions',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'None', value: 'none' },
        { label: 'Vegetarian', value: 'vegetarian' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Halal', value: 'halal' },
        { label: 'Gluten-free', value: 'gluten-free' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'accessibilityNeeds',
      type: 'textarea',
      label: 'Accessibility Requirements',
    },
    {
      name: 'registration',
      type: 'relationship',
      relationTo: 'registrations',
      label: 'Registration Record',
    },
    {
      name: 'ticketType',
      type: 'select',
      label: 'Ticket Type',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Student', value: 'student' },
        { label: 'VIP', value: 'vip' },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'Payment Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Waived', value: 'waived' },
      ],
    },
    {
      name: 'checkedIn',
      type: 'checkbox',
      label: 'Checked In',
      defaultValue: false,
    },
    {
      name: 'checkedInAt',
      type: 'date',
      admin: { readOnly: true },
      label: 'Checked In At',
    },
    {
      name: 'badgesPrintedAt',
      type: 'date',
      admin: { readOnly: false },
      label: 'Badges Printed At',
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Admin Notes',
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [{ name: 'tag', type: 'text' }],
    },
  ],
  hooks: {
    beforeChange: [
      async (args: any) => {
        // Normalize email
        if (args.data && args.data.email) {
          args.data.email = args.data.email.toLowerCase()
        }
        return args
      },
    ],
  },
  timestamps: true,
}

export default Participants
