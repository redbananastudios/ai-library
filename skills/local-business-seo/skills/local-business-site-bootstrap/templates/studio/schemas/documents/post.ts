import { defineType, defineField } from 'sanity'

/**
 * Blog post / insights article. Renders BlogPosting JSON-LD with author
 * ref → #person and publisher ref → #organization.
 */
export const post = defineType({
  name: 'post',
  title: 'Insights post',
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
      name: 'status',
      type: 'string',
      options: { list: ['draft', 'published'], layout: 'radio' },
      initialValue: 'draft',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      validation: (R) =>
        R.custom((v, ctx) => {
          const status = (ctx.document as { status?: string } | null)?.status
          if (status === 'published' && !v) return 'Published posts need publishedAt'
          return true
        }),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      validation: (R) => R.required().max(300),
    }),
    defineField({ name: 'category', type: 'reference', to: [{ type: 'category' }] }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'articleSection',
      type: 'string',
      description: 'JSON-LD articleSection — high-level topic (e.g. "Moving Tips", "Local Guides").',
    }),
    defineField({
      name: 'keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'JSON-LD keywords. Pick 5–10 specific phrases.',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', validation: (R) => R.required() }],
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string' }] }],
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'faq' }] }],
      description: 'Optional inline FAQs — render FAQPage JSON-LD if any.',
    }),
    defineField({ name: 'seo', type: 'seo' }),
  ],
})
