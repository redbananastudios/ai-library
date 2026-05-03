# Marley Moves — final schema graph (reference)

What shipped on marleymoves.co.uk after the session-7 AEO/schema
sprint. This is the canonical example for the kit.

## Sprint sequence

| TASK | What changed | Why |
|---|---|---|
| 1 | Consolidated Org graph: deleted orphan `organizationSchema()` (#org-entity), merged trust signals onto canonical `localBusinessSchema()` at #organization | Two competing Organization nodes confused Google's entity selection |
| 2 | Person entity for Connor (owner) emitted globally from layout.tsx; jobTitle + knowsAbout added to Sanity author doc | E-E-A-T; #organization.founder ref needs Person to resolve on every page |
| 3a | Town `MovingCompany` duplicates → `Service` nodes (provider→#org, areaServed=City) | 16 LocalBusiness entities for one physical business — entity model was unworkable |
| 3b | BreadcrumbList: visible `<Breadcrumbs>` component now sole source; deleted `breadcrumbListSchema()` helper | Visible nav and structured-data breadcrumbs cannot drift — Google validates |
| 4 | BlogPosting on insights posts (`author` ref → #person, `publisher` ref → #organization) | Articles weren't appearing as rich results in SERPs |
| 5 | Service count reconciled (added specialist-removals to footer to match schema) | Schema enumerated 7 services, footer showed 6 — scaled-content red flag |
| 6 | Each visible review on /reviews emits its own `Review` JSON-LD with `itemReviewed: { @id: '#organization' }` | AggregateRating without backing Review entities looks unverifiable |
| 8 | Explicit AI crawler allows in robots.ts (GPTBot, ClaudeBot, etc.) | Signal intent; protect against bot default changes |

## Final emit shape

### `app/layout.tsx` (every page)

```tsx
{organizationSchema()}   // LocalBusiness #organization
{websiteSchema()}        // WebSite #website
{owner ? personSchema(owner) : null}  // Person #person (from Sanity)
```

### Home page (`app/page.tsx`)

No additional schema beyond the global emit. Removed earlier
`organizationSchema()` call from page (it was a duplicate of the
layout emit).

### Service page (`app/services/[slug]/page.tsx`)

```tsx
// Optional: deeper Service node specifically for this service
// (the per-area Service nodes on /areas/ pages cover the area mapping)
{faqs.length ? faqPageSchema(faqs) : null}
// BreadcrumbList comes from <Breadcrumbs> component
```

### Area page (`app/areas/[slug]/page.tsx`)

```tsx
{areaServiceSchema({
  serviceType: 'Removals',
  cityName: area.title,
  cityRegion: area.county,
  description: area.intro.slice(0, 200),
  url: `https://marleymoves.co.uk/removals/${area.slug}`,
})}
{faqs.length ? faqPageSchema(faqs) : null}
// BreadcrumbList from <Breadcrumbs>
```

### Insights post (`app/insights/[slug]/page.tsx`)

```tsx
{blogPostingSchema({
  url: `https://marleymoves.co.uk/insights/${post.slug}`,
  headline: post.title,
  description: post.excerpt,
  datePublished: post.publishedAt,
  dateModified: post._updatedAt,
  image: post.heroImage?.url,
  articleSection: post.articleSection,
  keywords: post.keywords,
})}
{post.faqs?.length ? faqPageSchema(post.faqs) : null}
```

### Reviews page (`app/reviews/page.tsx`)

```tsx
{reviews.map((r) => reviewSchema({
  authorName: r.authorName,
  rating: r.rating,
  body: r.body,
  datePublished: r.datePublished,
}))}
// Note: NO standalone aggregate LocalBusiness JSON-LD here.
// The global #organization already carries aggregateRating.
```

## Validator clean run after consolidation

After the sprint, the following all returned clean:
- Schema.org validator on home, /services/house-removals, /removals/shaftesbury, /insights/moving-house-checklist-uk
- Google Rich Results Test: BreadcrumbList, FAQPage, BlogPosting, LocalBusiness, AggregateRating, Person all detected
- No "duplicate entity" warnings
- No "broken @id reference" warnings

This is the bar the kit is calibrated to.
