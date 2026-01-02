import type { CollectionConfig } from 'payload/types'

const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['firstName', 'lastName', 'email', 'subject', 'status', 'createdAt'],
    group: 'Communication',
  },
  access: {
    read: (args: any) => {
      const { req: { user } } = args
      if (user) {
        return true
      }
      return false
    },
    create: () => true, // Public can send messages
    update: (args: any) => {
      return args.req?.user?.role === 'admin'
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
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email Address',
    },
    {
      name: 'subject',
      type: 'select',
      required: true,
      options: [
        { label: 'General Inquiry', value: 'general' },
        { label: 'Registration Support', value: 'registration' },
        { label: 'Abstract Submission', value: 'abstract' },
        { label: 'Partnership Inquiry', value: 'partnership' },
        { label: 'Media Inquiry', value: 'media' },
        { label: 'Technical Support', value: 'technical' },
        { label: 'Other', value: 'other' },
      ],
      label: 'Subject',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message',
      admin: {
        description: 'Your message or inquiry',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
      label: 'Status',
      admin: {
        description: 'Message status for admin tracking',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: {
        description: 'Internal notes for admin use',
        condition: (data: any, siblingData: any) => {
          // Only show to admins
          return true // Will be controlled by access control
        },
      },
    },
  ],
  timestamps: true,
}

export default ContactMessages




