# Local Business SEO Kit — Design Doc

**Status**: v1.0 (2026-05-02)
**Author**: Distilled from Marley Moves rebuild (Apr–May 2026)
**Next project this serves**: First Taxis (taxi service, Shaftesbury)

## Goal

Make every future local-service-business website ship with the same
quality bar Marley Moves achieved, without re-deriving the patterns
each time.

## What "local service business" means here

A small-to-mid UK service business with:
- One physical base (or a small handful), one Organization entity
- Service catalogue: 3–10 distinct services (airport transfers,
  house removals, emergency callouts, etc.)
- Geographic service area: 5–30 named towns/cities/postcodes
- Owner-operator or small-crew model where the owner's identity
  matters for E-E-A-T (named Person, photo, knowsAbout)
- Lead capture via form/phone/WhatsApp (not real-time booking)
- Reviews on Google and at least one third-party (Trustpilot /
  Checkatrade etc.)

Examples in scope: taxis, plumbers, electricians, removals,
cleaners, decorators, mobile mechanics, gardeners, locksmiths,
pest control, roofers, window cleaners, mobile groomers, mobile
beauticians, oven cleaners, removals, man-and-van, courier
services.

Examples out of scope: e-commerce, SaaS, B2B agencies, booking
platforms, multi-location franchises with hundreds of pages.

## Why this is a kit, not a template

A template repo dates fast. A kit of agent + skills:
- Stays in sync (skills are read fresh each invocation)
- Encodes the *why* (each skill carries the rationale and
  rejected alternatives) so future-Claude makes good calls in
  edge cases instead of blindly templating
- Composes (you can run one skill against an existing site
  without taking the whole kit)
- Can be partially adopted (taking just the schema-graph or
  content-audit skill into a non-Next.js project is fine)

## Architecture

```
┌─────────────────────────────────────────┐
│  @local-service-seo-builder             │  ← agent (orchestrator)
│  knows: when to use which skill,        │
│  cross-skill content rules,             │
│  the "remove location name" test,       │
│  address-display rule, anti-patterns    │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┬────────┬────────┬────────┬────────┬─────────┐
       ▼                ▼        ▼        ▼        ▼        ▼         ▼
   bootstrap        cms-seed   area-     schema-  aeo-    content-  pre-launch-
                              page       graph    stack   audit     checklist
   cold-start      seed once  per page  build/   install  audit    cutover
   scaffolds       (idem-     (recipe)  fix      (robots+ banned   (noindex
   Next+Sanity     potent)              JSON-LD  llms)    chars+   gates,
                                                          AI tells redirects,
                                                          + UK)    API keys)
```

## Decisions baked in (and why)

