# Local Business SEO Kit

A reusable agent + skills package for building search-optimised websites for
local service businesses (taxis, plumbers, electricians, removals, cleaners,
trades, mobile services). Distilled from the Marley Moves rebuild
(2026-04 → 2026-05).

## What this gives you

A consistent, repeatable way to ship a local service business site that:

- Wins **local SEO** (one Organization, town/city pages with real local
  detail, the "remove location name" test, GBP-friendly NAP)
- Wins **AEO / LLM citations** (Person schema for E-E-A-T, robots AI
  allowlist, `llms.txt` + `llms-full.txt`, BlogPosting schema with author
  refs, Review entities backing AggregateRating)
- Avoids the **anti-patterns** that cost weeks on Marley (map iframes that
  tank LCP, programmatic /area/service/ matrices that trip Helpful Content,
  duplicate Organization nodes, brand-suffix double-stamping, hardcoded
  review counts, two-template drift)
- Doesn't sound AI-written (banned em-dashes, banned AI tells, UK English
  by default, USP repetition checks)
- Ships safely (Vercel preview default-noindex, `INDEXING_ENABLED` gate at
  cutover, canonical hostname enforcement, redirect manifest from old
  sitemap, API key restrictions before launch)

## What's in the box

```
local-business-seo/
├── agents/
│   └── local-service-seo-builder.md         ← orchestrator agent
├── skills/
│   ├── local-business-site-bootstrap/       ← cold-start scaffold
│   ├── local-business-cms-seed/             ← seed siteSettings/tracking/owner
│   ├── local-business-area-page-enricher/   ← town/area page recipe
│   ├── local-business-schema-graph/         ← JSON-LD Org/Person/Service/Review
│   ├── local-business-aeo-stack/            ← robots AI allow + llms.txt
│   ├── local-business-content-audit/        ← banned chars, AI tells, UK English
│   └── local-business-pre-launch-checklist/ ← noindex gate, redirects, cutover
├── DESIGN.md                                 ← spec / blueprint
├── INSTALL.md                                ← how to add to your skills library
└── README.md                                 ← this file
```

## How to use it on a new project

```bash
# 1. Cold start
mkdir O:/first-taxis && cd O:/first-taxis
# In Claude Code:
@local-service-seo-builder bootstrap a new local business site for First Taxis,
  Shaftesbury, primary phone 01747 ..., towns served are Shaftesbury,
  Gillingham, Mere, Wincanton

# 2. Seed CMS once Sanity project is created
@local-service-seo-builder seed the CMS — owner is John Smith,
  Director, knows about airport transfers, station runs, school runs

# 3. Build content
@local-service-seo-builder build area pages for Shaftesbury, Gillingham,
  Mere, Wincanton
@local-service-seo-builder build service pages — airport transfers,
  station runs, school runs, contract work, weddings

# 4. Pre-launch
@local-service-seo-builder run the pre-launch checklist, we want to cut
  over to firsttaxis.co.uk this Friday
```

The agent picks the right skill for each step. You can also call skills
directly (e.g. `/local-business-content-audit`) when you want one
specific workflow.

## Tech assumptions

The kit is opinionated about the stack — these decisions are baked in
because they're what made Marley ship cleanly:

- **Next.js 16** App Router, React 19, TypeScript, Tailwind v4
- **Sanity v5** Studio (separate `studio/` folder, project ID configured
  in `.env.local`)
- **Vercel** hosting (uses `VERCEL_ENV` for preview noindex gating)
- **Resend** for the contact form (server action pattern)
- **UK English** by default (changeable per project)

If your stack differs, the schema-graph, content-audit, and area-page
skills are still useful in principle — only the bootstrap and
pre-launch skills are stack-specific.

## Provenance

Patterns extracted from the Marley Moves website rebuild (Apr–May 2026,
`O:\marley\`). Every skill carries the *why* alongside the *what* —
the anti-patterns section in each skill cites the specific failure
mode that made us reject the alternative.

## Versioning

This kit is versioned by date of last meaningful change. Before
applying it to a new project, check `DESIGN.md` for the date stamp and
the "What's changed since" table.
