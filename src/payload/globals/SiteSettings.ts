import type { GlobalConfig } from 'payload/types'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Conference Information',
          fields: [
            {
              name: 'conferenceName',
              type: 'text',
              defaultValue: 'SARSYC VI',
              label: 'Conference Name',
            },
            {
              name: 'conferenceTheme',
              type: 'text',
              defaultValue: 'Align for Action: Sustaining Progress in Youth Health and Education',
              label: 'Conference Theme',
            },
            {
              name: 'conferenceDate',
              type: 'date',
              required: true,
              label: 'Conference Start Date',
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
            {
              name: 'conferenceEndDate',
              type: 'date',
              required: true,
              label: 'Conference End Date',
            },
            {
              name: 'conferenceLocation',
              type: 'text',
              defaultValue: 'Windhoek, Namibia',
              label: 'Conference Location',
            },
            {
              name: 'conferenceVenue',
              type: 'text',
              label: 'Conference Venue',
            },
          ],
        },
        {
          label: 'Registration Settings',
          fields: [
            {
              name: 'registrationOpen',
              type: 'checkbox',
              defaultValue: false,
              label: 'Registration Open',
            },
            {
              name: 'registrationOpenDate',
              type: 'date',
              label: 'Registration Opens',
            },
            {
              name: 'earlyBirdDeadline',
              type: 'date',
              label: 'Early Bird Deadline',
            },
            {
              name: 'registrationCloseDate',
              type: 'date',
              label: 'Registration Closes',
            },
          ],
        },
        {
          label: 'Abstract Submission',
          fields: [
            {
              name: 'abstractsOpen',
              type: 'checkbox',
              defaultValue: false,
              label: 'Abstract Submission Open',
            },
            {
              name: 'abstractDeadline',
              type: 'date',
              label: 'Abstract Submission Deadline',
            },
          ],
        },
        {
          label: 'Contact Information',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              required: true,
              label: 'Contact Email',
            },
            {
              name: 'contactPhone',
              type: 'text',
              label: 'Contact Phone',
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Physical Address',
            },
          ],
        },
        {
          label: 'Social Media',
          fields: [
            {
              name: 'facebook',
              type: 'text',
              label: 'Facebook URL',
            },
            {
              name: 'twitter',
              type: 'text',
              label: 'Twitter/X URL',
            },
            {
              name: 'instagram',
              type: 'text',
              label: 'Instagram URL',
            },
            {
              name: 'linkedin',
              type: 'text',
              label: 'LinkedIn URL',
            },
            {
              name: 'youtube',
              type: 'text',
              label: 'YouTube URL',
            },
          ],
        },
        {
          label: 'SEO & Analytics',
          fields: [
            {
              name: 'siteTitle',
              type: 'text',
              defaultValue: 'SARSYC VI - Southern African Regional Students and Youth Conference',
              label: 'Site Title',
            },
            {
              name: 'siteDescription',
              type: 'textarea',
              defaultValue: 'Join us for SARSYC VI in Windhoek, Namibia. The premier regional platform for youth health and education advocacy.',
              label: 'Site Description',
            },
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: 'Google Analytics ID',
              admin: {
                placeholder: 'G-XXXXXXXXXX',
              },
            },
          ],
        },
      ],
    },
  ],
}

export default SiteSettings



