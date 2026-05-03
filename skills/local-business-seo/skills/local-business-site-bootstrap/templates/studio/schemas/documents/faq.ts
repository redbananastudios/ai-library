import { defineType, defineField } from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'question', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'answer', type: 'text', rows: 4, validation: (R) => R.required() }),
    defineField({ name: 'order', type: 'number' }),
    defineField({
      name: 'scope',
      type: 'string',
      options: {
        list: [
          { title: 'General (sitewide)', value: 'general' },
          { title: 'Service-specific', value: 'service' },
          { title: 'Area-specific', value: 'area' },
          { title: 'Pricing', value: 'pricing' },
        ],
      },
    }),
  ],
  preview: { select: { title: 'question', subtitle: 'scope' } },
})
