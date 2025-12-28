import type { CollectionConfig } from 'payload/types'

const PartnershipInquiries: CollectionConfig = {
  slug: 'partnership-inquiries',
  admin: {
    useAsTitle: 'organizationName',
    defaultColumns: ['organizationName', 'contactPerson', 'email', 'tier', 'status', 'createdAt'],
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
    create: () => true, // Public can submit inquiries
    update: (args: any) => {
      return args.req?.user?.role === 'admin'
    },
    delete: (args: any) => {
      return args.req?.user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'organizationName',
      type: 'text',
      required: true,
      label: 'Organization Name',
    },
    {
      name: 'contactPerson',
      type: 'text',
      required: true,
      label: 'Contact Person',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email Address',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      options: [
        { label: 'Platinum Sponsor', value: 'platinum' },
        { label: 'Gold Sponsor', value: 'gold' },
        { label: 'Silver Sponsor', value: 'silver' },
        { label: 'Bronze Sponsor', value: 'bronze' },
        { label: 'Exhibition Only', value: 'exhibitor' },
        { label: 'Custom Partnership', value: 'custom' },
      ],
      label: 'Partnership Interest',
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      admin: {
        description: 'Additional information about partnership goals',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'In Discussion', value: 'in-discussion' },
        { label: 'Approved', value: 'approved' },
        { label: 'Declined', value: 'declined' },
        { label: 'Closed', value: 'closed' },
      ],
      label: 'Status',
      admin: {
        description: 'Inquiry status for admin tracking',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: {
        description: 'Internal notes for admin use',
      },
    },
  ],
  timestamps: true,
}

export default PartnershipInquiries


