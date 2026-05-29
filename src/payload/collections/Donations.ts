import type { CollectionConfig } from 'payload/types'

const Donations: CollectionConfig = {
  slug: 'donations',
  admin: {
    useAsTitle: 'donationId',
    defaultColumns: [
      'donationId',
      'type',
      'sponsorshipCategory',
      'donorName',
      'email',
      'amountUsd',
      'conferenceTrack',
      'studentsSponsored',
      'paymentStatus',
      'createdAt',
    ],
    group: 'Conference',
    description: 'Donations and sponsorships received for SARSYC VI.',
  },
  access: {
    read: (args: any) => args.req?.user?.role === 'admin',
    create: () => true, // Created via API
    update: (args: any) => args.req?.user?.role === 'admin',
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'donationId',
      type: 'text',
      label: 'Donation / Sponsorship ID',
      required: true,
      unique: true,
      admin: { description: 'Auto-generated reference (e.g. SARSYC-DON-0001).' },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      required: true,
      options: [
        { label: 'Donation', value: 'donation' },
        { label: 'Sponsorship', value: 'sponsorship' },
      ],
    },
    {
      name: 'donorType',
      type: 'select',
      label: 'Donor Type',
      required: true,
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Organisation', value: 'organisation' },
      ],
    },
    {
      name: 'donorName',
      type: 'text',
      label: 'Donor / Organisation Name',
      admin: { description: 'Full name or organisation name.' },
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
    },
    {
      name: 'orgName',
      type: 'text',
      label: 'Organisation Name',
      admin: { condition: (data: any) => data.donorType === 'organisation' },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone (optional)',
    },
    {
      name: 'amountUsd',
      type: 'number',
      label: 'Amount (USD)',
      required: true,
      min: 1,
    },
    {
      name: 'currency',
      type: 'text',
      label: 'Currency',
      defaultValue: 'USD',
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message / Note',
    },
    {
      name: 'sponsorshipCategory',
      type: 'select',
      label: 'Sponsorship Category',
      options: [
        { label: 'Partnership package', value: 'package' },
        { label: 'Track sponsorship', value: 'track' },
      ],
      admin: {
        condition: (data: any) => data.type === 'sponsorship',
      },
    },
    {
      name: 'sponsorshipTierName',
      type: 'text',
      label: 'Sponsorship Tier',
      admin: {
        condition: (data: any) =>
          data.type === 'sponsorship' && data.sponsorshipCategory === 'package',
        description: 'Name of the sponsorship tier selected.',
      },
    },
    {
      name: 'sponsorshipTier',
      type: 'relationship',
      relationTo: 'sponsorship-tiers',
      label: 'Sponsorship Tier (linked)',
      admin: {
        condition: (data: any) =>
          data.type === 'sponsorship' && data.sponsorshipCategory === 'package',
      },
    },
    {
      name: 'conferenceTrack',
      type: 'select',
      label: 'Conference Track',
      options: [
        { label: 'Track 1: Education Rights and Equity', value: 'education-rights' },
        { label: 'Track 2: HIV/AIDS, STIs and Vulnerable Groups', value: 'hiv-aids' },
        { label: 'Track 3: Non-Communicable Diseases (NCDs) Prevention and Health Lifestyles', value: 'ncd-prevention' },
        { label: 'Track 4: Digital Health and Safety', value: 'digital-health' },
        { label: 'Track 5: Mental Health and Substance Abuse', value: 'mental-health' },
      ],
      admin: {
        condition: (data: any) =>
          data.type === 'sponsorship' && data.sponsorshipCategory === 'track',
      },
    },
    {
      name: 'trackSponsorshipMode',
      type: 'select',
      label: 'Track Sponsorship Mode',
      options: [
        { label: 'By number of students', value: 'students' },
        { label: 'Custom amount', value: 'custom_amount' },
      ],
      admin: {
        condition: (data: any) =>
          data.type === 'sponsorship' && data.sponsorshipCategory === 'track',
      },
    },
    {
      name: 'studentsSponsored',
      type: 'number',
      label: 'Students Sponsored',
      min: 0,
      admin: {
        condition: (data: any) =>
          data.type === 'sponsorship' &&
          data.sponsorshipCategory === 'track' &&
          data.trackSponsorshipMode === 'students',
      },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Payment Method',
      options: [
        { label: 'Card (Stanbic Hosted)', value: 'card' },
        { label: 'Bank Transfer', value: 'bank-transfer' },
      ],
      defaultValue: 'card',
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'Payment Status',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Bank Transfer (awaiting proof)', value: 'bank-transfer' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'stanbicPaymentOrderRef',
      type: 'text',
      label: 'Stanbic Order Reference',
      admin: { description: 'N-Genius order reference returned by the gateway.' },
    },
    {
      name: 'paymentConfirmedAt',
      type: 'date',
      label: 'Payment Confirmed At',
      admin: { description: 'Timestamp when payment was confirmed by the gateway.' },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: { description: 'Internal notes (not shown to donor).' },
    },
  ],
  timestamps: true,
}

export default Donations
