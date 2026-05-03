import { defineType, defineField } from 'sanity'

export const socialLinks = defineType({
  name: 'socialLinks',
  title: 'Social links',
  type: 'object',
  fields: [
    defineField({ name: 'facebook', type: 'url' }),
    defineField({ name: 'instagram', type: 'url' }),
    defineField({ name: 'trustpilot', type: 'url' }),
    defineField({ name: 'googleBusinessProfile', title: 'Google Business Profile URL', type: 'url' }),
    defineField({ name: 'gbpPlaceId', title: 'GBP Place ID', type: 'string', description: 'Populate after GBP claimed — used for review URL deep links.' }),
  ],
})
