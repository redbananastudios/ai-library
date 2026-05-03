---
name: local-business-pre-launch-checklist
description: Use before cutting over a local service business site to its production domain. Verifies the launch-blocking items and walks through the cutover sequence — Vercel preview noindex gates, INDEXING_ENABLED env at the moment of cutover (without it the site stays noindex,nofollow after DNS flip), canonical hostname, redirect manifest from old sitemap (every legacy URL must resolve 200 or 308), sitemap, robots, OG/favicon/manifest, tracking IDs swapped to live accounts, Resend domain verification, Google Places (and other) API key restrictions before launch, low DNS TTL 24h before cutover, parallel old-site keep for 30 days as rollback. Catches the "we forgot to flip INDEXING_ENABLED and the site deindexed" failure mode.
---

# local-business-pre-launch-checklist

The launch-readiness gate. Run this 7 days before cutover to surface
blockers, then again the morning of cutover.

## When to use this

- 7 days before planned cutover (initial gap-analysis pass)
- Morning of cutover (final verification + walks through cutover steps)
- Post-cutover (verifies the live site is in the expected state)

## Pre-cutover gap analysis (run 7 days out)

Every item below must be ✓ green or have a clear plan to be green
by cutover. Anything ⏳ amber needs an explicit owner and ETA. Any
🛑 red blocks cutover.

### Tracking & analytics

- [ ] GTM container ID is the operator's container, not the
      developer's (audit `tracking` doc in Sanity)
- [ ] GA4 property is the operator's property
- [ ] Meta Pixel ID, if used, is the operator's pixel
- [ ] Google Ads conversion tag wired up (if PPC planned)
- [ ] Server-side conversion mirror (Meta CAPI / GA4 Measurement
      Protocol), if needed

### Email (Resend)

- [ ] Resend domain (e.g. `send.example.com`) DNS verified
      ("Verified" status in Resend dashboard)
- [ ] `RESEND_API_KEY` set in Vercel Production env
- [ ] `RESEND_FROM_ADDRESS` set in Vercel Production env (e.g.
      `quotes@send.example.com`)
- [ ] Test quote sent from Vercel preview, arrives at
      `siteConfig.contact.email`

### API keys (security)

- [ ] Google Places API key (if using address autocomplete) restricted:
      - HTTP referrer: `example.com/*` + `*.example.com/*`
      - API restriction: Maps JavaScript API + Places API only
- [ ] Any other public API keys (Mapbox, Algolia, etc.) restricted
      to canonical domain
- [ ] Sensitive keys (Sanity write token, Resend) NOT in the JS
      bundle (server-only, no `NEXT_PUBLIC_` prefix)

### SEO foundation

- [ ] `app/robots.ts` AI crawler allowlist live
      (run `local-business-aeo-stack` to verify)
- [ ] `app/sitemap.ts` includes every public URL
- [ ] `app/llms.txt` and `app/llms-full.txt` return 200 with real
      content (not placeholders)
- [ ] OG image (1200×630) per service + per area + home minimum
- [ ] Favicon set, apple-touch-icon, web manifest
- [ ] Schema graph clean (run `local-business-schema-graph` audit)

### Content

- [ ] `local-business-content-audit` returns 0 hard fails
- [ ] All area pages pass the "remove location name" test
      (run `local-business-area-page-enricher` audit)
- [ ] Address-display rule clean across customer-facing copy
- [ ] No hardcoded growing numbers in copy

### Redirects (the big one)

- [ ] Old site sitemap fetched, parsed → redirect list compiled
- [ ] Every old URL has a 308 mapping in `next.config.ts` or
      a `200` because the path is unchanged
- [ ] `web/scripts/test-redirects.mjs` run against Vercel preview,
      every redirect returns 308 to the expected target

### Indexing gate (the cutover-day flip)

- [ ] Vercel Production env has `INDEXING_ENABLED=true` SET
      ⚠️ Do NOT set this until the moment of cutover. Setting it
      before DNS flip with the canonical hostname pointing at
      Vercel is fine; setting it while still on a Vercel preview
      domain has no effect because the canonical-host check fails.
      The risk is reverse: forgetting to set it after DNS flip.
