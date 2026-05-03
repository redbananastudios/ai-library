---
name: local-business-site-bootstrap
description: Use when starting a new local service business website from an empty directory. Scaffolds Next.js 16 + Sanity v5 + Tailwind v4 + Vercel-ready config with the local-SEO baseline pre-wired (single Organization schema graph, canonical+noindex gates, redirect manifest stub, sitemap, robots with AI crawler allowlist, llms.txt + llms-full.txt routes, Resend contact form, Sanity schemas for area/service/post/faq/review/author/siteSettings/tracking, project CLAUDE.md with content rules). Pairs with local-business-cms-seed which runs after Sanity project is created.
---

# local-business-site-bootstrap

Scaffolds a new local service business site to the same baseline that
made Marley Moves ship cleanly. Run from an empty project directory.

## When to use this

- New project, empty directory
- Stack will be Next.js 16 App Router + Sanity v5 + Vercel + Resend
- Single-Organization local service business (taxis, plumbers,
  electricians, removals, cleaners, trades)

## What you need from the user before starting

Ask once, then bake them in. If unknown, leave a clearly-marked
placeholder in `site-config.ts` and add to a `TODO-BEFORE-LAUNCH.md`.

| Field | Example |
|---|---|
| Brand name | "First Taxis" |
| Legal name | "First Taxis Ltd" |
| Companies House number | "12345678" (or "TBC") |
| Owner name + role | "John Smith, Director" |
| Owner knowsAbout (3–8 areas) | "airport transfers, station runs, school runs" |
| Primary phone | "01747 637070" |
| Secondary phone (optional) | "01935 345050" |
| WhatsApp (optional) | "+44 7495 835006" |
| Email | "hello@firsttaxis.co.uk" |
| Primary registered address | full street + postcode |
| Marketed-as town + outward postcode | "Shaftesbury, SP7" |
| Service area towns (5–30) | comma list |
| Service catalogue (3–10) | comma list |
| Production domain | "firsttaxis.co.uk" |
| Old site domain (if migrating) | "wordpress.firsttaxis.co.uk" |
| Sanity project ID (if pre-created) | else "TBC" |
| Locale | UK English (default), US, AU |

## Scaffolding plan

You produce this directory structure:

```
<project-root>/
├── CLAUDE.md                      ← project rules + Current State
├── README.md
├── .gitignore
├── package.json                   ← workspace root
├── web/
│   ├── package.json
│   ├── next.config.ts             ← redirect manifest stub
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── .env.local.example
│   ├── app/
│   │   ├── layout.tsx             ← global schema graph + Person
│   │   ├── page.tsx               ← home
│   │   ├── sitemap.ts
│   │   ├── robots.ts              ← AI crawler allowlist
│   │   ├── llms.txt/route.ts
│   │   ├── llms-full.txt/route.ts
│   │   ├── api/
│   │   │   └── quote/route.ts     ← Resend contact form
│   │   ├── services/[slug]/page.tsx
│   │   ├── areas/[slug]/page.tsx  ← rename to /removals/, /coverage/, etc.
│   │   ├── insights/[slug]/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── quote/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── faqs/page.tsx
│   │   ├── privacy-policy/page.tsx
│   │   └── terms-conditions/page.tsx
│   ├── components/
│   │   ├── chrome/{Header,Footer,Topbar,AnnouncementBar}.tsx
│   │   └── layout/Breadcrumbs.tsx ← canonical BreadcrumbList JSON-LD source
│   ├── lib/
│   │   ├── site-config.ts         ← single source of truth
│   │   ├── seo/canonical.ts       ← INDEXING_ENABLED gate
│   │   ├── schema/jsonld.tsx      ← Org/Person/Service/Review schemas
│   │   ├── sanity/{client,queries,types}.ts
│   │   └── resend.ts
│   ├── middleware.ts              ← X-Robots-Tag noindex on preview
│   └── scripts/
│       ├── check-drafts.mjs
│       ├── test-redirects.mjs
│       └── audit-content.mjs
├── studio/
│   ├── package.json
│   ├── sanity.config.ts
│   ├── sanity.cli.ts
│   └── schemas/
│       ├── index.ts
│       ├── documents/
│       │   ├── area.ts
│       │   ├── service.ts
│       │   ├── post.ts
│       │   ├── faq.ts
│       │   ├── review.ts
│       │   ├── author.ts
│       │   ├── tag.ts
│       │   ├── category.ts
│       │   ├── siteSettings.ts
│       │   ├── tracking.ts
│       │   └── nav.ts
│       └── objects/
│           ├── seo.ts
│           ├── address.ts
│           └── socialLinks.ts
└── TODO-BEFORE-LAUNCH.md          ← anything user said "TBC" on
```

## Step-by-step

### 1. Confirm we're in an empty dir

```bash
ls -A | head
```

If non-empty, ask the user whether to proceed (could be re-bootstrapping).

### 2. Initialise Next.js 16 + Sanity v5 (workspace root)

```bash
npm init -y
# Edit package.json to be a workspace root with web/ + studio/
```

Set `package.json` workspaces:

```json
{
  "name": "<brand-slug>-site",
  "private": true,
  "workspaces": ["web", "studio"],
  "scripts": {
    "dev": "npm --workspace web run dev",
    "studio": "npm --workspace studio run dev",
    "build": "npm --workspace web run build",
    "build:studio": "npm --workspace studio run build",
    "deploy:studio": "npm --workspace studio run deploy"
  }
}
```

