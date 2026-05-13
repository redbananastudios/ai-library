---
name: local-business-conversion
description: Sibling kit to local-business-seo. Lead-capture and conversion components for local UK service businesses — multi-step or single-step quote form (with Google Places address autocomplete and Resend server action), persistent CTA chrome (mobile call bar, desktop sticky button, mobile quote sticky bar, WhatsApp float), service-area postcode checker, and the analytics + first-touch attribution layer that powers PPC reporting (Google Ads Enhanced Conversions, Meta CAPI signal, Plausible, GA4). Three sub-skills — local-business-lead-form, local-business-sticky-ctas, local-business-conversion-analytics.
trigger: lead form, conversion form, quote form, sticky CTA, mobile call bar, postcode checker, enhanced conversions, attribution tracking
---
---
name: local-business-conversion
description: Use when wiring lead-capture and conversion chrome onto a local UK service business website. Sibling kit to local-business-seo — that kit covers SEO architecture and content; this kit covers the lead-capture surface that turns SEO traffic into form submits. Routes work to one of three sub-skills — local-business-lead-form (the quote form, including the two-step hero variant, AddressAutocomplete, PostcodeChecker, Resend server action), local-business-sticky-ctas (MobileCallBar, MobileQuoteStickyBar, StickyQuoteButton, WhatsAppFloat with the z-index discipline and path-aware rendering), local-business-conversion-analytics (track() helper, first-touch attribution, Google Ads Enhanced Conversions, Meta Lead event mapping, Plausible cookieless layer). Pair with `local-business-seo`'s pre-launch checklist for the API-key restriction step.
---

# local-business-conversion

The conversion surface for a local-business site, distilled from Marley. Three sub-skills, each addressing one cluster of components.

## When to use this kit

- After `local-business-site-bootstrap` has scaffolded the project and content is taking shape.
- When wiring the conversion chrome to an existing site that's currently CTA-light.
- When auditing an existing site's conversion stack — multiple competing CTAs, missing first-touch attribution, hardcoded review counts in a TrustStrip-equivalent.
- When setting up Google Ads / Meta Ads conversion tracking with proper attribution.

## When NOT to use it

- The site has real-time booking (e.g. taxi-hailing, online ordering) — those are applications, not lead-capture sites; the conversion shape is different.
- The site is e-commerce — checkout is its own thing.
- The operator hasn't decided on phone vs WhatsApp vs form vs all-three. Get that decision first.

## Routing — which sub-skill for which task

| Task | Sub-skill |
|---|---|
| Adding a quote/contact form | `local-business-lead-form` |
| Building the hero quote form (two-step or single-step) | `local-business-lead-form` |
| Wiring Google Places address autocomplete | `local-business-lead-form` |
| Adding a service-area postcode checker | `local-business-lead-form` |
| Setting up Resend / transactional email server action | `local-business-lead-form` |
| Adding mobile call bar / sticky quote button / WhatsApp float | `local-business-sticky-ctas` |
| Coordinating multiple sticky CTAs without z-index conflicts | `local-business-sticky-ctas` |
| Setting up GA4 / GTM / Meta Pixel / Plausible | `local-business-conversion-analytics` |
| Implementing first-touch attribution | `local-business-conversion-analytics` |
| Implementing Google Ads Enhanced Conversions | `local-business-conversion-analytics` |
| Mapping events to Meta Lead vs Contact vs custom | `local-business-conversion-analytics` |

If the user's request spans multiple sub-skills (e.g. "set up the form and wire conversion tracking"), invoke them in sequence. Order: lead-form → sticky-ctas → analytics.

## Cross-cutting decisions baked into the kit

These show up across all three sub-skills. They're documented in detail in `DESIGN.md`.

### D1. Two-step hero quote form, single-step `/quote/` page form

Hero is conversion real estate — every additional field is friction. Two-step (low-friction step 1: name/email/from/to → step 2: phone/date/size/referrer) maximises step-1 completion and recovers committed users in step 2 even if they fall off.

`/quote/` is for users who explicitly chose to fill a longer form — they have higher intent, fewer fields tolerated.

### D2. Resend + Sanity dual-write server action

Every form submit emails the operator AND writes to Sanity (or whatever CMS is in use) for audit + dashboard. Email-only submits are forensically opaque six months later; Sanity-only submits don't reach the operator's inbox quickly.

