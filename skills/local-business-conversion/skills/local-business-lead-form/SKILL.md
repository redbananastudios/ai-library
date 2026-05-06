---
name: local-business-lead-form
description: Use when adding or refactoring the lead/quote/contact form on a local business site. Implements either the two-step hero quote form (low-friction step 1 — name/email/from/to with Google Places address autocomplete; step 2 — phone/date/property-size/referrer) or the single-step `/quote/` page form, plus the service-area PostcodeChecker pre-form widget, plus the dual-write Resend + CMS server action that emails the operator AND persists every submission for audit. Tracks form-field abandonment so the operator can see which field is killing conversions. Pairs with `local-business-conversion-analytics` for the event-firing layer.
---

# local-business-lead-form

The lead-capture form pattern. Two flavours — two-step (hero, low-friction) and single-step (/quote/, deeper intent). Plus the service-area pre-form widget. Plus the server-side dual-write that ensures every submit reaches the operator inbox AND lands in the audit-trail CMS.

## When to use this

- New project — adding the first form (after `local-business-site-bootstrap` and `local-business-cms-seed`).
- Existing site has a single-step hero form with high abandonment — refactor to two-step.
- Adding a postcode checker for service-area validation.
- Adding Google Places autocomplete to existing address fields.
- Wiring a server action with email + CMS dual-write where currently only one path exists.

## The two-step hero form

