import type { CollectionConfig } from 'payload/types'

const StanbicPaymentEvents: CollectionConfig = {
  slug: 'stanbic-payment-events',
  admin: {
    useAsTitle: 'event',
    defaultColumns: ['event', 'registrationRef', 'verificationApproved', 'createdAt'],
    group: 'System',
    description: 'Stanbic / N-Genius hosted payment certification log (mirrors [stanbic-cert] console lines).',
    hidden: true,
  },
  access: {
    read: (args: any) => {
      const role = args.req?.user?.role
      return role === 'admin' || role === 'accountant'
    },
    create: () => true,
    update: () => false,
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'event',
      type: 'text',
      required: true,
      label: 'Event',
      admin: { description: 'stanbic_start | stanbic_return | stanbic_duplicate_attempt' },
    },
    {
      name: 'registrationRef',
      type: 'text',
      label: 'Reference',
      index: true,
    },
    {
      name: 'orderReference',
      type: 'text',
      label: 'Order reference',
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email',
    },
    {
      name: 'verificationApproved',
      type: 'checkbox',
      label: 'Verification approved',
      defaultValue: false,
    },
    {
      name: 'dbPaymentStatusUpdated',
      type: 'checkbox',
      label: 'DB payment status updated',
      defaultValue: false,
    },
    {
      name: 'paymentState',
      type: 'text',
      label: 'Payment state',
    },
    {
      name: 'paymentStatus',
      type: 'text',
      label: 'Cert payment status',
    },
    {
      name: 'verificationError',
      type: 'textarea',
      label: 'Verification error / note',
    },
    {
      name: 'payload',
      type: 'json',
      label: 'Full log payload',
    },
  ],
  timestamps: true,
}

export default StanbicPaymentEvents
