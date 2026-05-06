---
name: local-business-conversion-analytics
description: Use when wiring up the analytics + attribution layer on a local business site. Implements the four-layer stack — Plausible (cookieless, fires unconditionally), GA4 + GTM dataLayer + Meta Pixel (gated on Consent Mode v2). Plus first-touch attribution within a 30-day TTL (gclid/gbraid/wbraid/fbclid/msclkid/ttclid/li_fat_id/utm_*) auto-attached to every event. Plus Google Ads Enhanced Conversions (SHA-256 hashed email + E.164-normalised phone, pushed as `enhanced_conversion_data` to dataLayer). Plus Meta Lead-event mapping (cta_quote_submit + lead_thank_you_view → fbq Lead; phone_click + whatsapp_click → fbq Contact; everything else → trackCustom). Plus property-size-to-lead-value mapping for smart-bidding optimisation. Plus a click delegation listener that auto-tags phone:/mailto:/wa.me/ links and external outbound clicks. Pairs with `local-business-lead-form` and `local-business-sticky-ctas` which call into the track() helper.
---

# local-business-conversion-analytics

The four-layer analytics stack with first-touch attribution and Enhanced Conversions. The substrate that makes every conversion event PPC-reportable.

## When to use this

- New project — install the analytics layer (after `local-business-cms-seed` so tracking IDs are in CMS).
- Existing site with thin tracking — needs first-touch attribution OR Enhanced Conversions.
- Existing site running Google Ads with poor iOS conversion attribution — Enhanced Conversions retrofit.

## The four-layer stack

| Layer | Fires when | Cookies? | Purpose |
|---|---|---|---|
| Plausible | Always | No | Baseline traffic + funnel even when consent denied |
| GA4 (gtag) | Consent granted | Yes | Smart bidding signals for Google Ads, audience export to Ads |
| GTM dataLayer | Consent granted | Depends on tag | Delivers Enhanced Conversions, server-side Meta CAPI mirror |
| Meta Pixel (fbq) | Consent granted | Yes | Lookalike audiences, Smart Bidding for Meta Ads |

The track() helper fires Plausible unconditionally, then short-circuits if `window.__mm_consent !== "granted"`. Cookie banner / consent management UI is OUT of scope for this skill — it assumes a Consent Mode v2-compatible CMP is in place that flips `__mm_consent`.

## First-touch attribution (30-day TTL)

On every page load, `captureAttribution()` reads the URL for tracked params:

```ts
const PARAMS = [
  "gclid", "gbraid", "wbraid",          // Google Ads click IDs
  "fbclid",                              // Meta click ID
  "msclkid",                             // Microsoft Ads (Bing)
  "ttclid",                              // TikTok
  "li_fat_id",                           // LinkedIn
  "utm_source", "utm_medium", "utm_campaign",
  "utm_content", "utm_term", "utm_id",
];
```

If any are present AND no non-expired record exists in `localStorage`, write the captured set + `landing_referrer` + `landing_url` + `captured_at` (epoch ms). 30-day TTL. **First-touch wins** within the window — don't overwrite.

`getAttribution()` returns the stored attribution (minus `captured_at`) for spreading into every analytics event payload.

This makes ROAS reporting honest: a user who lands via `?gclid=xxx` and converts 3 days later via organic still credits the original Ads click.

## Google Ads Enhanced Conversions

`buildEnhancedConversionPayload({email, phone})` returns:

```ts
{ sha256_email_address, sha256_phone_number }
```

Email lowercased + trimmed before hash. Phone normalised to E.164 (`+447495835006`, no spaces/dashes) before hash. SHA-256, hex.

Pushed to dataLayer as:

```js
{ event: "enhanced_conversion_data", user_data: <hashed_payload> }
```

Google's Ads tag in GTM picks it up alongside the conversion event and matches the conversion back to the click ID even when cookies are blocked.

Fire-and-forget — runs in `.then()` after the conversion event so it doesn't block the redirect to /thanks.

## Event vocabulary

```ts
type AnalyticsEvent =
  | "quote_submit"          | "phone_click"           | "email_click"
  | "whatsapp_click"        | "cta_click"             | "faq_open"
  | "scroll_depth"
  // Hero engagement
  | "cta_call_click"        | "cta_quote_click"       | "cta_whatsapp_click"
  | "cta_quote_submit"      | "cta_quote_error"       | "hero_form_focus"
  // Two-step hero
  | "step1_submit"          | "step1_validation_error"
  | "step2_focus"           | "mobile_sticky_cta_tap"
  | "cta_offer_click"       | "offer_terms_click"
  // High-intent postcode lookup
  | "postcode_check"
  // Backup conversion (fires on /thanks page view; supplements
  // cta_quote_submit which can be lost to ad blockers / network blips)
  | "lead_thank_you_view"
  // External clicks (Trustpilot, Google reviews, Companies House etc.)
  | "outbound_click"
  // Form depth
  | "form_field_focus"      | "form_field_abandon"
  // Page classification
  | "content_group_view";
```

## Meta event mapping

In `track()`, after attribution is attached, events are mapped to the right Meta `fbq` action:

```ts
const leadEvents = ["quote_submit", "cta_quote_submit", "lead_thank_you_view"];
if (leadEvents.includes(event)) {
  fbq("track", "Lead", enriched);          // standard event
} else if (event === "phone_click" || event === "whatsapp_click") {
  fbq("track", "Contact", enriched);       // standard event
} else {
  fbq("trackCustom", event, enriched);     // custom event
}
```

`lead_thank_you_view` mirroring is intentional — backup conversion event (in case the primary `cta_quote_submit` was swallowed by an ad blocker). Marley dedupes via `event_id` when set, but even without dedup the duplicate signal is recoverable.

