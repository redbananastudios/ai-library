import { defineType, defineField } from 'sanity'

/**
 * area = a town / city / postcode area we serve.
 *
 * Validation enforces minimum content depth (the "remove location name" test
 * lives in the local-business-area-page-enricher skill, not here — but the
 * fields below are the structured data that recipe needs).
 */
export const area = defineType({
  name: 'area',
  title: 'Area / Town',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'displayLocation',
      type: 'string',
      description: 'Customer-facing format, e.g. "Shaftesbury, SP7". Used in copy.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'outwardPostcode',
      type: 'string',
      description: 'e.g. "SP7", "BA8". Used for SEO targeting and disambiguation.',
    }),
    defineField({ name: 'county', type: 'string' }),
    defineField({
      name: 'distanceFromBaseMiles',
      type: 'number',
      description: 'Drives "X miles from our yard" copy and ordering.',
    }),
    defineField({
      name: 'intro',
      type: 'text',
      rows: 4,
      description: 'Top-of-page intro. Min 150 words. Must include real local detail.',
      validation: (R) => R.required().min(150),
    }),
    defineField({
      name: 'body',
      title: 'Body content',
      type: 'array',
      of: [{ type: 'block' }],
      description:
        'Min 750 words to reach the 900–1050w target with intro. Cover routes/access, property types, indicative pricing, ≥1 earned local detail.',
    }),
    defineField({
      name: 'realRoadNames',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Min 3. Helps the area-page-enricher skill verify recipe compliance.',
    }),
    defineField({
      name: 'propertyTypes',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "Victorian terraces", "modern estate", "listed Georgian".',
    }),
    defineField({
      name: 'earnedDetails',
      type: 'array',
      of: [{ type: 'text', rows: 2 }],
      description:
        'Min 1. The detail that proves we\'ve actually been there — e.g. "the parking restrictions on the high street", "the steep drop into the cul-de-sac".',
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'faq' }] }],
      validation: (R) => R.min(4).max(6).warning('Aim for 4–6 town-specific FAQs.'),
    }),
    defineField({
      name: 'reviews',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'review' }] }],
      description: 'Reviews tied to this area (if any).',
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
