---
name: local-business-content-audit
description: Use to audit customer-facing content on a local service business site for the content-rule violations that signal AI-written copy to readers and to Google. Catches banned characters (em-dash —), banned AI tells (moreover, furthermore, leverage, robust, navigate-as-verb, delve, harness, unleash, "in today's fast-paced world", "elevate", "unlock the power of", "seamless experience", "cutting-edge", "tapestry"), USP repetition (same selling point repeated on a single page), cross-page boilerplate (paragraphs that appear on multiple pages), UK English drift (color → colour, organize → organise), and address-display rule violations (full street address or 4-char postcode in body copy). Re-runnable script. Catches what the eye misses on a 100-page site.
---

# local-business-content-audit

Re-runnable audit script for the content rules. Pre-PR check. Catches
the AI-tell sentences and addressing slips that the eye skims over on
a 100-page site.

## When to use this

- Before opening any PR that changes customer-facing content
- Periodic full-site audit (monthly recommended)
- After importing content from another source (WordPress migration,
  AI-generated drafts)
- Before pre-launch checklist run

## What it checks

### Banned characters (hard fail)

| Char | Why banned |
|---|---|
| `—` (em-dash) | High-tells AI-written copy. Use commas, colons, parens, or rephrase. Project allows it ONLY in source code comments, not customer-facing strings. |

### Banned AI tells (hard fail)

A non-exhaustive list, expand per project. Default set:

```
moreover, furthermore, additionally (as paragraph opener), leverage,
robust, navigate (as verb meaning find way through), delve, harness,
unleash, in today's fast-paced world, elevate, unlock the power of,
seamless experience, cutting-edge, game-changer, tapestry,
underscore (as verb), pivotal, foster (as verb), curated,
plethora, myriad, embark on, journey (metaphorical),
in the realm of, at the heart of, world of (as in "world of taxis")
```

Words like `navigate`, `harness`, `foster` aren't always AI-tells —
context matters (`navigate` literal direction is fine, `navigate the
challenges of moving` is not). The audit flags candidates; the
operator confirms.

### USP repetition (warning)

If the same selling point ("5-star Google reviews", "fully insured",
"fixed prices") appears more than once on the same page, flag.
Trust strips and headers should land the USP once, not three times.

### Cross-page boilerplate (warning)

If a paragraph >= 30 words appears verbatim on more than one page,
flag. Service descriptions should be specific to the service; town
descriptions should be specific to the town.

### UK English (default — toggleable per project)

| US | UK |
|---|---|
| color | colour |
| organize | organise |
| realize | realise |
| analyze | analyse |
| catalog | catalogue |
| traveling | travelling |
| labor | labour |
| favorite | favourite |
| neighbor | neighbour |
| program (software ok, "TV program" not) | programme |
| truck | lorry |
| sidewalk | pavement |
| zip code | post code |
| highway | motorway |

### Address-display rule violations (hard fail)

For each project, the bootstrap-time CLAUDE.md captures:
- Full street address (e.g. "Ash Cottage, Sherborne Causeway")
- 4-char inward postcodes (e.g. "SP7 9PX", "BA8 0TG")
- Deprecated address forms (e.g. "Brickfields Business Park", old
  yards no longer used)

The audit greps customer-facing files (excluding legal pages,
site-config, form placeholders, Sanity siteSettings) for any of
these strings. Hit = fail.

### Hardcoded growing numbers (warning)

If the audit finds `"22 reviews"`, `"500 happy customers"`, `"Since
1995"` etc. in JSX/MDX (anything that looks like a hardcoded count
or year), flag. These should come from `siteConfig` or Sanity, not
be hardcoded.

## Usage

```bash
node web/scripts/audit-content.mjs
```

Output looks like:

```
Auditing 67 customer-facing files...

✗ web/app/services/airport-transfers/page.tsx
  - Banned em-dash on line 47: "Fast — reliable — affordable"
  - AI tell "leverage" on line 89

✗ web/app/areas/sherborne/page.tsx
  - Address rule violation: "Sherborne Causeway" appears in body copy

✓ web/app/areas/shaftesbury/page.tsx
✓ web/app/services/station-runs/page.tsx
...

3 files failed audit (12 issues).
```

Exit code 0 if clean, 1 if any failures (so CI can gate PRs on it).

## What the audit does NOT check

- Spelling beyond the US/UK list (use `cspell` or similar)
- Grammar (use a separate tool)
- SEO meta tags (use `local-business-pre-launch-checklist`)
- Schema validation (use `local-business-schema-graph`)
- Image alt text (worth adding — see TODO in script)

## Configuration per project

The audit reads `web/scripts/.audit-config.json` (created at bootstrap):

```json
{
  "bannedAddressStrings": [
    "Ash Cottage",
    "Sherborne Causeway",
    "SP7 9PX",
    "BA8 0TG",
    "Brickfields Business Park",
    "Templecombe"
  ],
  "addressLegalAllowlistPaths": [
    "app/privacy-policy",
    "app/terms-conditions",
    "lib/site-config.ts"
  ],
  "extraBannedAITells": [],
  "ukEnglish": true,
  "scopeGlobs": [
    "app/**/*.{tsx,ts,mdx,md}",
    "components/**/*.{tsx,ts}",
    "lib/**/*-content.ts"
  ],
  "skipGlobs": [
    "**/*.test.*",
    "**/node_modules/**"
  ]
}
```

Edit per project. The script falls back to sensible defaults if
the file's missing.

## See `scripts/audit-content.mjs` for the implementation.

## Lessons from the Marley rebuild (provenance)

- Em-dash purge took an entire session (session 6, commit `ab5f058`)
  to clear across 30+ files. Now the audit script catches new
  introductions on every PR.
- Address rule was added 2026-05-01 (revised 2026-05-01 v2) after
  Marley moved from the Brickfields yard to Ash Cottage. Customer-
  facing copy still had the old SP8 4PX postcode in 11 places.
  Audit now grep-checks against the deprecated list.
- Hardcoded review counts ("22 reviews") appeared 4 times across
  the site at one point. Centralised to `siteConfig.googleReviews`
  in session 5; audit now catches new hardcoded numbers.
