import { defineType, defineField } from 'sanity'

export const nav = defineType({
  name: 'nav',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'primary',
      title: 'Primary nav items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string' },
            { name: 'href', type: 'string' },
            { name: 'children', type: 'array', of: [{ type: 'object', fields: [{ name: 'label', type: 'string' }, { name: 'href', type: 'string' }] }] },
          ],
        },
      ],
    }),
    defineField({
      name: 'footerSections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'heading', type: 'string' },
            { name: 'items', type: 'array', of: [{ type: 'object', fields: [{ name: 'label', type: 'string' }, { name: 'href', type: 'string' }] }] },
          ],
        },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Navigation' }) },
})