- [ ] Canonical hostname in `lib/site-config.ts` matches the
      production domain exactly (no trailing slash, no www if site
      is apex, etc.)
- [ ] `lib/seo/canonical.ts` `isCanonicalDeploy()` returns true
      when both gates pass

### Off-site presence (parallel operator track)

- [ ] Bing Webmaster Tools — verify + sitemap submit (critical for
      ChatGPT search)
- [ ] Google Business Profile claimed, optimised (GBP-optimise skill)
- [ ] Trustpilot profile claimed (if not already)
- [ ] Industry directory listings (Checkatrade, Yell, Thomson Local,
      etc.) — Tier 1 free citations
- [ ] Old social bios updated to new URL

## Cutover sequence (day-of)

Execute in order. Each step is ~5–15 min.

1. **24h before**: lower DNS TTL on the canonical domain at registrar
   (IONOS / Cloudflare / etc.) to 300s.
2. **Cutover hour**: at registrar, point A record / CNAME to Vercel
   (`cname.vercel-dns.com` or the project's Vercel-supplied target).
3. In Vercel project Settings → Domains → add the canonical domain
   as Production domain.
4. **Set `INDEXING_ENABLED=true`** in Vercel Production env vars.
5. Trigger a redeploy — empty commit OR Vercel dashboard "Redeploy".
   This is required because env var changes don't auto-redeploy.
6. Verify SSL cert auto-provisions (~1–5 min). If stuck, retry from
   Vercel dashboard.
7. Hit the canonical domain in incognito. Confirm new site loads.
8. Spot-check 3–4 redirects from the legacy sitemap — paste old URL,
   confirm 308 → new path → 200.
9. Submit a real lead through the form. Confirm email arrives at
   `siteConfig.contact.email` from `RESEND_FROM_ADDRESS`.
10. Submit the new sitemap to Google Search Console.
11. Submit the new sitemap to Bing Webmaster Tools (often missed).
12. Keep the old site running in parallel for 30 days as a rollback
    option (don't decom DNS pointers to the old IP).

## Post-cutover verification (T+24h)

- [ ] Google Search Console reports the new site (sitemap fetched,
      pages discovered)
- [ ] Bing Webmaster Tools same
- [ ] Lighthouse SEO ≥ 95 on home, one service, one area
- [ ] Lighthouse Performance — note any LCP regressions vs preview
      (canonical domain TTFB usually improves over previews)
- [ ] axe accessibility scan — no critical issues
- [ ] Real search query test: search "<brand>" in incognito —
      site appears, sitelinks reasonable

## The two failure modes this catches

### Failure 1: "We deindexed the site at cutover"

Symptom: 24h after cutover, the site shows `noindex, nofollow` in
view-source. Within a week, organic traffic falls off a cliff.

Cause: `INDEXING_ENABLED` was never set to `true` in Vercel
Production env, OR was set but no redeploy was triggered.

Fix: set the env, trigger redeploy, wait. (Damage is recoverable
within days as long as caught quickly.)

### Failure 2: "We lost all our backlink equity"

Symptom: 3 weeks after cutover, organic rankings have fallen across
the board. Backlinks now point at 404s or 200s with the wrong
content.

Cause: redirect manifest was incomplete. Some legacy URLs return
404, or worse, return 200 with the new home page (which Google
treats as soft-404).

Fix: fetch old sitemap, audit every URL on the new domain, add
missing 308s, redeploy. Submit a Search Console URL inspection
for each fixed URL to speed reindexing.

## Lessons from the Marley rebuild (provenance)

- Marley nearly hit Failure 1 in session 5 — preview deploys had
  briefly leaked into Google's index because the noindex gate
  was VERCEL_ENV-only. Hardened across sessions 5–6 with the
  belt-and-braces gate (canonical.ts + middleware) so the failure
  mode at cutover is now only "forgot to flip INDEXING_ENABLED",
  which this checklist catches.
- Marley's redirect manifest covers 106 URLs from the legacy WP
  sitemap. The `web/scripts/test-redirects.mjs` is the canonical
  example of automated redirect verification.
- The "keep WordPress running for 30 days" rule saved a real
  Marley emergency mid-session 7 when a discovered SEO bug needed
  a half-day to fix; the old site held customer traffic during
  the freeze.
