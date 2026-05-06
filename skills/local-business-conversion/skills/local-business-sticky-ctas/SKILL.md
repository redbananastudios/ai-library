---
name: local-business-sticky-ctas
description: Use when adding or auditing the persistent CTA chrome on a local business site. Installs the four floating components — MobileCallBar (full-width red bar at viewport bottom on mobile, every page except home), MobileQuoteStickyBar (charcoal bar with "from £X" anchor + scroll-to-form CTA, home page only, hides when #hero-form is in view), StickyQuoteButton (desktop floating "Get a Quote" pill that fades in past 600px scroll), WhatsAppFloat (green circular icon, desktop bottom-right, fixed) — with the z-index discipline + path-aware rendering rules that prevent stacked overlap. Plus the TrustStrip rating-only-no-count rule that lives in this same chrome layer. Pairs with `local-business-conversion-analytics` for the click-tracking events.
---

# local-business-sticky-ctas

The persistent CTA chrome layer. Four floating components plus the TrustStrip pattern. Z-index disciplined so multiple components don't stack. Path-aware so the home page surfaces a different CTA than interior pages.

## When to use this

- New project — adding the conversion chrome (after `local-business-lead-form`).
- Existing site has competing sticky elements that overlap on mobile.
- Existing site has hardcoded review counts in trust strip / hero copy (the count grows weekly — replace with rating-only).

## The four floating components

### `MobileCallBar` (every interior page, mobile only)

Full-width red bar fixed at viewport bottom. Tap → phone dialler. Renders on every route EXCEPT `/`. Why exclusion: the home page has its own MobileQuoteStickyBar which pulls users to the hero form rather than straight to a phone call.

```tsx
"use client";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
export function MobileCallBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <a
      href={`tel:${siteConfig.primaryPhoneTel}`}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-mm-red text-white text-center py-4 text-[15px] font-semibold tracking-wide shadow-[0_-6px_24px_rgba(0,0,0,0.12)]"
      data-analytics-event="phone_click"
      data-analytics-source="mobile-sticky"
    >
      Call {siteConfig.primaryPhone} for a free quote
    </a>
  );
}
```

Reference: `references/MobileCallBar.tsx`.

### `MobileQuoteStickyBar` (home only, mobile only)

Charcoal bar at viewport bottom on home page only. Shows the "from £X" pricing anchor on the left (cheap entry-level service price, drives conversion via anchoring) + a "Get my quote ↓" red CTA that scrolls to `#hero-form`.

Hides itself once `#hero-form` is in viewport (IntersectionObserver with `rootMargin: '-30% 0px 0px 0px'`) so users aren't fighting a floating bar while filling the form. Also hides on `/thanks` (path check).

Fires `mobile_sticky_cta_tap` on click for funnel tracking.

Reference: `references/MobileQuoteStickyBar.tsx`.

### `StickyQuoteButton` (desktop only, all pages)

Hidden by default. Appears once the user scrolls past 600px (past the hero). Right-side floating pill with "Get a Quote →". Hidden on mobile (the MobileCallBar / MobileQuoteStickyBar already cover that slot).

Click → navigates to `/quote/`. Fires `cta_click { source: 'sticky-quote' }` via `data-analytics-source` attribute (auto-captured by `wireGlobalAnalytics()` from the analytics sub-skill).

Reference: `references/StickyQuoteButton.tsx`.

### `WhatsAppFloat` (desktop only, all pages)

Green circular WhatsApp icon, fixed bottom-right, lower z than StickyQuoteButton (so it doesn't fight for the same screen position). Click opens WhatsApp via `wa.me/<number>?text=<prefilled>`. Pre-fill from `siteConfig.whatsappPrefilled` (operator-tuned message, e.g. "Hi, I'd like a quote for...").

Hidden on mobile (the dedicated mobile-bottom-bar already covers messaging via the call action).

Reference: `references/WhatsAppFloat.tsx`.

## Z-index + visibility discipline

| Component | Mobile | Desktop | z-index |
|---|---|---|---|
| MobileCallBar | visible (except `/`) | hidden | 50 |
| MobileQuoteStickyBar | visible on `/` only, hides when #hero-form visible | hidden | 50 |
| StickyQuoteButton | hidden | visible past 600px scroll | 40 |
| WhatsAppFloat | hidden | visible always | 40 |

Rules:
- Only ONE component is visible per breakpoint × path combination at any time.
- Mobile bottom bar (call OR quote) takes z-50 because it's the primary mobile conversion path.
- Desktop floats (StickyQuoteButton, WhatsAppFloat) sit at z-40, side-by-side at the bottom-right corner — `right-6` for WhatsApp, `right-24` for the quote button so they don't overlap horizontally.

## TrustStrip — rating, never count

A separate component (technically a content section, not a sticky CTA, but lives in the same chrome / trust-signal layer):

```tsx
// Display the rating only. The literal review count is banned in customer-
// facing copy (count grows weekly; the number rotting in HTML is worse than
// not having it). Rating stays at 5.0 across every town and is safe to show.
const { rating: REVIEW_RATING } = siteConfig.googleReviews;
```

Eight-tile grid showing operator's verifiable trust signals: insurance figures (£2.5m PL, £50k goods in transit), response time (2-hour quote), pricing model (fixed-price), in-house crews, UK-wide reach, family-run, and the rating tile (`5.0★ Google Reviews`, NO literal count).

Reference: `references/TrustStrip.tsx`.

### Why no count

Marley's review count grows weekly. Hardcoding "47 reviews" rots the moment the count moves. Sourcing from Sanity helps but the count still drifts between deploy cycles. Cleanest answer: don't display the literal count — show the rating, link to GBP for the live count.

## Process — when invoked

```
1. Confirm prerequisites:
   ├─ siteConfig has primaryPhone, primaryPhoneTel, whatsappNumber,
   │  whatsappPrefilled, googleReviews.rating
   ├─ Hero form has id="hero-form" (for IntersectionObserver target)
   └─ Analytics layer installed (track() exists, wireGlobalAnalytics() runs)

2. Drop the four components into web/components/chrome/.

3. Mount in app/layout.tsx (or equivalent root):
   <MobileCallBar />
   <MobileQuoteStickyBar />
   <StickyQuoteButton />
   <WhatsAppFloat />

4. Adapt design tokens (mm-red, mm-charcoal, mm-cream-deep) to the project.

5. Test on real device (iOS + Android):
   ├─ Home page: charcoal MobileQuoteStickyBar visible, taps scroll to #hero-form
   ├─ Home page after scrolling to form: bar hides
   ├─ Interior page: red MobileCallBar visible, taps open dialler
   ├─ Desktop: StickyQuoteButton appears past 600px scroll
   ├─ Desktop: WhatsAppFloat visible, click opens WhatsApp with pre-filled text

6. Set up the TrustStrip with operator-supplied insurance figures and other
   verifiable claims. Rating from siteConfig. NO literal count.

7. Verify in dataLayer:
   ├─ phone_click fires on MobileCallBar tap
   ├─ mobile_sticky_cta_tap fires on MobileQuoteStickyBar tap
   ├─ cta_click { source: 'sticky-quote' } fires on StickyQuoteButton click
   ├─ whatsapp_click fires on WhatsAppFloat click
```

## Anti-patterns

- **Three floating elements stacked at the same screen position.** Only one mobile bottom-bar should ever render at a time. The path check on MobileCallBar (skip on `/`) is the mechanism — don't drop it.
- **Hardcoded review counts.** The count grows weekly. Show rating only.
- **Using StickyQuoteButton on mobile.** Mobile call bar / mobile quote bar already cover that slot. Stacking burns z-index real estate.
- **WhatsApp float on mobile.** Mobile users with WhatsApp installed get the share-sheet directly via the dedicated mobile bottom bar. Adding a third floating element creates UX clutter.
- **Forgetting `data-analytics-source`.** The sticky button's analytics depends on `wireGlobalAnalytics()` matching the source attribute — without it, the click counts as a generic `cta_click` and the funnel report can't distinguish sticky-button clicks from header-button clicks.
- **MobileQuoteStickyBar on /thanks.** Path check ensures it doesn't render after submission.
- **Z-index inflation.** Any component creeping above z-50 fights with the cookie banner / modal layer. Cap at 50 for floating CTAs.

## Provenance

Marley Moves source files:
- `O:/marley/site/web/components/chrome/MobileCallBar.tsx`
- `O:/marley/site/web/components/chrome/MobileQuoteStickyBar.tsx`
- `O:/marley/site/web/components/chrome/StickyQuoteButton.tsx`
- `O:/marley/site/web/components/chrome/WhatsAppFloat.tsx`
- `O:/marley/site/web/components/sections/TrustStrip.tsx` (sister pattern, rating-only-no-count)
