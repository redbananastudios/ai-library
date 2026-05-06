# Local Business Conversion Kit — Design Doc

**Status**: v1.0 (2026-05-06)
**Author**: Distilled from Marley Moves rebuild (Apr–May 2026)
**Pairs with**: `local-business-seo` (SEO architecture and content)

## Goal

Make every future local-service-business website ship with the same lead-capture quality bar Marley Moves achieved, without re-deriving the patterns each time.

## Architecture

```
┌───────────────────────────────────────┐
│  @local-business-conversion (kit)     │
│  routes work to the right sub-skill   │
└──────────────┬────────────────────────┘
               │
       ┌───────┴────────────┬─────────────────────────────┐
       ▼                    ▼                             ▼
   lead-form          sticky-ctas              conversion-analytics
   (the form,         (call bar,               (track + attribution +
    autocomplete,      sticky button,            Enhanced Conversions +
    postcode-checker,  WhatsApp float,           Meta event mapping +
    Resend, Sanity)    mobile quote bar)         Plausible cookieless)
```

Sub-skills are independently invokable. A retrofit project might want the analytics layer without changing the form. A new project starts at lead-form, then sticky-ctas, then analytics.

## Decisions baked in (and why)

### D1. Two-step hero form, single-step `/quote/` form
**Decision**: Hero quote form splits into two steps (name/email/from/to → phone/date/size/referrer). The dedicated `/quote/` page uses a single-step longer form.

