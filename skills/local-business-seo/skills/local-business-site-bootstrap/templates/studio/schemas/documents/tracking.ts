import { defineType, defineField } from 'sanity'

export const tracking = defineType({
  name: 'tracking',
  title: 'Tracking & Analytics',
  type: 'document',
  fields: [
    defineField({ name: 'gtmId', title: 'Google Tag Manager ID', type: 'string', description: 'GTM-XXXXXXX' }),
    defineField({ name: 'ga4Id', title: 'GA4 Measurement ID', type: 'string', description: 'G-XXXXXXXXXX' }),
    defineField({ name: 'metaPixelId', title: 'Meta Pixel ID', type: 'string' }),
    defineField({ name: 'plausibleDomain', type: 'string', description: 'Optional — if Plausible alongside GA4.' }),
    defineField({ name: 'metaCapiAccessToken', title: 'Meta CAPI access token', type: 'string', description: 'Server-side conversions API. Sensitive.' }),
  ],
  preview: { prepare: () => ({ title: 'Tracking' }) },
})
