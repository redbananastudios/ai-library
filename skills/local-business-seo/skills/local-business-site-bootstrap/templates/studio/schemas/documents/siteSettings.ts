import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — controlled in sanity.config.ts structure builder
  fields: [
    defineField({ name: 'brandName', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'legalName', type: 'string' }),
    defineField({ name: 'companyNumber', type: 'string' }),
    defineField({ name: 'foundingYear', type: 'number', description: 'Only set if you can prove it (Companies House etc).' }),
    defineField({ name: 'primaryPhone', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'secondaryPhone', type: 'string' }),
    defineField({ name: 'whatsapp', type: 'string' }),
    defineField({ name: 'email', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'displayAddress',
      type: 'string',
      description: 'CUSTOMER-FACING — recognised town + outward postcode (e.g. "Shaftesbury, SP7"). NEVER full street.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'primaryAddress',
      title: 'Primary registered address (JSON-LD only)',
      type: 'address',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'secondaryAddress', title: 'Secondary base (JSON-LD only)', type: 'address' }),
    defineField({ name: 'socialLinks', type: 'socialLinks' }),
    defineField({
      name: 'reviewCount',
      type: 'number',
      description: 'SSOT — feeds JSON-LD AND visible copy. Update this when count grows.',
      initialValue: 0,
    }),
    defineField({
      name: 'reviewRating',
      type: 'number',
      initialValue: 5.0,
      validation: (R) => R.min(0).max(5),
    }),
    defineField({ name: 'publicLiabilityCover', type: 'string', description: 'e.g. "£2,500,000". Only set if held.' }),
    defineField({ name: 'goodsInTransitCover', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
})