### 3. Scaffold web/

```bash
cd web
npx create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --turbopack --import-alias "@/*"
npm install @sanity/client @sanity/image-url next-sanity resend
```

Then **overwrite/create the following files** from
`templates/web/` in this skill folder:

- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/llms.txt/route.ts`
- `app/llms-full.txt/route.ts`
- `app/api/quote/route.ts`
- `lib/site-config.ts`
- `lib/seo/canonical.ts`
- `lib/schema/jsonld.tsx`
- `lib/sanity/client.ts`
- `lib/sanity/queries.ts`
- `lib/resend.ts`
- `middleware.ts`
- `next.config.ts`
- `.env.local.example`
- `components/layout/Breadcrumbs.tsx`

(See the `templates/` subfolder of this skill for the exact contents.)

### 4. Scaffold studio/

```bash
cd ../studio
npm create sanity@latest -- --template clean --typescript
# When prompted, use the project ID from user; dataset = production
npm install
```

Then **overwrite the schema files** from `templates/studio/` in this
skill folder. The schemas codify the document types the area-page,
schema-graph and CMS-seed skills assume.

### 5. Write project CLAUDE.md

Compose from this template, filling in the user-provided fields:

```markdown
# <Brand> — Project Operator Manual

Working folder: `<project-root>`
Live site: https://<production-domain>
GitHub: TBC

## Current State (<today's date> — bootstrap)

Site scaffolded from local-business-seo kit v1.0. Status:
- Next.js 16 + Sanity v5 wired up
- Schema graph live (Org + Person + Service + Review)
- AEO stack live (robots AI allowlist, llms.txt, llms-full.txt)
- Vercel preview default-noindex
- Redirect manifest stub in next.config.ts (no redirects yet)
- Resend contact form scaffolded (needs RESEND_API_KEY)
- TODO-BEFORE-LAUNCH.md tracks anything still TBC

Next steps:
1. Run `local-business-cms-seed` once Sanity project ID is wired up
2. Build area pages (`local-business-area-page-enricher`)
3. Build service pages (deep, town-anchored sub-sections)
4. Run `local-business-content-audit` before each PR
5. Pre-launch: `local-business-pre-launch-checklist`

## Confirmed business facts (source of truth)

- Brand: <brand>
- Legal: <legal>
- Company number: <number or TBC>
- Owner: <owner name + role>
- Primary phone: <phone>
- Email: <email>
- Registered address: <full street + postcode>
- Marketed-as: <town + outward postcode>
- Service area: <towns>

## Address-display rule (PERMANENT)

In customer-facing copy, only use "<marketed town>, <outward
postcode>". Never the full street address or 4-char inward
postcode in body copy. Full address only in:
1. /privacy-policy and /terms-conditions
2. lib/site-config.ts (JSON-LD source)
3. Form placeholders
4. Sanity siteSettings

## Content rules (PERMANENT)

1. No em-dashes (—) in customer-facing strings
2. No AI tells: moreover, furthermore, leverage, robust,
   navigate-as-verb, delve, harness, unleash, "in today's
   fast-paced world", "elevate", "unlock the power of",
   "seamless experience", "cutting-edge", "tapestry"
3. UK English (centre, colour, organise, realise, lorry, post code)
4. No on-page repetition of the same USP
5. No cross-page boilerplate paragraphs
6. Never claim credentials without evidence

## Stack

- Frontend: Next.js 16 App Router, React 19, Tailwind v4
- CMS: Sanity v5 (project <id>, dataset production)
- Email: Resend
- Hosting: Vercel
- DNS: TBC

## Workflow rule

Never `git push` without explicit "commit"/"ship"/"push" from the
operator. Vercel deploys cost money. Local edits + `npm run build`
to verify is fine.
```

### 6. Write TODO-BEFORE-LAUNCH.md

List every "TBC" the user gave. Examples:
- Sanity project ID
- Companies House number
- Resend API key + domain verification
- Production domain DNS
- Tracking IDs (GTM, GA4, Meta)
- Google Places API key restrictions

### 7. Initial commit

```bash
git init
git add -A
git commit -m "bootstrap from local-business-seo kit v1.0"
```

(Do NOT push — the operator pushes when they're ready.)

### 8. Report to the user

Output a tight summary:
- Folder structure (one-line tree)
- What's pre-wired
- What's TBC (point to TODO-BEFORE-LAUNCH.md)
- Next skill to run (`local-business-cms-seed` once Sanity is set up)

## Anti-patterns this skill prevents

- **Two-template problem**: only one `app/layout.tsx` is scaffolded.
  No nested layouts that conflict.
- **Vercel preview accidentally indexed**: middleware sets
  `X-Robots-Tag: noindex, nofollow` on every non-production
  hostname, AND `lib/seo/canonical.ts` returns `noindex` metadata
  unless `INDEXING_ENABLED=true` AND we're on the canonical
  hostname.
- **Canonical drift**: `metadataBase` in `lib/site-config.ts` is the
  single canonical hostname. All page metadata reads from it.
- **Hardcoded counts**: `site-config.ts` exposes
  `googleReviews: { count, rating }` so review numbers update in
  one place.
- **Address rule violations**: `site-config.ts` separates
  `address.full` (used by JSON-LD only) from `address.display`
  (used by all customer-facing components).

## Templates

See `templates/web/` and `templates/studio/` in this skill folder
for the exact file contents to write.
