---
name: local-business-internal-linking
description: Use when wiring up internal-linking blocks at the bottom of long-content pages on a local service business website. Implements the proven 4+4+3 pattern — every long-content page renders RelatedAreas (4 area cards, ordered by distance from base), RelatedServices (4 sibling services, excluding self), RelatedPosts (3 most-recent insights, excluding self) — fed from the CMS so the lists stay in sync with content additions without manual link-management. Plus the in-body cross-link rule (each area page mentions ≥2 nearby areas in flowing copy with varied anchor text). Catches the manual-list-rot anti-pattern and the duplicate-anchor-text anti-pattern. Pairs with local-business-area-page-enricher (which produces the body copy that contains the in-body links) and local-business-schema-graph (BreadcrumbList from visible nav, not duplicated here).
---

# local-business-internal-linking

The internal-linking pattern that makes Google's crawler walk the whole topic graph from any entry point, without burning anyone's time on a manual link-management spreadsheet.

## When to use this

- Adding the related-blocks scaffolding to a fresh project (call after `local-business-site-bootstrap`).
- Auditing an existing site for internal-link gaps or anchor-text duplication.
- Adding a new content type (e.g. case studies) and wiring it into the link graph.
- Fixing a "we have 60 pages but they don't link to each other" symptom.

## The 4+4+3 pattern

Every long-content page renders three component blocks at the bottom, between the body copy and the footer. **All three pull from the CMS — no hardcoded lists.**

| Block | Source | Count | Sort | Used on |
|---|---|---|---|---|
| `RelatedAreas` | CMS query: `*[_type=="area"]\|order(distanceFromHqMiles asc)[0..3]` | 4 | by distance from operator's base, ascending | every service + every post |
| `RelatedServices` | CMS query: `*[_type=="service" && slug.current != $exclude][0..3]` | 4 | by display order | every area + every post |
| `RelatedPosts` | CMS query: `*[_type=="post" && slug.current != $exclude && status=="published"]\|order(publishedAt desc)[0..2]` | 3 | most recent first | every service + every area |

The result: every page links to ~10–14 other pages by default (4 areas + 4 services + 3 posts + a few in-body). Topics cluster naturally without anyone maintaining a link spreadsheet.

## In-body cross-links (separate from the bottom blocks)

In addition to the 4+4+3 bottom blocks, area pages MUST mention ≥2 nearby areas in flowing copy. This is the body-prose link, not the card-grid link, and Google weighs it more heavily.

Example (in a Wincanton area page's body):

> We work with families across **[Bruton](/removals/bruton/)** and **[Sherborne](/removals/sherborne/)** too — the whole South Somerset corridor moves through the same A359 / A30 access we use for Wincanton.

Rules:

- **Vary anchor text.** Don't have every link to `/removals/sherborne/` use "Sherborne". Mix "Sherborne", "moves to Sherborne", "Sherborne, DT9", "the Sherborne crew". Card-grid block already gives Google the canonical anchor; in-body links should add variety.
- **Mention nearby areas, not all areas.** A Wincanton page mentions Bruton and Sherborne (genuinely nearby), not Bath (too far). Use the operator's adjacency map.
- **Don't repeat the bottom block in the body.** If `RelatedAreas` is going to render 4 town cards including Sherborne, the body shouldn't ALSO have a "Sherborne — Bruton — Frome — Wincanton" town list. Card grid is the SEO surface; body is the human surface.

## Component reference

The Marley implementations are in `references/`:

- `RelatedAreas.tsx` — Sanity query, ordered by `distanceFromHqMiles`, optional `intro` + `showMap` props for service pages that need a deeper layout
- `RelatedServices.tsx` — Sanity query, excludes the current slug, renders 3-up card grid
- `RelatedPosts.tsx` — Sanity query, status-filtered to published, ordered by publishedAt desc

Adapt the queries to the project's own CMS schema and content types.

## Process — when invoked

```
1. Confirm the CMS has area, service, and post (or equivalent) doc types.
   ├─ If not, the pattern doesn't apply — stop.
   └─ If yes, continue.

2. Confirm areas have a distanceFromHqMiles field (or equivalent for sort).
   └─ If not, add to the schema and seed it. Without it, RelatedAreas can't
      sort sensibly.

3. Drop the three components into web/components/sections/ (adapt from
   references/ to the project's CMS client + design tokens).

4. Wire each page template:
   ├─ /services/[slug]/page.tsx     ← <RelatedServices excludeSlug={slug} /> + <RelatedAreas />
   ├─ /removals/[town]/page.tsx     ← <RelatedServices excludeSlug="__none__" />
   ├─ /insights/[slug]/page.tsx     ← <RelatedPosts excludeSlug={slug} />
   └─ Plus RelatedAreas on insights, RelatedPosts on areas + services as
      makes sense for the project (Marley adds RelatedAreas on insights too).

5. Audit body copy for in-body cross-links:
   ├─ Run grep for area pages that don't mention any sibling area.
   └─ Audit anchor-text variety: same destination URL must use varied text.

6. Verify on a random sample of 3 pages (after deploy):
   ├─ Count internal links — should be ~10–14.
   └─ Confirm anchor text varies for the same destination URL.
```

## Why pull from CMS, not hardcode

If you hardcode "the top 4 areas to link to" in a component, you maintain it forever:
- Operator adds a new town → has to update the component or the new town stays orphaned
- Operator removes a town → has to remember to delete the link or it 404s
- Operator wants to change "top 4 by traffic" to "top 4 by distance" → component rewrite

CMS query + sort field = mechanical. Add a town with `distanceFromHqMiles: 12`, it auto-slots into the closest-4 if it's closer than the previous fourth.

## Why limit to 4 areas / 4 services / 3 posts

- **Marley tested wider grids (8 areas, 6 services).** They added clutter without compounding crawl benefit. Beyond 4–6 sibling links, Google's link-equity distribution is functionally identical and the user cognitive load goes up.
- **Less is also better for "is this manipulation?"** A page with 30 internal links per body section reads like SEO spam to Google's link-pattern detection. 10–14 reads natural.

## Anti-patterns

- **Hardcoded link lists** — every operator change becomes a code change.
- **Same anchor text everywhere** — every link to `/removals/shaftesbury/` saying just "Shaftesbury". Reads templated.
- **Duplicate blocks** — `<RelatedAreas>` rendered twice on the same page (once at the bottom, once mid-page). Google treats this as link-stuffing.
- **Empty cross-links** — every page renders the same 4 sibling links because no body-copy variety. Variety lives in the in-body prose, not just the cards.
- **Linking out of topic** — an insights post about "BAR registration" linking to all 16 area pages. Topic-relevance > completeness.
- **Anchor-text keyword stuffing** — making every link's anchor text the destination's primary keyword. Vary it.

## Provenance

Marley shipped this pattern in session 3 (IA refactor, premium nav) and session 4 (deep service pages). Components at:

- `O:/marley/site/web/components/sections/RelatedAreas.tsx`
- `O:/marley/site/web/components/sections/RelatedServices.tsx`
- `O:/marley/site/web/components/sections/RelatedPosts.tsx`

Wired in:
- `O:/marley/site/web/app/services/[slug]/page.tsx` (lines 712, 717, 723)
- `O:/marley/site/web/app/removals/[town]/page.tsx` (line 455)
- `O:/marley/site/web/app/insights/[slug]/page.tsx` (line 174)

In-body cross-link rule enforced by the area-page-enricher recipe (the "≥2 sibling area mentions in body copy" requirement).
