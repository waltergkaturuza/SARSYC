import type { CollectionConfig } from 'payload/types'

const Registrations: CollectionConfig = {
  slug: 'registrations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'category', 'status', 'createdAt'],
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
    create: () => true, // Public can register
    update: (args: any) => {
      const { req: { user } } = args
      if (user) {
        return true
      }
      return false
    },
    delete: (args: any) => {
      return args.req?.user?.role === 'admin'
    },
  },
  fields: [
    {
      type: 'row',
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
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
          label: 'Email Address',
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: 'Phone Number',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'country',
          type: 'text',
          required: true,
          label: 'Country',
        },
        {
          name: 'organization',
          type: 'text',
          required: true,
          label: 'Organization/Institution',
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Participation Category',
      options: [
        { label: 'Student/Youth Delegate', value: 'student' },
        { label: 'Young Researcher', value: 'researcher' },
        { label: 'Policymaker/Government Official', value: 'policymaker' },
        { label: 'Development Partner', value: 'partner' },
        { label: 'Observer', value: 'observer' },
      ],
    },
    {
      name: 'dietaryRestrictions',
      type: 'select',
      label: 'Dietary Restrictions',
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
      name: 'tshirtSize',
      type: 'select',
      label: 'T-Shirt Size',
      options: [
        { label: 'XS', value: 'xs' },
        { label: 'S', value: 's' },
        { label: 'M', value: 'm' },
        { label: 'L', value: 'l' },
        { label: 'XL', value: 'xl' },
        { label: 'XXL', value: 'xxl' },
      ],
    },
    {
      name: 'registrationId',
      type: 'text',
      label: 'Registration ID',
      unique: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          (args: any) => {
            const { value, operation } = args
            if (operation === 'create' && !value) {
              // Format: SARSYC-YYMMDD-XXXXXX (e.g., SARSYC-261224-A3B7C9)
              const now = new Date()
              const year = now.getFullYear().toString().slice(-2) // Last 2 digits
              const month = String(now.getMonth() + 1).padStart(2, '0')
              const day = String(now.getDate()).padStart(2, '0')
              const random = Math.random().toString(36).substring(2, 8).toUpperCase()
              return `SARSYC-${year}${month}${day}-${random}`
            }
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Registration Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      access: {
        create: () => false,
        update: (args: any) => Boolean(args.req?.user),
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'Payment Status',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Waived', value: 'waived' },
      ],
      access: {
        create: () => false,
        update: (args: any) => args.req?.user?.role === 'admin',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Admin Notes',
      access: {
        read: (args: any) => Boolean(args.req?.user),
        create: (args: any) => Boolean(args.req?.user),
        update: (args: any) => Boolean(args.req?.user),
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      admin: { readOnly: true },
      label: 'Deleted At',
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [
      async (args: any) => {
        const { doc, operation, req } = args
        // Send confirmation email after registration
        if (operation === 'create') {
          // TODO: Implement email sending
          console.log('Send registration confirmation email to:', doc.email)
        }
      },
    ],
  },
}

export default Registrations






