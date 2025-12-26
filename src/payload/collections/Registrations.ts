import type { CollectionConfig } from 'payload/types'
import { getCountryOptions } from '@/lib/countries'

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
          name: 'dateOfBirth',
          type: 'date',
          required: true,
          label: 'Date of Birth',
        },
        {
          name: 'gender',
          type: 'select',
          required: true,
          label: 'Gender',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
            { label: 'Prefer not to say', value: 'prefer-not-to-say' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'country',
          type: 'select',
          required: true,
          label: 'Country of Residence',
          options: getCountryOptions(),
        },
        {
          name: 'nationality',
          type: 'select',
          required: true,
          label: 'Nationality',
          options: getCountryOptions(),
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
          label: 'City',
        },
        {
          name: 'address',
          type: 'textarea',
          required: true,
          label: 'Full Address',
          admin: {
            description: 'Street address, postal code, etc.',
          },
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
          label: 'Organization/Institution',
        },
        {
          name: 'organizationPosition',
          type: 'text',
          label: 'Position/Title',
        },
      ],
    },
    {
      name: 'isInternational',
      type: 'checkbox',
      label: 'International Attendee',
      admin: {
        description: 'Check if you are from outside the host country',
      },
      defaultValue: false,
    },
    {
      name: 'passportNumber',
      type: 'text',
      label: 'Passport Number',
      required: true,
      admin: {
        condition: (data: any) => data.isInternational === true,
        description: 'As shown on your passport',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'passportExpiry',
          type: 'date',
          label: 'Passport Expiration Date',
          required: true,
          admin: {
            condition: (data: any) => data.isInternational === true,
            description: 'Must be valid for at least 6 months after conference end date',
          },
        },
        {
          name: 'passportIssuingCountry',
          type: 'select',
          label: 'Passport Issuing Country',
          required: true,
          options: getCountryOptions(),
          admin: {
            condition: (data: any) => data.isInternational === true,
          },
        },
      ],
    },
    {
      name: 'passportScan',
      type: 'upload',
      relationTo: 'media',
      label: 'Passport Scan/Copy',
      required: false, // Made optional temporarily - will be required once storage adapter is configured
      admin: {
        condition: (data: any) => data.isInternational === true,
        description: 'Upload a clear scan or photo of your passport bio page (required for visa processing). Accepted formats: PDF, JPG, PNG. Max size: 5MB. Note: File uploads require storage adapter configuration on Vercel.',
      },
    },
    {
      name: 'visaRequired',
      type: 'checkbox',
      label: 'Visa Required',
      admin: {
        condition: (data: any) => data.isInternational === true,
      },
      defaultValue: true,
    },
    {
      name: 'visaStatus',
      type: 'select',
      label: 'Visa Status',
      options: [
        { label: 'Not Applied', value: 'not-applied' },
        { label: 'Applied - Pending', value: 'applied-pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Denied', value: 'denied' },
      ],
      admin: {
        condition: (data: any) => data.isInternational === true && data.visaRequired === true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'visaApplicationDate',
          type: 'date',
          label: 'Visa Application Date',
          admin: {
            condition: (data: any) => data.isInternational === true && data.visaRequired === true,
          },
        },
        {
          name: 'visaNumber',
          type: 'text',
          label: 'Visa Number',
          admin: {
            condition: (data: any) => data.isInternational === true && data.visaRequired === true && data.visaStatus === 'approved',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'nationalIdNumber',
          type: 'text',
          label: 'National ID Number',
          admin: {
            condition: (data: any) => data.isInternational === false,
          },
        },
        {
          name: 'nationalIdType',
          type: 'select',
          label: 'ID Type',
          options: [
            { label: 'National ID', value: 'national-id' },
            { label: 'Driver\'s License', value: 'drivers-license' },
            { label: 'Other Government ID', value: 'other' },
          ],
          admin: {
            condition: (data: any) => data.isInternational === false,
          },
        },
      ],
    },
    {
      name: 'emergencyContactName',
      type: 'text',
      required: true,
      label: 'Next of Kin - Full Name',
      admin: {
        description: 'Full legal name of next of kin or emergency contact',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'emergencyContactRelationship',
          type: 'select',
          required: true,
          label: 'Relationship to You',
          options: [
            { label: 'Spouse/Partner', value: 'spouse-partner' },
            { label: 'Parent', value: 'parent' },
            { label: 'Sibling', value: 'sibling' },
            { label: 'Child', value: 'child' },
            { label: 'Other Relative', value: 'other-relative' },
            { label: 'Friend', value: 'friend' },
            { label: 'Colleague', value: 'colleague' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'emergencyContactPhone',
          type: 'text',
          required: true,
          label: 'Phone Number',
          admin: {
            description: 'Include country code (e.g., +263 77 123 4567)',
          },
        },
      ],
    },
    {
      name: 'emergencyContactEmail',
      type: 'email',
      required: true,
      label: 'Email Address',
    },
    {
      name: 'emergencyContactAddress',
      type: 'textarea',
      required: true,
      label: 'Full Home Address',
      admin: {
        description: 'Complete home address including street, city, state/province, postal code, and country',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'emergencyContactCountry',
          type: 'select',
          required: true,
          label: 'Country',
          options: getCountryOptions(),
        },
        {
          name: 'emergencyContactCity',
          type: 'text',
          required: true,
          label: 'City',
        },
      ],
    },
    {
      name: 'emergencyContactPostalCode',
      type: 'text',
      label: 'Postal/ZIP Code',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'arrivalDate',
          type: 'date',
          label: 'Expected Arrival Date',
        },
        {
          name: 'departureDate',
          type: 'date',
          label: 'Expected Departure Date',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'flightNumber',
          type: 'text',
          label: 'Flight Number (if known)',
        },
        {
          name: 'travelInsuranceProvider',
          type: 'text',
          label: 'Travel Insurance Provider',
          admin: {
            condition: (data: any) => data.isInternational === true,
            description: 'Name of your travel insurance company',
          },
        },
      ],
    },
    {
      name: 'travelInsurancePolicyNumber',
      type: 'text',
      label: 'Travel Insurance Policy Number',
      admin: {
        condition: (data: any) => data.isInternational === true,
      },
    },
    {
      name: 'travelInsuranceExpiry',
      type: 'date',
      label: 'Travel Insurance Expiry Date',
      admin: {
        condition: (data: any) => data.isInternational === true,
        description: 'Must be valid for the duration of your stay',
      },
    },
    {
      name: 'visaInvitationLetterRequired',
      type: 'checkbox',
      label: 'Requires Visa Invitation Letter',
      defaultValue: true,
      admin: {
        condition: (data: any) => data.isInternational === true,
        description: 'Check if you need an official invitation letter for visa application',
      },
    },
    {
      name: 'accommodationRequired',
      type: 'checkbox',
      label: 'Requires Accommodation Assistance',
      defaultValue: false,
    },
    {
      name: 'accommodationPreferences',
      type: 'textarea',
      label: 'Accommodation Preferences/Requirements',
      admin: {
        condition: (data: any) => data.accommodationRequired === true,
      },
    },
    {
      name: 'hasHealthInsurance',
      type: 'checkbox',
      label: 'Has Travel/Health Insurance',
      defaultValue: false,
      admin: {
        description: 'Required for international attendees. Must cover medical expenses and emergency evacuation.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'insuranceProvider',
          type: 'text',
          label: 'Insurance Provider',
          admin: {
            condition: (data: any) => data.hasHealthInsurance === true,
          },
        },
        {
          name: 'insurancePolicyNumber',
          type: 'text',
          label: 'Policy Number',
          admin: {
            condition: (data: any) => data.hasHealthInsurance === true,
          },
        },
      ],
    },
    {
      name: 'medicalConditions',
      type: 'textarea',
      label: 'Medical Conditions or Allergies (optional)',
    },
    {
      name: 'bloodType',
      type: 'select',
      label: 'Blood Type (optional)',
      options: [
        { label: 'A+', value: 'a-positive' },
        { label: 'A-', value: 'a-negative' },
        { label: 'B+', value: 'b-positive' },
        { label: 'B-', value: 'b-negative' },
        { label: 'AB+', value: 'ab-positive' },
        { label: 'AB-', value: 'ab-negative' },
        { label: 'O+', value: 'o-positive' },
        { label: 'O-', value: 'o-negative' },
        { label: 'Unknown', value: 'unknown' },
      ],
    },
    {
      name: 'securityCheckStatus',
      type: 'select',
      label: 'Security Check Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Cleared', value: 'cleared' },
        { label: 'Flagged', value: 'flagged' },
      ],
      defaultValue: 'pending',
      access: {
        create: () => false,
        read: (args: any) => Boolean(args.req?.user),
        update: (args: any) => args.req?.user?.role === 'admin',
      },
    },
    {
      name: 'securityCheckNotes',
      type: 'textarea',
      label: 'Security Check Notes',
      access: {
        create: () => false,
        read: (args: any) => Boolean(args.req?.user),
        update: (args: any) => args.req?.user?.role === 'admin',
      },
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






