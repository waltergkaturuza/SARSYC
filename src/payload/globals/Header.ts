import type { GlobalConfig } from 'payload/types'

const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header Navigation',
  access: {
    read: () => true,
    update: (args: any) => Boolean(args.req?.user),
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Site Logo',
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigation Items',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'link',
          type: 'text',
          required: true,
        },
        {
          name: 'subItems',
          type: 'array',
          label: 'Dropdown Items',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'link',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'ctaButton',
      type: 'group',
      label: 'Call-to-Action Button',
      fields: [
        {
          name: 'text',
          type: 'text',
          defaultValue: 'Register Now',
        },
        {
          name: 'link',
          type: 'text',
          defaultValue: '/participate/register',
        },
      ],
    },
  ],
}

export default Header