If Resend fails, the Sanity write still happens (logged to console, not surfaced to the user — they get `ok: true` either way; the operator gets the lead via the dashboard).

### D3. First-touch attribution within 30-day TTL

A user lands via `?gclid=xxx&utm_source=google&utm_medium=cpc`, then closes the tab, comes back via organic 3 days later, fills the form. The conversion still credits the original Google Ads click. Stored in `localStorage` keyed on a stable namespace, expires at 30 days.

This makes Google Ads / Meta Ads ROAS reporting honest. Without first-touch, every cross-session visitor's conversion gets misattributed to the second touch.

### D4. Google Ads Enhanced Conversions

Hashed (SHA-256, hex) email + phone pushed to dataLayer alongside the conversion event so Google can match the conversion back to the click ID even when cookies are blocked (iOS Mail Privacy Protection, Safari ITP). Email lowercased + trimmed before hash; phone in E.164 (`+44...`) before hash.

Without Enhanced Conversions, ~25% of Ads-driven conversions go unmatched on iOS — and Smart Bidding optimises against the matched subset, which biases against iOS users.

### D5. Plausible always fires; GA4/GTM/Meta gated on consent

Plausible is cookieless and fires unconditionally. The cookie-based trackers (GA4, GTM dataLayer, Meta Pixel) wait for `window.__mm_consent === "granted"`. The skill assumes a Consent Mode v2-compatible cookie banner is in place; the analytics layer doesn't include the banner itself.

### D6. Multiple sticky CTAs need z-index discipline

Four floating elements compete for the bottom-right of mobile viewports: WhatsApp float, mobile call bar, mobile quote sticky bar, sticky desktop quote button. They use a layered z stack (z-50 for primary mobile, z-40 for desktop, hidden via responsive utilities) and only one shows per device class. Path-aware rendering hides the mobile call bar on `/` (where the mobile quote sticky bar takes its place).

### D7. No literal review counts in TrustStrip / hero / form

The count grows weekly; a number rotting in HTML is worse than not having it. Show the rating (5.0★) and let the GBP listing carry the count. Source the rating from `siteConfig.googleReviews.rating` so when the operator's actual rating moves, the chrome moves with it.

### D8. Field-abandonment tracking

The form fires `form_field_focus` on first focus and `form_field_abandon` on unmount-without-submit. Surfaces the field that's killing conversions. Marley used this to identify that the date-picker step in the original single-step form was a friction point — direct evidence that drove the two-step refactor.

### D9. "How did you hear about us?" is a marketing field, not an analytics field

`referrer` from the form is the customer's self-reported source. `utm_source`/`gclid` is the technical source. They're different signals; the form captures both. Customers who say "Google" have often been served Google Ads — only `gclid` distinguishes paid from organic.

## What this kit does NOT do

- **Cookie consent banner UI** — outside scope. Assume a CMP (Consent Mode v2-compatible) is in place. The analytics layer respects `window.__mm_consent`.
- **GBP / map-pack work** — see `local-business-seo`'s pre-launch checklist + the `gbp-optimise` skill.
- **Review aggregation widgets (Trustindex, Trustpilot embed)** — Marley used Trustindex; the widget itself is third-party and out of scope. The TrustStrip pattern (rating-only, no count, fixed insurance figures) is in `local-business-sticky-ctas`'s sister documentation in `local-business-seo` (TrustStrip is a content section, not a sticky CTA).
- **A/B testing infrastructure** — out of scope. The two-step vs single-step decision is baked in based on Marley's findings; revisit per-project if needed.

## Pairings

- **`local-business-seo`** — required precondition. SEO architecture before conversion chrome. The conversion kit assumes `siteConfig` exists with phone/whatsapp/email + the noindex gate is in place + the schema graph is wired.
- **`local-business-seo/local-business-pre-launch-checklist`** — its API-key restriction step covers the `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` used by the lead-form's AddressAutocomplete.
- **GTM dashboard** — the analytics events emitted by this kit are the source data for a GTM-driven PPC dashboard (Marley spec at `O:/marley/site/docs/superpowers/specs/2026-05-01-ppc-tracking-gtm-dashboard-config.md`).
