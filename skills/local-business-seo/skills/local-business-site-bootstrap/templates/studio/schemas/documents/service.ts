import { defineType, defineField } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'order', type: 'number', description: 'Display order in nav/grids.' }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 3,
      description: 'One-paragraph summary for service grid + llms.txt.',
      validation: (R) => R.required().max(500),
    }),
    defineField({ name: 'icon', type: 'string', description: 'Phosphor icon name, optional.' }),
    defineField({
      name: 'whatsIncluded',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bullet list — what the customer gets.',
    }),
    defineField({
      name: 'whoItsFor',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Customer types / use cases.',
    }),
    defineField({
      name: 'processSteps',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'detail', type: 'text', rows: 2 },
          ],
        },
      ],
    }),
    defineField({
      name: 'pricingTiers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'priceFrom', type: 'string', description: 'e.g. "£35" or "from £200" — never "£/hr" if hourly is hidden by policy.' },
            { name: 'includes', type: 'text', rows: 2 },
          ],
        },
      ],
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Long-form body. Aim for 1,500w+ on flagship services.',
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'faq' }] }],
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', validation: (R) => R.required() }],
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
})
