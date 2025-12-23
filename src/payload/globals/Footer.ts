import type { GlobalConfig } from 'payload/types'

const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
    update: (args: any) => Boolean(args.req?.user),
  },
  fields: [
    {
      name: 'description',
      type: 'textarea',
      label: 'About Text',
      defaultValue: 'SARSYC is the premier regional platform for students and youth working on reproductive health advocacy in Southern Africa.',
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Footer Columns',
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      defaultValue: '© 2026 SAYWHAT. All rights reserved.',
      label: 'Copyright Text',
    },
  ],
}

export default Footer


