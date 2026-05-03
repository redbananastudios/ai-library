---
name: local-business-cms-seed
description: Use after the Sanity studio is created (project ID known) but before any content work begins on a local service business site. Seeds the singleton documents (siteSettings, tracking, nav) and the owner author document with isOwner=true so the global Person JSON-LD resolves. Re-runnable — checks for existing documents and patches rather than duplicating. Pairs with local-business-site-bootstrap which scaffolds the studio + schemas.
---

# local-business-cms-seed

Seeds a fresh Sanity studio with the baseline documents the site needs
before any content work. Re-runnable.

## When to use this

- Bootstrap is done, studio exists, project ID is in `.env.local`
- No content has been added yet (or you're refreshing the singletons)
- Owner facts (name, jobTitle, knowsAbout) are known

If owner facts aren't known, ask once, then proceed. The author doc
needs `isOwner: true` for the global Person JSON-LD to resolve — without
it, the layout's Person emit returns null and `Organization.founder`
points at a non-existent `#person` entity.

## What it seeds

| Document | Notes |
|---|---|
| `siteSettings` (singleton) | brand, contact, addresses, GBP, review counts |
| `tracking` (singleton) | GTM, GA4, Meta Pixel — leave empty if not yet provisioned |
| `nav` (singleton) | primary nav + footer sections |
| `author` (one with `isOwner: true`) | owner Person — required for E-E-A-T |

## Usage

From the project root (where `web/` and `studio/` live):

```bash
node --env-file=web/.env.local scripts/seed-cms.mjs
```

The script is at `scripts/seed-cms.mjs` in this skill folder. Copy it
into the project's `web/scripts/` directory at bootstrap time, or run
it from this skill folder directly with the right env file.

## Required env vars

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_WRITE_TOKEN   ← write token, not the read token
```

The write token must be created in the Sanity dashboard with Editor
permissions. It's separate from the SANITY_API_READ_TOKEN that the
Next app uses.

## Re-runnable behaviour

- Singletons (`siteSettings`, `tracking`, `nav`) are upserted by
  hardcoded `_id` (e.g. `_id: 'siteSettings'`). Re-running patches.
- Owner author doc is upserted by a stable slug (e.g.
  `_id: 'author-owner'`). Re-running patches the existing doc; never
  creates a duplicate.

## Anti-patterns this prevents

- **Two owner documents** with `isOwner: true` causing the GROQ
  `[0]` selector to be non-deterministic
- **Forgetting tracking IDs** before launch — the script writes
  empty placeholders so missing IDs are visible in Studio rather
  than just missing
- **Duplicate siteSettings** — without a fixed `_id`, repeated seeds
  create silent duplicates that cause GROQ queries to return wrong
  data

## See `scripts/seed-cms.mjs` for the implementation.
