import { defineType, defineField } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      description: 'Meta title (do NOT include the brand suffix — added automatically).',
      validation: (R) => R.max(70).warning('Aim for ≤70 characters.'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (R) => R.max(170).warning('Aim for ≤170 characters.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image (1200×630)',
      type: 'image',
    }),
    defineField({
      name: 'noindex',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