**Step 1** is client-only (no server hit). Captures name, email, from address, to address. Uses Google Places `Autocomplete` (legacy API — see Gotcha #1) on the address fields with UK-restricted (`componentRestrictions: { country: "gb" }`) suggestions.

**Step 2** captures phone, date of move, property size, optional referrer. On submit, calls the server action and redirects to `/thanks?name=<first>` on success.

The same component renders on both desktop and mobile — field stack switches from horizontal grid (`md:grid-cols-[1fr_1fr_1fr_1fr_auto]`) to vertical stack (`grid-cols-1`) at the breakpoint.

Reference: `references/HeroQuoteForm.tsx` (full Marley implementation).

### Why two-step

Hero-form abandonment data on Marley's pre-refactor single-step showed the `preferredDate` field was the friction point. Splitting it: step 1 captures a name + email + addresses (low cognitive load, recoverable in step 2 if the user falls off). The split increased step-1 completion materially while preserving lead richness for step-2 completers. Both step-1 (without conversion) and step-2 (with conversion) emit dataLayer events so the operator can see funnel drop-off.

### Step-1-only-submit fallback (optional)

If the operator wants to capture step-1 abandons as soft leads, the step-1 data can be POSTed silently as a "lead-light" record on form unmount, with the conversion fully credited only on step-2 submit. Marley didn't ship this — they decided the cleaner conversion signal was worth the lost soft leads.

## The single-step `/quote/` form

For visitors who explicitly clicked through from a CTA. Higher self-selected intent, more fields tolerated. Reference: `references/QuoteForm.tsx`.

Includes:
- Name + phone + email
- From postcode + to postcode + property size + preferred date (date-picker)
- Services array (multi-select toggle chips)
- Free-text notes textarea
- WhatsApp alternative footer link (for users who'd rather send photos than fill the form)

## AddressAutocomplete

Google Places legacy `Autocomplete` API wrapped around a regular `<input>`. Why legacy and not the new `PlaceAutocompleteElement` web component:

- The new element has a Shadow DOM that resists design-token styling — every other field on the page is styled with project-scoped Tailwind utilities, the new element fights this.
- The classic API attaches a dropdown to a regular input, so the input shares all field classes.
- The classic API is fully supported (Google's deprecation has been deferred; the legacy API remains documented for new keys).

Cached single-script loader so multiple autocomplete inputs on a page only inject the script once. UK-only address restriction. Extracts the postcode from `address_components` and emits it via `onPlaceSelected({ formattedAddress, postcode })`.

Reference: `references/AddressAutocomplete.tsx`.

## PostcodeChecker

Service-area validation widget. Lives on `/contact/` and the home coverage section. Outcode-only matching against the operator's per-area `outcodes[]` array (from CMS).

Three result states:
- **match**: "Yes, we cover X" + link to that area's page
- **no-match**: "We don't regularly cover X — but we do long-distance" + link to /quote
- **invalid**: "That doesn't look like a UK postcode"

Fires `postcode_check { result: 'match' | 'no_match' | 'invalid', outcode, town_slug? }` for PPC + Meta optimisation. A user who's checked their postcode and matched a town we cover is a strong conversion predictor.

Reference: `references/PostcodeChecker.tsx`.

## Server action — Resend + CMS dual-write

Single Next.js server action handles every form submit. Three responsibilities:

1. **Validate** required fields (name + phone minimum). Return `{ ok: false, error }` if missing.
2. **Send email via Resend** — `from: process.env.RESEND_FROM_EMAIL`, `to: process.env.RESEND_TO_EMAIL`, `replyTo: data.email`, subject: `New quote request from <name> (<from> → <to>)`, plain-text body via `renderEmail()`. If Resend fails, log + continue (don't fail the user-facing submit).
3. **Persist to CMS** — write a `quoteSubmission` document to Sanity with all form data + `submittedAt` ISO timestamp + `status: "new"`. If Sanity write fails, log + continue.

Always returns `{ ok: true }` if either path succeeded. Returns `{ ok: false, error }` only on validation failure or if both downstream paths failed and we want to surface the error.

Reference: `references/submit-quote.ts`.

### Required env vars

```
RESEND_API_KEY              # Resend API key
RESEND_FROM_EMAIL           # Verified sender, e.g. "quotes@send.example.co.uk"
RESEND_TO_EMAIL             # Operator's inbox, e.g. "hello@example.co.uk"
SANITY_API_READ_TOKEN       # Sanity write token (named "read" historically, also covers writes)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY    # For AddressAutocomplete
```

Per `local-business-pre-launch-checklist`, the Google Places key MUST be referrer-restricted before launch.

## Form-field abandonment tracking

Both forms track:

- `form_field_focus` (event, `location: 'hero_form' | 'quote_page_form'`, `field`) — fires on first focus
- `form_field_abandon` (event, `location`, `first_focused_field`, `last_focused_field`) — fires on unmount if `submittedRef.current === false`

Surfaces the field where abandonments cluster. Watch in GA4 / Plausible after a couple of weeks of traffic.

## Process — when invoked

```
1. Confirm prerequisites:
   ├─ siteConfig has primaryPhone, primaryPhoneTel, whatsappNumber, whatsappPrefilled
   ├─ Sanity has quoteSubmission schema (or equivalent)
   ├─ Resend domain verified (DNS, see local-business-pre-launch-checklist)
   ├─ NEXT_PUBLIC_GOOGLE_PLACES_API_KEY in env (will be restricted at launch)
   └─ Analytics layer (`local-business-conversion-analytics`) installed —
      this skill calls track() and assumes it works

2. Decide form shape:
   ├─ Hero conversion surface? → two-step HeroQuoteForm
   ├─ Dedicated /quote/ page? → single-step QuoteForm
   └─ Both? → both, used in their respective contexts

3. Adapt component references from this skill's references/ folder:
   ├─ Match the project's design tokens (mm-* classes → project's tokens)
   ├─ Match the project's Sanity schema for quoteSubmission
   └─ Set the property-size + date + referrer options to the project's vocabulary

4. Wire AddressAutocomplete into the address fields (hero form only — quote
   page uses postcode inputs by design, less friction once user has chosen
   to commit).

5. Drop in PostcodeChecker on /contact/ and home coverage section. Pull
   per-area outcodes from CMS.

6. Test:
   ├─ Submit hero form step 1 → step 2 transition
   ├─ Submit step 2 → /thanks redirect + email arrives + Sanity write happens
   ├─ Submit /quote/ form → same outcome
   ├─ Postcode checker — feed 3 cases (match, no-match, invalid)
   ├─ Verify form_field_focus + form_field_abandon fire correctly (devtools
      → check window.dataLayer pushes)
```

## Anti-patterns

- **Single-step hero form.** Friction kills conversion in the highest-traffic surface. Use two-step.
- **Email-only submit (no CMS write).** Operator can't query "all leads from postcode SP7 last 30 days" from their inbox. Dual-write is non-negotiable.
- **CMS-only submit (no email).** Operator doesn't see leads in real-time, response time slips, conversion drops.
- **Skipping `replyTo`.** When the operator hits Reply on the lead email, they should reply directly to the customer, not back to `quotes@send.example.co.uk`.
- **Storing full postcodes in event payloads.** Outcode prefixes only (`SP7`, `BA8`). Avoids the "GA4 doesn't allow PII in event params" trap.
- **Trusting client-validation.** The server action re-validates `name + phone` minimum. Hidden fields and JS-disabled browsers can submit anything.
- **Not redirecting on success.** If the form silently swaps to a "thanks" message in-place, you lose the GA4/Meta `lead_thank_you_view` backup conversion event. Use a real /thanks route.
- **Showing literal review counts in the form footer.** Rating only. The literal count is banned in body copy.
- **Using the new `PlaceAutocompleteElement` web component instead of legacy `Autocomplete`.** Shadow DOM breaks design-token styling. Marley tried this — reverted to legacy.

## Provenance

Marley Moves source files:
- `O:/marley/site/web/components/sections/HeroQuoteForm.tsx`
- `O:/marley/site/web/components/forms/QuoteForm.tsx`
- `O:/marley/site/web/components/forms/AddressAutocomplete.tsx`
- `O:/marley/site/web/components/forms/PostcodeChecker.tsx`
- `O:/marley/site/web/app/actions/submit-quote.ts`

Two-step refactor was driven by `form_field_abandon` data showing `preferredDate` was the friction point in the original single-step form (Marley session 4–5 evolution). The Marley two-step redesign spec lives at `O:/marley/site/docs/superpowers/specs/2026-04-30-hero-quote-form-redesign-design.md`.
