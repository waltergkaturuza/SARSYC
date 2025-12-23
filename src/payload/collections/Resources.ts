import type { CollectionConfig } from 'payload/types'

const Resources: CollectionConfig = {
  slug: 'resources',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'year', 'downloads', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: () => true, // Public can read
    create: (args: any) => Boolean(args.req?.user),
    update: (args: any) => Boolean(args.req?.user),
    delete: (args: any) => args.req?.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Resource Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'Auto-generated from title',
      },
      hooks: {
        beforeValidate: [
          (args: any) => {
            const { value, data } = args
            if (!value && data.title) {
              return data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Abstract/Description',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Resource File',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Resource Type',
      options: [
        { label: 'Conference Report', value: 'report' },
        { label: 'Research Paper', value: 'paper' },
        { label: 'Policy Brief', value: 'brief' },
        { label: 'Presentation', value: 'presentation' },
        { label: 'Toolkit', value: 'toolkit' },
        { label: 'Infographic', value: 'infographic' },
        { label: 'Video', value: 'video' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'topics',
      type: 'select',
      hasMany: true,
      label: 'Topics',
      options: [
        { label: 'Sexual & Reproductive Health', value: 'srh' },
        { label: 'Education', value: 'education' },
        { label: 'Advocacy', value: 'advocacy' },
        { label: 'Policy', value: 'policy' },
        { label: 'Innovation', value: 'innovation' },
        { label: 'Youth Empowerment', value: 'empowerment' },
        { label: 'Gender', value: 'gender' },
        { label: 'HIV/AIDS', value: 'hiv' },
        { label: 'Research', value: 'research' },
      ],
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      label: 'Year/Conference Edition',
      admin: {
        placeholder: '2026',
      },
    },
    {
      name: 'sarsycEdition',
      type: 'select',
      label: 'SARSYC Edition',
      options: [
        { label: 'SARSYC I (2014)', value: '1' },
        { label: 'SARSYC II (2016)', value: '2' },
        { label: 'SARSYC III (2018)', value: '3' },
        { label: 'SARSYC IV (2020)', value: '4' },
        { label: 'SARSYC V (2022)', value: '5' },
        { label: 'SARSYC VI (2026)', value: '6' },
        { label: 'Other/General', value: 'other' },
      ],
    },
    {
      name: 'authors',
      type: 'array',
      label: 'Authors',
      fields: [
        {
          name: 'author',
          type: 'text',
        },
      ],
    },
    {
      name: 'country',
      type: 'text',
      label: 'Country/Region',
    },
    {
      name: 'language',
      type: 'select',
      label: 'Language',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'French', value: 'fr' },
        { label: 'Portuguese', value: 'pt' },
      ],
    },
    {
      name: 'downloads',
      type: 'number',
      label: 'Download Count',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Auto-incremented on each download',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Feature on Resource Page',
      defaultValue: false,
    },
  ],
  timestamps: true,
}

export default Resources


