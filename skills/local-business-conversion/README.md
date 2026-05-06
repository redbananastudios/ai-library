# Local Business Conversion Kit

Sibling kit to `local-business-seo`. The SEO kit gets traffic to the page; this kit converts the traffic into form submits, calls, and WhatsApp messages.

Distilled from the Marley Moves rebuild (2026-04 → 2026-05).

## What's in the box

```
local-business-conversion/
├── prompt.md                                          ← orchestrator skill
├── README.md                                          ← this file
├── DESIGN.md                                          ← decisions baked in
├── CHANGELOG.md
├── source.json
├── spec.yaml
└── skills/
    ├── local-business-lead-form/                      ← quote form + autocomplete + postcode checker + Resend
    ├── local-business-sticky-ctas/                    ← mobile call bar, sticky desktop quote, mobile quote sticky, WhatsApp float
    └── local-business-conversion-analytics/           ← track() + first-touch attribution + Enhanced Conversions
```

## When to use

- New project, after `local-business-site-bootstrap` has scaffolded structure and content is taking shape.
- Existing site that's CTA-light or has form-friction issues.
- Setting up Google Ads / Meta Ads with proper attribution.

## Tech assumptions

Same as the SEO kit:

- **Next.js 16** App Router, React 19, TypeScript, Tailwind v4
- **Sanity v5** for the audit-trail write of every submission
- **Vercel** hosting
- **Resend** for the transactional email (lead-form sub-skill)
- **Google Places API** for address autocomplete (lead-form sub-skill)
- **GTM + GA4 + Meta Pixel + Plausible** as the four-layer analytics stack (analytics sub-skill)

If your stack differs, the lead-form patterns (multi-step, abandonment tracking) and analytics patterns (first-touch, Enhanced Conversions) port; the wiring (Resend specifically, Google Places specifically) is stack-locked.

## Provenance

Patterns extracted from Marley Moves' conversion stack:

- Hero quote form (two-step): `O:/marley/site/web/components/sections/HeroQuoteForm.tsx`
- Standard quote form: `O:/marley/site/web/components/forms/QuoteForm.tsx`
- Address autocomplete: `O:/marley/site/web/components/forms/AddressAutocomplete.tsx`
- Postcode checker: `O:/marley/site/web/components/forms/PostcodeChecker.tsx`
- Server action: `O:/marley/site/web/app/actions/submit-quote.ts`
- Sticky CTAs: `O:/marley/site/web/components/chrome/MobileCallBar.tsx`, `MobileQuoteStickyBar.tsx`, `StickyQuoteButton.tsx`, `WhatsAppFloat.tsx`
- Analytics layer: `O:/marley/site/web/lib/analytics.ts`, `O:/marley/site/web/lib/attribution.ts`
- PPC tracking spec: `O:/marley/site/docs/superpowers/specs/2026-05-01-ppc-tracking-gtm-dashboard-config.md`