### D1. Single Organization node, Service nodes per area
**Decision**: One global LocalBusiness/Organization. Areas/towns get
`Service` nodes (provider → #organization, areaServed → City), not
duplicate LocalBusiness or MovingCompany nodes.

**Why**: Marley initially emitted `townLocalBusinessSchema()` per
town, which created 16 competing LocalBusiness entities for a
single physical business. Google can't pick a primary entity.
Switched to Service-per-area with one Org node; entity model
became clean.

### D2. Person entity for owner, rendered on every page
**Decision**: Owner Person entity (jobTitle, knowsAbout, image)
emitted globally from `app/layout.tsx`. Organization references
it via `founder: { @id: '#person' }`.

**Why**: Inbound graph references must resolve. If Person only
emitted on About page, Org's `founder` ref breaks on every other
page. E-E-A-T also wants Person visible everywhere the brand is.

### D3. BreadcrumbList from visible nav as SSOT
**Decision**: The visible `<Breadcrumbs>` component emits the
BreadcrumbList JSON-LD inline. No separate `breadcrumbListSchema()`
helper called from page templates.

**Why**: Two sources drift. Visible breadcrumbs and structured
breadcrumbs have to match (Google validates this). Single source
prevents bugs.

### D4. Reviews are Review entities, not just AggregateRating numbers
**Decision**: Each visible review on `/reviews/` page emits its own
`Review` JSON-LD with `itemReviewed: { @id: '#organization' }`.

**Why**: AggregateRating without supporting Review entities looks
unverifiable to Google. Inline Reviews back the aggregate.

### D5. Robots AI allowlist is explicit
**Decision**: `app/robots.ts` lists every AI crawler we want
indexed: GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot,
ClaudeBot, Claude-Web, Google-Extended, Applebot-Extended.

**Why**: Default `User-agent: *` is enough for most, but explicit
`allow` rules per AI bot signal intent and protect against future
default changes by the bots.

### D6. `llms.txt` and `llms-full.txt` are routes, not static files
**Decision**: Both live at `app/llms.txt/route.ts` and
`app/llms-full.txt/route.ts`, generated from Sanity content.

**Why**: Static `.txt` in `public/` goes stale. Routes regenerate
on every deploy from current content.

### D7. Vercel preview is noindex by default
**Decision**: `lib/seo/canonical.ts` checks `VERCEL_ENV !==
'production'` OR `INDEXING_ENABLED !== 'true'`. Both gates must
pass for the site to ship `index, follow`. Plus a middleware
header `X-Robots-Tag: noindex, nofollow` on preview URLs.

**Why**: Marley nearly indexed `*.vercel.app` preview URLs at
session 4. Belt-and-braces gating prevents this. Explicit
`INDEXING_ENABLED=true` env var must be set at production cutover
(documented in pre-launch checklist).

### D8. Address-display rule
**Decision**: In customer-facing copy, only the recognised town
+ outward postcode (e.g. "Shaftesbury, SP7"). Full street
address only in legal docs, JSON-LD source, Sanity
siteSettings, and form placeholders.

**Why**: Customers recognise towns, not industrial estate
addresses. Marley's registered yard is on Sherborne Causeway
near Shaftesbury, marketing it as "Shaftesbury" is honest and
recognisable. Same pattern works for any local business
where registered ≠ marketed location.

### D9. Banned content patterns
**Decision**: Em-dash banned. AI tells banned (moreover,
furthermore, leverage, robust, navigate-as-verb, delve,
harness, unleash, in today's fast-paced world, ...). UK
English by default. No on-page repetition of USPs. No
cross-page boilerplate paragraphs.

**Why**: All these signal AI-written content to readers and
to Google. Marley's content rules are enforced by
`local-business-content-audit` as a re-runnable script.

### D10. No map iframes
**Decision**: Don't embed Google Maps iframes on town pages
or contact page.

**Why**: Marley tried it (commit 67a5f1f reversed). LCP cost
~400ms, no SEO benefit. GBP listing is the real local SEO
asset, not on-page map embeds.

### D11. No programmatic /area/service/ matrices
**Decision**: Don't build `/services/<service>/<town>/` pages
programmatically. Build deep `/services/<service>/` pages
with town-anchored sub-sections instead.

**Why**: Helpful Content / scaled content abuse risk.
Programmatic matrices are templated by definition; Google has
been explicit about devaluing them in 2024–2025.

### D12. Centralise all numbers (review count, years in business)
**Decision**: Anything that grows or changes (review count,
years trading, jobs completed) lives in
`lib/site-config.ts` and feeds every reference. Never
hardcode "22 reviews" in copy.

**Why**: Marley had 4 different review counts visible across
the site at one point. SSOT prevents drift.

### D13. Redirect manifest from old sitemap is mandatory
**Decision**: Before cutover, the old WordPress (or whatever)
sitemap is fetched and every URL gets a 301 mapping in
`next.config.ts`. Verified by re-runnable curl script.

**Why**: Lost backlinks = lost rankings. Marley's WP site
had 106 URLs in its sitemap; all 106 had to resolve 200 or
308 on the new site before cutover.

### D14. Address-rule + content rules survive in `site/CLAUDE.md`
**Decision**: Each project's own `CLAUDE.md` carries the
address-display rule and content rules verbatim. The
bootstrap skill writes them in.

**Why**: Future Claude sessions on the same project need to
re-pick up these rules without reading the kit. The rules
are properties of the *project*, not just of this kit.

## What this kit deliberately does NOT do

- **No theme / visual design** — that's `frontend-design`,
  `ui-designer`, or design-system-of-choice's job. This kit is
  about content, schema, SEO architecture, pre-launch hygiene.
- **No GBP automation** — there's a `gbp-optimise` skill in the
  Anthropic skills set; this kit's pre-launch checklist points
  to it, doesn't replicate it.
- **No real-time booking** — out of scope (those sites are
  applications, not content sites).
- **No multi-location franchise pattern** — single Org assumption
  is baked in. A franchise with 50 owned-and-operated locations
  would need a different schema strategy.
- **No image generation** — that's `image-director`, `nano-banana-pro`.
  The bootstrap skill writes hero `<Image>` placeholders; you
  generate the images separately.

## Testing the kit

Acceptance test: after applying the kit to a new project, all
of the following pass:

- [ ] Site builds (`npm run build`) with all routes static
- [ ] Schema-graph passes Schema.org validator + Rich Results test
- [ ] llms.txt and llms-full.txt return 200 and contain real content
- [ ] robots.txt lists AI crawlers explicitly
- [ ] Vercel preview returns `noindex, nofollow` (header + meta)
- [ ] `INDEXING_ENABLED=true` flips to `index, follow`
- [ ] Pick any 3 area pages, run "remove location name" test,
      pass on all 3
- [ ] Content audit returns 0 banned characters, 0 AI tells
- [ ] All redirect manifest entries return 301 to live targets
- [ ] Lighthouse SEO ≥ 95 on home + 1 service + 1 area page

## Versioning + change log

| Version | Date       | Change |
|---------|------------|--------|
| v1.0    | 2026-05-02 | Initial extraction from Marley Moves rebuild |

When the kit changes, update this table AND bump the date in the
agent file's frontmatter.
