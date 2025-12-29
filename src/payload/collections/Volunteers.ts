import type { CollectionConfig } from 'payload/types'
import { getCountryOptions } from '@/lib/countries'
import { addAuditHooks } from '@/lib/auditHooks'

const Volunteers: CollectionConfig = {
  slug: 'volunteers',
  admin: {
    useAsTitle: 'volunteerId',
    defaultColumns: ['volunteerId', 'firstName', 'lastName', 'email', 'status', 'preferredRoles', 'createdAt'],
    group: 'Conference',
    description: 'Volunteer applications and management',
  },
  access: {
    read: (args: any) => {
      const { req: { user } } = args
      // Admins can read all, volunteers can read their own
      if (user?.role === 'admin') return true
      if (user?.role === 'volunteer') {
        // Volunteers can read their own application
        return {
          user: { equals: user.id },
        }
      }
      return false
    },
    create: () => true, // Public can apply
    update: (args: any) => {
      const { req: { user } } = args
      // Admins can update all, volunteers can update their own
      if (user?.role === 'admin') return true
      if (user?.role === 'volunteer') {
        return {
          user: { equals: user.id },
        }
      }
      return false
    },
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'volunteerId',
      type: 'text',
      label: 'Volunteer ID',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated unique identifier',
      },
      hooks: {
        beforeChange: [
          (args: any) => {
            const { value, operation } = args
            if (operation === 'create' && !value) {
              return `VOL-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
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
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Under Review', value: 'under-review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'On Hold', value: 'on-hold' },
        { label: 'Withdrawn', value: 'withdrawn' },
      ],
      admin: {
        description: 'Application status',
      },
    },
    // Personal Information
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
      label: 'Email Address',
      admin: {
        readOnly: ({ data }: any) => Boolean(data?.user),
      },
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Phone Number',
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      required: true,
      label: 'Date of Birth',
      admin: {
        description: 'Required for background checks and age verification',
      },
    },
    {
      name: 'gender',
      type: 'select',
      required: true,
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
      options: getCountryOptions(),
      label: 'Country of Residence',
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      label: 'City',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Full Address',
      admin: {
        description: 'Street address and postal code',
      },
    },
    // Education Background
    {
      name: 'education',
      type: 'array',
      label: 'Education Background',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'level',
          type: 'select',
          required: true,
          options: [
            { label: 'High School', value: 'high-school' },
            { label: 'Diploma', value: 'diploma' },
            { label: "Bachelor's Degree", value: 'bachelors' },
            { label: "Master's Degree", value: 'masters' },
            { label: 'PhD', value: 'phd' },
            { label: 'Professional Certificate', value: 'certificate' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'field',
          type: 'text',
          required: true,
          label: 'Field of Study',
        },
        {
          name: 'institution',
          type: 'text',
          required: true,
          label: 'Institution Name',
        },
        {
          name: 'year',
          type: 'number',
          required: true,
          label: 'Year Completed',
          admin: {
            description: 'Year of graduation or completion',
          },
        },
        {
          name: 'currentlyStudying',
          type: 'checkbox',
          defaultValue: false,
          label: 'Currently Studying',
        },
      ],
    },
    // Skills
    {
      name: 'skills',
      type: 'group',
      label: 'Skills & Competencies',
      fields: [
        {
          name: 'technical',
          type: 'array',
          label: 'Technical Skills',
          fields: [
            {
              name: 'skill',
              type: 'text',
              required: true,
            },
            {
              name: 'proficiency',
              type: 'select',
              required: true,
              options: [
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
                { label: 'Expert', value: 'expert' },
              ],
            },
          ],
        },
        {
          name: 'soft',
          type: 'array',
          label: 'Soft Skills',
          fields: [
            {
              name: 'skill',
              type: 'text',
              required: true,
            },
            {
              name: 'proficiency',
              type: 'select',
              required: true,
              options: [
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
                { label: 'Expert', value: 'expert' },
              ],
            },
          ],
        },
        {
          name: 'languages',
          type: 'array',
          label: 'Languages Spoken',
          required: true,
          minRows: 1,
          fields: [
            {
              name: 'language',
              type: 'text',
              required: true,
            },
            {
              name: 'proficiency',
              type: 'select',
              required: true,
              options: [
                { label: 'Basic', value: 'basic' },
                { label: 'Conversational', value: 'conversational' },
                { label: 'Fluent', value: 'fluent' },
                { label: 'Native', value: 'native' },
              ],
            },
          ],
        },
      ],
    },
    // Work Experience
    {
      name: 'workExperience',
      type: 'array',
      label: 'Work Experience',
      fields: [
        {
          name: 'position',
          type: 'text',
          required: true,
          label: 'Job Title',
        },
        {
          name: 'organization',
          type: 'text',
          required: true,
          label: 'Organization',
        },
        {
          name: 'startDate',
          type: 'date',
          required: true,
          label: 'Start Date',
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'End Date',
          admin: {
            description: 'Leave blank if currently employed',
          },
        },
        {
          name: 'currentlyWorking',
          type: 'checkbox',
          defaultValue: false,
          label: 'Currently Working Here',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Job Description',
        },
      ],
    },
    // Volunteer Experience
    {
      name: 'volunteerExperience',
      type: 'array',
      label: 'Previous Volunteer Experience',
      fields: [
        {
          name: 'organization',
          type: 'text',
          required: true,
          label: 'Organization/Event',
        },
        {
          name: 'role',
          type: 'text',
          required: true,
          label: 'Volunteer Role',
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          label: 'Date',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description of Responsibilities',
        },
      ],
    },
    // Volunteer Preferences
    {
      name: 'preferredRoles',
      type: 'array',
      label: 'Preferred Volunteer Roles',
      required: true,
      minRows: 1,
      options: [
        { label: 'Registration Desk', value: 'registration' },
        { label: 'Logistics Support', value: 'logistics' },
        { label: 'Social Media', value: 'social-media' },
        { label: 'Hospitality', value: 'hospitality' },
        { label: 'Technical Support', value: 'technical' },
        { label: 'Translation/Interpretation', value: 'translation' },
        { label: 'Photography/Videography', value: 'photography' },
        { label: 'Session Moderator', value: 'moderator' },
        { label: 'Exhibition Support', value: 'exhibition' },
        { label: 'Transportation', value: 'transportation' },
      ],
    },
    {
      name: 'availability',
      type: 'group',
      label: 'Availability',
      fields: [
        {
          name: 'days',
          type: 'array',
          label: 'Available Days',
          required: true,
          minRows: 1,
          options: [
            { label: 'August 4 (Setup Day)', value: 'aug-4' },
            { label: 'August 5 (Day 1)', value: 'aug-5' },
            { label: 'August 6 (Day 2)', value: 'aug-6' },
            { label: 'August 7 (Day 3)', value: 'aug-7' },
            { label: 'August 8 (Cleanup)', value: 'aug-8' },
          ],
        },
        {
          name: 'timePreference',
          type: 'select',
          label: 'Time Preference',
          options: [
            { label: 'Morning (8 AM - 12 PM)', value: 'morning' },
            { label: 'Afternoon (12 PM - 5 PM)', value: 'afternoon' },
            { label: 'Evening (5 PM - 9 PM)', value: 'evening' },
            { label: 'Full Day', value: 'full-day' },
            { label: 'Flexible', value: 'flexible' },
          ],
        },
        {
          name: 'hoursAvailable',
          type: 'number',
          label: 'Total Hours Available',
          admin: {
            description: 'Total number of hours you can volunteer',
          },
        },
      ],
    },
    // Additional Information
    {
      name: 'motivation',
      type: 'textarea',
      required: true,
      label: 'Motivation Statement',
      admin: {
        description: 'Why do you want to volunteer at SARSYC VI?',
      },
    },
    {
      name: 'specialSkills',
      type: 'textarea',
      label: 'Special Skills or Qualifications',
      admin: {
        description: 'Any additional skills, certifications, or qualifications relevant to volunteering',
      },
    },
    {
      name: 'specialAccommodations',
      type: 'textarea',
      label: 'Special Accommodations Needed',
      admin: {
        description: 'Any accommodations needed to perform volunteer duties (accessibility, dietary, etc.)',
      },
    },
    // References
    {
      name: 'references',
      type: 'array',
      label: 'References',
      minRows: 2,
      maxRows: 3,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Full Name',
        },
        {
          name: 'relationship',
          type: 'text',
          required: true,
          label: 'Relationship',
          admin: {
            description: 'e.g., Former Employer, Professor, Colleague',
          },
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Email',
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: 'Phone Number',
        },
        {
          name: 'organization',
          type: 'text',
          label: 'Organization',
        },
      ],
    },
    // Emergency Contact
    {
      name: 'emergencyContact',
      type: 'group',
      required: true,
      label: 'Emergency Contact',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Full Name',
        },
        {
          name: 'relationship',
          type: 'text',
          required: true,
          label: 'Relationship',
        },
        {
          name: 'phone',
          type: 'text',
          required: true,
          label: 'Phone Number',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
        },
      ],
    },
    // Documents
    {
      name: 'cv',
      type: 'upload',
      relationTo: 'media',
      label: 'CV/Resume',
      admin: {
        description: 'Upload your CV or resume (PDF preferred)',
      },
    },
    {
      name: 'coverLetter',
      type: 'upload',
      relationTo: 'media',
      label: 'Cover Letter (Optional)',
    },
    // Consent & Agreements
    {
      name: 'consents',
      type: 'group',
      label: 'Consents & Agreements',
      fields: [
        {
          name: 'backgroundCheck',
          type: 'checkbox',
          required: true,
          defaultValue: false,
          label: 'I consent to a background check',
          admin: {
            description: 'Required for all volunteers',
          },
        },
        {
          name: 'photoRelease',
          type: 'checkbox',
          required: true,
          defaultValue: false,
          label: 'I consent to photos/videos being taken during my volunteer service',
        },
        {
          name: 'dataProcessing',
          type: 'checkbox',
          required: true,
          defaultValue: false,
          label: 'I consent to the processing of my personal data for volunteer management purposes',
        },
        {
          name: 'termsAccepted',
          type: 'checkbox',
          required: true,
          defaultValue: false,
          label: 'I accept the volunteer terms and conditions',
        },
      ],
    },
    // Admin Fields
    {
      name: 'adminNotes',
      type: 'textarea',
      label: 'Admin Notes',
      admin: {
        description: 'Internal notes for screening and vetting',
        position: 'sidebar',
      },
    },
    {
      name: 'reviewerComments',
      type: 'textarea',
      label: 'Reviewer Comments',
      admin: {
        description: 'Comments for the applicant',
        position: 'sidebar',
      },
    },
    {
      name: 'assignedReviewer',
      type: 'relationship',
      relationTo: 'users',
      label: 'Assigned Reviewer',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'interviewDate',
      type: 'date',
      label: 'Interview Date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'interviewNotes',
      type: 'textarea',
      label: 'Interview Notes',
      admin: {
        position: 'sidebar',
      },
    },
    // User Relationship
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Associated User Account',
      admin: {
        readOnly: true,
        description: 'User account linked to this volunteer profile for login and management.',
      },
      unique: true,
    },
  ],
  timestamps: true,
}

// Add audit hooks
export default addAuditHooks(Volunteers)