## Property-size → lead-value mapping

`estimatedLeadValueGBP(propertySize)` returns indicative GBP value for the conversion event's `value` parameter:

```ts
const PROPERTY_SIZE_VALUE_GBP: Record<string, number> = {
  "Studio / 1 bedroom": 600,
  "2 bedroom":          800,
  "3 bedroom":          1050,
  "4 bedroom":          1400,
  "5+ bedroom":          1800,
  "Commercial / office": 1500,
  "Single items":        150,
};
```

The numbers are **optimisation hints, not invoice values** — what matters for smart bidding is the relative weighting (a 5-bed move is worth ~3× a studio move). Tune to the operator's actual job-value distribution.

## Click delegation listener

`wireGlobalAnalytics()` attaches a single document click listener that auto-fires the right event per anchor:

```
<a href="tel:..."> → phone_click
<a href="mailto:..."> → email_click
<a href="wa.me/..."> → whatsapp_click
<a class="bg-mm-red ..."> → cta_click  // matches Tailwind primary CTA classes
<a href="https://other-domain..."> → outbound_click  // non-self host
<a data-analytics-event="X" data-analytics-source="Y"> → X with source: Y
```

Mount once at the root of the app (typically in a `<ClientAnalytics />` component called from layout.tsx).

## Process — when invoked

```
1. Confirm tracking IDs in CMS:
   ├─ siteConfig (or Sanity tracking doc) has GTM ID, GA4 ID, Meta Pixel ID,
   │  Plausible domain
   └─ All set to live operator accounts (not dev IDs — see local-business-
      pre-launch-checklist for the swap-on-cutover rule)

2. Drop analytics.ts + attribution.ts into web/lib/.

3. Add scripts to layout.tsx:
   ├─ Plausible (cookieless, no consent gate needed)
   ├─ GTM (Consent Mode v2 default-deny config)
   └─ Meta Pixel (loaded via GTM tag, NOT inline)

4. Wire wireGlobalAnalytics() into a client component at the root, called
   on mount (returns cleanup function for hot-reload).

5. Wire captureAttribution() to fire on every page load (also via the root
   client component).

6. Configure GTM:
   ├─ Trigger on cta_quote_submit + lead_thank_you_view → Google Ads
   │  conversion + Enhanced Conversions
   ├─ Trigger on cta_quote_submit → Meta Lead conversion
   ├─ Trigger on phone_click → Meta Contact conversion
   └─ Trigger on postcode_check { result: 'match' } → Audience signal for
      Google Ads + Meta lookalike

7. Verify:
   ├─ Land on a Vercel preview with ?gclid=test123 → check
   │  localStorage.mm-attribution has { gclid: 'test123', captured_at: ... }
   ├─ Submit a form → dataLayer pushes cta_quote_submit with gclid carried
   │  through, AND enhanced_conversion_data with sha256 hashes
   ├─ Decline consent → submit form → only Plausible event fires
   ├─ Grant consent → submit form → all four layers fire
```

## Gotchas / decisions baked in

- **Consent Mode v2 only.** v1 is deprecated; the skill assumes v2 (default-deny model with `__mm_consent` flag).
- **Plausible is cookieless and consent-free** — fires before consent grant. This is intentional and Plausible's TOS-compliant. If the operator's regulator (DPA, etc.) classifies it differently, gate it.
- **Postcode prefixes only in event payloads.** `from_postcode_outcode: "SP7"`, never the full postcode `SP7 9PX`. GA4 and Meta both prohibit PII in event params; outcodes are aggregated enough to be non-PII.
- **Email/phone hashing must use `crypto.subtle`.** Don't use `crypto.createHash` — that's Node's API, doesn't run in the browser. The skill uses `crypto.subtle.digest("SHA-256", buf)`.
- **Don't normalise email aggressively.** Lowercase + trim is correct. Stripping dots from Gmail addresses (a common over-normalisation) breaks the match.
- **First-touch wins, but first-touch with NO attribution doesn't overwrite a stored attribution.** A user who lands via Google Ads, comes back via direct, then converts: the direct visit doesn't overwrite the gclid because direct has no tracked params.
- **Reading dataLayer in tests is brittle.** Don't write tests against `window.dataLayer.length` — write tests that verify the function calls (mock `window.gtag`, assert it was called with the right args).

## Anti-patterns

- **Hardcoding tracking IDs in source.** They're in CMS. Bootstrap reads from siteConfig / Sanity tracking doc.
- **Last-touch attribution.** Over-credits direct/organic returns. Marley used last-touch in its first deploy cycle and Google Ads reported ~30% under-spend ROAS until first-touch was wired.
- **Skipping Enhanced Conversions.** ~25% of iOS Ads conversions go unmatched without it. Smart Bidding biases against iOS users.
- **Mapping every event to fbq Lead.** Meta requires standard events to be standard signals. `phone_click` is Contact, not Lead. Custom events use `trackCustom`.
- **Firing the conversion event AFTER the redirect.** `router.push("/thanks")` unmounts the form component — events fired in `.then()` after redirect don't fire reliably. Fire the conversion event BEFORE the redirect, run Enhanced Conversions push in `.then()` (it's non-blocking, fire-and-forget).
- **Leaking PII to Plausible.** Plausible doesn't gate on consent — don't push email/phone there. Postcode outcodes only.

## Provenance

Marley Moves source files:
- `O:/marley/site/web/lib/analytics.ts`
- `O:/marley/site/web/lib/attribution.ts`

PPC tracking + GTM dashboard config: `O:/marley/site/docs/superpowers/specs/2026-05-01-ppc-tracking-gtm-dashboard-config.md`. Per-event GTM trigger spec lives there alongside the recommended dashboard chart definitions.
