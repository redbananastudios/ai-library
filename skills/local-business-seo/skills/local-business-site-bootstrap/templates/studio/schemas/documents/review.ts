import { defineType, defineField } from 'sanity'

export const review = defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({ name: 'authorName', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'rating',
      type: 'number',
      validation: (R) => R.required().min(1).max(5),
      initialValue: 5,
    }),
    defineField({ name: 'body', type: 'text', rows: 4, validation: (R) => R.required() }),
    defineField({ name: 'datePublished', type: 'date' }),
    defineField({
      name: 'source',
      type: 'string',
      options: {
        list: ['Google', 'Trustpilot', 'Checkatrade', 'Yell', 'Facebook', 'Direct'],
      },
      initialValue: 'Google',
    }),
    defineField({
      name: 'service',
      type: 'reference',
      to: [{ type: 'service' }],
      description: 'Optional — if the review is about one specific service.',
    }),
    defineField({
      name: 'area',
      type: 'reference',
      to: [{ type: 'area' }],
      description: 'Optional — if from a customer in a specific area.',
    }),
  ],
  preview: { select: { title: 'authorName', subtitle: 'body' } },
})
