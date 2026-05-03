---
name: local-business-schema-graph
description: Use when building or fixing JSON-LD on a local service business website. Implements the consolidated graph pattern that survived Marley's audits — single Organization node, Person entity for owner emitted globally for E-E-A-T, Service nodes per area (NOT duplicate LocalBusiness per town), Review entities backing AggregateRating, BreadcrumbList from visible nav as single source of truth, BlogPosting with author ref → #person + publisher ref → #organization. Catches and fixes the duplicate-Organization-node bug, the BreadcrumbList drift bug, and the orphan-AggregateRating bug.
---

# local-business-schema-graph

The schema graph that the Marley audit settled on. Single Organization,
Person globally for E-E-A-T, Service-per-area not duplicate
LocalBusiness, Reviews backing AggregateRating, BreadcrumbList from
visible nav.

## When to use this

- Setting up JSON-LD for the first time on a project
- Auditing existing JSON-LD (Schema.org validator failing, Rich Results
  test reporting issues, Google Search Console flagging mismatches)
- Adding a new entity type (BlogPosting, FAQPage, Service)
- Migrating from per-page LocalBusiness emits to a single Org node

## The graph (canonical shape)

```
                  ┌──────────────────┐
                  │  WebSite         │
                  │  (#website)      │
                  │  publisher ──────┐
                  └──────────────────┘
                                     │
   ┌────────────────────┐      ┌─────▼─────────────────┐
   │  Person            │◄─────│  Organization /        │
   │  (#person)         │      │  LocalBusiness         │
   │  owner / founder   │      │  (#organization)       │
   │  jobTitle,         │      │  + AggregateRating     │
   │  knowsAbout,       │      │  + identifier (CH no)  │
   │  image             │      │  + sameAs (social)     │
   │  worksFor → ───────┼─────►│                        │
   └────────────────────┘      └────────┬───────────────┘
                                        │
              ┌─────────────────────────┼─────────────────┐
              │                         │                 │
       ┌──────▼──────┐         ┌────────▼──────┐  ┌───────▼──────┐
       │  Service    │         │  Review       │  │  BlogPosting │
       │  (per area) │         │  (per visible │  │  (per post)  │
       │  provider → │         │   review)     │  │  author →    │
       │  areaServed │         │  itemReviewed │  │  publisher → │
       └─────────────┘         └───────────────┘  └──────────────┘

Page templates emit BreadcrumbList (from <Breadcrumbs> visible component)
and FAQPage (when inline FAQs present) — both reference the page itself,
not the graph.
```

## The 6 invariants

1. **Exactly one `#organization`** — the LocalBusiness/Organization
   node, emitted from `app/layout.tsx` so it's on every page.
2. **Exactly one `#person`** — the owner, emitted from `app/layout.tsx`,
   `worksFor` references `#organization`. **Required** for the
   `Organization.founder` ref to resolve on every page.
3. **Service nodes per area, not LocalBusiness** — area pages emit
   `Service` with `provider: { @id: '#organization' }` and `areaServed:
   { @type: City, name: ... }`. Never `MovingCompany` or
   `LocalBusiness` with `name: 'Brand in Town'`.
4. **AggregateRating only when backed by Reviews** — if you publish
   `aggregateRating` on `#organization`, you must also emit at least
   3–5 `Review` JSON-LD nodes (the visible `/reviews` page is the
   right place; emit one per review shown).
5. **BreadcrumbList from visible nav** — only the `<Breadcrumbs>`
   component emits BreadcrumbList. Page templates do NOT call a
   separate `breadcrumbListSchema()` helper.
6. **BlogPosting refs Person + Organization by `@id`**, doesn't
   re-emit them inline. The global emit in layout already provides
   the targets.

## Implementation

The kit's bootstrap installs `lib/schema/jsonld.tsx` with all the
helpers you need. Quick reference:

| Helper | Where it's emitted | What it needs |
|---|---|---|
| `organizationSchema()` | `app/layout.tsx` (global) | siteConfig only |
| `personSchema(owner)` | `app/layout.tsx` (global) | owner from Sanity author doc with isOwner=true |
| `websiteSchema()` | `app/layout.tsx` (global) | siteConfig only |
| `areaServiceSchema({...})` | `app/areas/[slug]/page.tsx` | per-area facts |
| `reviewSchema(review)` | `app/reviews/page.tsx` (one per review) | per-review fields |
| `blogPostingSchema({...})` | `app/insights/[slug]/page.tsx` | per-post facts |
| `faqPageSchema(faqs)` | any page with inline FAQs | array of {question, answer} |

`<Breadcrumbs>` emits its own BreadcrumbList — no helper needed.

## Common bugs and how to fix

### Bug: "Duplicate Organization entity in the graph"
**Cause**: a separate `organizationSchema()` was called on the home
page in addition to the global emit, OR a per-area page emits its own
`LocalBusiness` instead of `Service`.
**Fix**: only call `organizationSchema()` from `app/layout.tsx`. For
area pages, switch to `areaServiceSchema()`.

### Bug: "BreadcrumbList doesn't match the page's visible breadcrumbs"
**Cause**: page template calls `breadcrumbListSchema()` AND the
`<Breadcrumbs>` component renders. They drift.
**Fix**: delete the per-page `breadcrumbListSchema()` call. Let
`<Breadcrumbs>` be the only source.

### Bug: "AggregateRating without Review entities"
**Cause**: `siteConfig.googleReviews.count` is set, so
`organizationSchema()` emits `aggregateRating`, but the `/reviews`
page doesn't emit individual `Review` nodes.
**Fix**: on the `/reviews` page, map the visible reviews and emit
one `reviewSchema()` per review.

### Bug: "Person ref `#person` doesn't resolve"
**Cause**: the owner author doc isn't marked `isOwner: true` in
Sanity, so the GROQ query returns null and the Person emit is
skipped.
**Fix**: in Sanity Studio, open the owner's author doc and tick
`isOwner`. Refresh.

### Bug: "Brand suffix appearing twice in browser tab title"
**Cause**: a Sanity editor typed "X | Brand" into `seo.title`, and
the layout's metadata template appended " | Brand" again.
**Fix**: in the page template, run `stripBrandSuffix(post.seo.title)`
before passing to `metadata.title`.

## Validation steps before declaring done

1. Schema.org validator: https://validator.schema.org — paste a page URL.
2. Google Rich Results Test: https://search.google.com/test/rich-results
3. Spot-check on 3 page types: home, one area, one insights post.
4. Verify `#organization`, `#person`, `#website` resolve (no
   "@id without matching node" warnings).

## See `references/marley-schema-graph-final.md` for the exact
final shape that shipped on Marley Moves, including the
sequence of audits and fixes.
