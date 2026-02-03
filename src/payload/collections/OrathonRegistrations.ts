import type { CollectionConfig } from 'payload/types'
import { getCountryOptions } from '@/lib/countries'

const OrathonRegistrations: CollectionConfig = {
  slug: 'orathon-registrations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'status', 'createdAt'],
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
    {
      name: 'country',
      type: 'select',
      required: true,
      label: 'Country of Residence',
      options: getCountryOptions(),
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      label: 'City',
    },
    {
      name: 'emergencyContactName',
      type: 'text',
      required: true,
      label: 'Emergency Contact Name',
    },
    {
      name: 'emergencyContactPhone',
      type: 'text',
      required: true,
      label: 'Emergency Contact Phone',
    },
    {
      name: 'medicalConditions',
      type: 'textarea',
      label: 'Medical Conditions or Allergies',
      admin: {
        description: 'Please disclose any medical conditions or allergies that may affect your participation',
      },
    },
    {
      name: 'fitnessLevel',
      type: 'select',
      required: true,
      label: 'Fitness Level',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
    },
    {
      name: 'tshirtSize',
      type: 'select',
      required: true,
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: {
        position: 'sidebar',
        description: 'Internal notes about this registration',
      },
    },
  ],
  timestamps: true,
}

export default OrathonRegistrations