**Why**: Hero is the highest-traffic conversion surface. Friction in the hero costs ~30% of submits per extra field (Marley's pre-refactor single-step hero was abandonment-heavy at the date-picker). Two-step recovers users who'd have bounced at sight of 8 fields. `/quote/` users self-selected by clicking through; they tolerate longer forms, and the longer form means richer leads for the operator.

### D2. Resend + CMS dual-write server action
**Decision**: Every form submit emails the operator (Resend) AND writes to Sanity. Both happen even if one fails.

**Why**: Email-only loses audit trail (operator's inbox is not queryable). CMS-only loses speed (the operator sees the lead in their inbox in seconds, not next time they log in). Dual-write satisfies both. Sanity write also enables a leads-dashboard view in the studio.

### D3. First-touch attribution, 30-day TTL
**Decision**: On first visit with any tracked param (`gclid`, `gbraid`, `wbraid`, `fbclid`, `msclkid`, `ttclid`, `li_fat_id`, `utm_*`), write the full set + `landing_referrer` + `landing_url` + `captured_at` to localStorage. Don't overwrite if a non-expired record exists.

**Why**: Most local-business sales cycles are short (Marley books most quotes within 14 days). First-touch within a 30-day window correctly credits the click that actually drove the eventual conversion. Last-touch over-credits direct/organic returns and starves paid attribution. Without this, Google Ads ROAS reports under-state by 30%+ on returning users.

### D4. Google Ads Enhanced Conversions (hashed PII)
**Decision**: SHA-256 hex hash email (lowercased + trimmed) and phone (E.164, no spaces/dashes). Push as `enhanced_conversion_data` to dataLayer alongside the conversion event. Fire-and-forget — don't block the redirect to /thanks.

**Why**: iOS Mail Privacy / Safari ITP / cookie blockers cause ~25% of Ads click IDs to be lost between landing and form submit. Enhanced Conversions reattribute the conversion to the click via the hashed PII match. Smart Bidding optimises against matched conversions; without EC, smart bidding biases against iOS users.

### D5. Plausible cookieless layer
**Decision**: Plausible fires unconditionally (cookieless, no consent required). GA4 / GTM dataLayer / Meta Pixel are gated on `window.__mm_consent === "granted"`.

**Why**: Plausible gives a baseline traffic + conversion picture even when consent is denied. The cookie-based stack gives the rich PPC + Meta optimisation signal once consent is granted. Two layers complement each other rather than compete.

### D6. Sticky CTA z-index discipline
**Decision**: Four floating CTAs (WhatsApp float, mobile call bar, mobile quote sticky bar, sticky desktop quote button). Use responsive utilities (`md:hidden` / `hidden md:flex`) so only one renders per breakpoint. Path-aware rendering — mobile call bar hides on `/` where the mobile quote sticky bar takes its place. Z-index layered: 50 for primary mobile bottom-bar, 40 for desktop floats, lower for non-floating chrome.

**Why**: Without discipline, three floating elements stack at the same screen position and the user can only tap the topmost one. Most stacked-CTA bugs are a UX hit, not just a visual one. The path-aware rule is operator-decision-driven: home page wants users in the form, not on the phone, so the mobile sticky bar pulls to the form.

### D7. No literal review counts in chrome
**Decision**: TrustStrip and hero show the rating (5.0★) but never the count. Source rating from `siteConfig.googleReviews.rating`. Count is delegated to GBP.

**Why**: Count grows weekly — by the time the page is cached / archived / quoted, the count is wrong. Wrong-count rotting in HTML is worse than no count. Rating is stable across short windows, so it's safe.

### D8. Form-field abandonment tracking
**Decision**: Track first focused field on form load and last focused field on unmount-without-submit. Fire `form_field_focus` (engagement) + `form_field_abandon` (drop-off).

**Why**: Operator can't read the user's mind to know which field is killing conversions. The tracker surfaces the field that abandons cluster on. Marley's pre-refactor data showed `preferredDate` as the abandonment field, which directly drove the two-step refactor.

### D9. Self-reported referrer ≠ technical attribution
**Decision**: Capture both. The form has a "How did you hear about us?" select (`referrer` field — "Google search", "Recommendation", "Facebook / Instagram", etc.). Plus the `utm_*`/`gclid` from attribution.

**Why**: They tell different stories. "Recommendation" with `gclid=xxx` means the customer was nudged by a friend AND saw a Google Ad. "Google search" with no `gclid` is organic. The operator needs both signals — `referrer` for word-of-mouth tracking, `utm_*`/`gclid` for ad-spend ROI.

### D10. Enhanced Conversions runs async, doesn't block redirect
**Decision**: After the form submits and the conversion event fires, the Enhanced Conversions hash + dataLayer push runs in a `.then()` callback that doesn't block `router.push("/thanks")`.

**Why**: SHA-256 hashing of two strings via `crypto.subtle` is fast (~5ms) but a hung subtle.digest call should never block the user from seeing /thanks. The non-critical EC payload arrives a few hundred ms later — Google's GTM tag picks it up before the page is closed.

### D11. Backup conversion event on /thanks page
**Decision**: `/thanks` page fires `lead_thank_you_view` which is also mapped to Meta `Lead`. Marley deduplicates via `event_id` if set, but even without dedup, the duplicate signal is recoverable.

**Why**: Network blips / ad-blockers can swallow the primary `cta_quote_submit` event. The /thanks-page event is a backup that fires from a different code path and a different timing. Belt-and-braces.

### D12. Service-area postcode checker as a pre-form widget
**Decision**: Postcode checker on `/contact/` and the home page coverage section. Outcode-only matching against a per-area `outcodes[]` array from CMS. Fires `postcode_check` event with `match` / `no_match` / `invalid` result + outcode.

**Why**: Two roles — (1) reduces wasted form submits from out-of-area users (they see "we don't regularly cover this outcode" and either click /quote anyway for long-distance or self-select out), (2) the high-intent signal `postcode_check { result: "match" }` is a strong predictor of conversion. Smart bidding can optimise on it.

## What this kit deliberately does NOT do

- **Cookie consent banner UI** — assumes a Consent Mode v2-compatible CMP is in place. The kit respects the `__mm_consent` flag.
- **Booking / payments** — out of scope (those are applications, not lead-capture).
- **Multi-tenant lead routing** — single Resend recipient. Multi-region operators with separate inboxes per region need a different routing layer (not extracted from Marley because Marley has one operator).
- **CRM integration** — Sanity is the lead store. Operators wanting Pipedrive / HubSpot / etc. integration sync from Sanity.
- **Review aggregation widgets** — Trustindex / Trustpilot embeds. Out of scope.

## Testing the kit

After applying the kit to a new project:

- [ ] Submit a real lead via the hero two-step form — email arrives at the operator's inbox.
- [ ] Submit again via `/quote/` — email arrives, formatting matches.
- [ ] On mobile (real device), tap the call bar — phone dialler opens.
- [ ] On mobile home page, scroll past hero — mobile sticky quote bar appears, tap pulls to #hero-form.
- [ ] On desktop, scroll past hero — sticky quote button appears, click goes to /quote.
- [ ] Tap WhatsApp float — opens WhatsApp with pre-filled message.
- [ ] Submit form, check dataLayer — `cta_quote_submit` event fires with non-zero `value`, `currency: "GBP"`, postcode prefixes (not full postcodes).
- [ ] Land on `/?gclid=test123`, close tab, return next day, submit form. Check dataLayer — gclid persists in the conversion event.
- [ ] Submit form with consent denied — Plausible event fires, GA4/Meta events do not.
- [ ] Postcode checker — match → "Yes, we cover X" + link, no-match → "We don't regularly cover X" + /quote link, invalid → error message.

## Versioning

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-05-06 | Initial extraction from Marley Moves rebuild |
