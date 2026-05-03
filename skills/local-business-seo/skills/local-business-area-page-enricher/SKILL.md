---
name: local-business-area-page-enricher
description: Use when writing or auditing area/town/city pages on a local service business website. Enforces the 900–1050 word recipe with real local detail (≥3 named road names, outward + first-half postcodes, distance from base, property types, routes/access, indicative pricing, ≥1 earned local detail, 4–6 location-specific FAQs). Includes the "remove location name" test — if you can't tell which town the page is about with the location name removed, the page is templated and must be rewritten. Pairs with local-business-schema-graph for the per-area Service JSON-LD emit.
---

# local-business-area-page-enricher

The Marley town-page recipe — 900–1050 words of locally-anchored copy
that survives Google's Helpful Content scrutiny and answers what a real
customer in that town would ask.

## When to use this

- Writing a new `/areas/<town>/` page (or whatever the area URL pattern
  is on the project)
- Auditing existing area pages for templated boilerplate
- Adding a new town to an established service-area

## The recipe — 8 required elements

Every area page must include all 8. If any one is missing, the page
fails the recipe and reads as templated.

1. **≥3 named real road names** — actual streets in that town, not
   "the high street" or "the town centre". Cite at least 3.
2. **Outward postcode + at least one full postcode** — e.g. "SP7" plus
   one full postcode like "SP7 9PX" so the page anchors to the place.
3. **Distance from base** — "12 miles from our Shaftesbury yard along
   the A30" or similar. Gives Google an entity relationship.
4. **Property types** — what dominates the housing stock here?
   "Victorian terraces", "modern Persimmon estates", "stone-built
   cottages", "Georgian townhouses", "agricultural conversions".
5. **Routes/access** — how do you actually get there from base?
   "A303 then A350 down" — name the roads. Bonus: parking
   restrictions, narrow lanes, pedestrianised zones.
6. **Indicative pricing** — at minimum "from £X" or "typical move
   £Y–£Z". Honest hedge bands are fine. No prices = page reads
   like a brochure.
7. **≥1 earned detail** — the thing that proves we've actually been
   there. "The bin lorry can't fit down Castle Hill so we transfer
   to a smaller van", "the Co-op car park is the only loading
   option for the Market Place flats", "the listed-building
   restrictions on the High Street mean no exterior signage when
   you're loading". One specific operational nugget.
8. **4–6 location-specific FAQs** — generic FAQs ("how much does it
   cost?") don't count. Town-specific: "how do you handle the
   pedestrianised zone in Shaftesbury town centre?", "what about
   parking on Castle Hill?".

## The "remove location name" test

Take your draft. Do a find-and-replace: replace every instance of the
town/city name with `[TOWN]`. Read it back.

**Pass**: a reader can still identify the town from the road names,
postcodes, property types, route descriptions, earned details.

**Fail**: the page works for any town. Throw it out, rewrite from
operator-supplied facts.

Marley shipped this test as `web/scripts/audit-town-content-vs-shaftesbury-bar.mjs`
which walks every town's content file and scores it 0–8. Anything
under 8 is on the to-fix list.

## Word count target: 900–1050

- Under 800: not enough specificity
- 1050–1200: acceptable
- Over 1200: probably padding — tighten

The body content (long-form prose) should be ~600–750w; the intro
~150–200w; FAQs add the rest.

## Process

### 1. Get the facts from the operator

If you don't have the 8 required elements, ask once. Don't make them
up. Sample question:

> For [TOWN], can you give me:
> - 3+ road names you've worked on or know well?
> - any operational quirks (parking, access, listed buildings, narrow
>   lanes)?
> - what kind of properties are typical?
> - typical job size + price range?
> - 4–6 questions customers in [TOWN] specifically ask you?

### 2. Draft the body

Structure (suggested, not enforced):

```
# [Town] removals — local context

[150–200w intro: what makes [Town] specific. Reference 1–2 road names,
the outward postcode, distance from base, what we love/find tricky.]

## Getting in and out of [Town]

[100–150w: routes from base, road conditions, parking patterns,
known restrictions. Earn the geography.]

## Property types we move from in [Town]

[100–150w: housing stock with examples. Listed building handling
where applicable.]

## What a [Town] move typically costs

[80–120w: indicative pricing band, what drives variance, local
factors. No hourly rates if the brand policy is fixed-price.]

## What we've learned moving in [Town]

[100–150w: earned details. The one or two specific things that
prove operational knowledge. This section sells expertise.]

[FAQs section: 4–6 town-specific Q&A]
```

### 3. Schema

Per-area, emit a Service JSON-LD (NOT a duplicate LocalBusiness):

```ts
import { areaServiceSchema } from '@/lib/schema/jsonld'

areaServiceSchema({
  serviceType: 'Removals',  // or 'Taxi service', 'Plumbing services', etc.
  cityName: 'Shaftesbury',
  cityRegion: 'Dorset',
  description: '<one-line summary of the service in this area>',
  url: 'https://example.com/areas/shaftesbury',
})
```

The page also emits BreadcrumbList from the visible `<Breadcrumbs>`
component (single source of truth — see local-business-schema-graph).

### 4. Audit

Run the audit script (provided as a re-runnable check):

```bash
node web/scripts/audit-town-content.mjs
```

(Adapt to the project's own area content shape.)

Output is per-town, scored 0–8. Any town under 8 needs work.

## Anti-patterns

- **Generic FAQs**: "How much does a move cost?" is generic. "What's
  the smallest van you can get up Park Road in Shaftesbury?" is
  town-specific. Difference matters.
- **Templated intros** ("Looking for reliable removals in Shaftesbury?
  We've got you covered."). Read like SEO spam. Replace with a real
  local sentence.
- **Padding road names** without context. Listing 10 roads doesn't
  score 10× on the recipe — listing 3 with operational context
  (parking on Castle Hill, the gradient on Park Road) does.
- **Service-stuffing**. Don't list every service in every area page.
  Mention the 1–2 most relevant; link to the deep service pages for
  the rest.
- **/area/service/ matrices**. Don't build `/shaftesbury/removals/`
  AND `/shaftesbury/man-and-van/` AND ... — that's the programmatic
  matrix anti-pattern. Build deep `/services/<service>/` pages with
  town-anchored sub-sections instead.

## Lessons from the Marley rebuild (provenance)

- Marley shipped 16 town pages. Initial draft was 100w of generic
  intro + 4 templated FAQs each. Failed the "remove name" test on
  16/16. Rewrites took 4 sessions (sessions 5–6 + post-audit
  sweep `7575bd5`). Result: 900–1050w each, scored 8/8.
- Bournemouth is the deepest treatment (commit `b6a96aa`) — useful
  reference for how a high-traffic town reads.
- The audit script (`audit-town-content-vs-shaftesbury-bar.mjs`)
  is the canonical example of automated recipe enforcement.
