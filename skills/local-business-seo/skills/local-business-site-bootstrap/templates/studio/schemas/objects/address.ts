import { defineType, defineField } from 'sanity'

export const address = defineType({
  name: 'address',
  title: 'Address',
  type: 'object',
  description:
    'Used in JSON-LD PostalAddress only. Customer-facing components use the recognised "town, outward postcode" format from siteSettings.displayAddress.',
  fields: [
    defineField({ name: 'streetAddress', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'addressLocality', title: 'Town/City', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'addressRegion', title: 'County/Region', type: 'string' }),
    defineField({ name: 'postalCode', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'addressCountry', type: 'string', initialValue: 'GB' }),
  ],
})
