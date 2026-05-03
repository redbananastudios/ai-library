import { defineType, defineField } from 'sanity'

/**
 * Author = a Person. Used by the BlogPosting schema and (when isOwner=true)
 * by the global Person JSON-LD emit in app/layout.tsx for E-E-A-T.
 */
export const author = defineType({
  name: 'author',
  title: 'Author / Person',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'isOwner',
      type: 'boolean',
      initialValue: false,
      description: 'Mark TRUE for exactly one author — the business owner. Used for the global Person schema.',
    }),
    defineField({ name: 'jobTitle', type: 'string', description: 'e.g. "Owner", "Director", "Lead Plumber".' }),
    defineField({
      name: 'knowsAbout',
      type: 'array',
      of: [{ type: 'string' }],
      description: '3–8 areas of expertise (e.g. "airport transfers", "long-distance moves", "boiler installations").',
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }],
    }),
    defineField({ name: 'bio', type: 'text', rows: 4 }),
  ],
  preview: { select: { title: 'name', subtitle: 'jobTitle' } },
})
