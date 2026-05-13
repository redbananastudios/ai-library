---
name: dataforseo-keyword-pipeline
description: Use when starting SEO content work on a new project (or refreshing keyword research on an existing one) and you have access to DataForSEO credentials. Produces a master keyword CSV (volume, KD, CPC, intent, competitor coverage), a Google Map Pack competition CSV (top-3 GBP slots per town × template, with `is_marley`-style operator flag), per-page content briefs (top-10 SERP snapshot, consensus H2s, recommended word count from top-3 average × 1.2, content gaps, schema recommendations, internal-link suggestions, geo-ambiguity warnings, directory-dominated SERP flags), and an executive summary with opportunity scores. Cache-backed (SHA256 of endpoint+body) so re-runs after the seed list is fixed cost zero. Phase-based, each phase independently runnable. Cost on Marley's first full run: ~$3.20 across 130 API calls. Use this BEFORE writing any area or service page so you know what each page needs to outrank.
---

# dataforseo-keyword-pipeline

Five-phase, cache-backed pipeline that turns a list of competitors, geography, and priority URLs into the data you need to make every content decision: which keywords to chase, which to defer, which Map Pack slots to challenge, what each page needs to include, where the geo-ambiguity traps are.

Distilled from Marley Moves' research run (`O:/marley/seo-data/`), where it produced 499 keywords, 96-row Map Pack census, 20 content briefs, and an executive summary in 130 API calls (~$3.20 USD).

## When to use this

- **New project**: before content is written. The briefs feed directly into [[ai-content-workflow]] and [[local-business-area-page-enricher]].
- **Existing project, content refresh**: re-run with the same seeds — you only pay for keywords that weren't cached.
- **Adding a town/service**: extend the `TOWNS` or `SERVICES` constants and re-run. Phases skip cached work automatically.
- **Quarterly health check**: re-run all phases, diff the summary against the previous quarter to catch SERP shifts.

## When NOT to use this

- The site is not a local business, agency, or content site (e.g. internal SaaS, booking platform). Volume + KD aren't the right signal.
- You only need a single keyword's SERP — use the DataForSEO dashboard manually, don't run the whole pipeline.
- You don't have DataForSEO credentials. The skill assumes pay-as-you-go API access.

## Required configuration (per project)

Before any phase runs, the operator hands you these. If anything is missing, ask once. Don't make them up.

| Constant | What it is | Marley example |
|---|---|---|
| `LOCATION_CODE` | DataForSEO location code | `2826` (United Kingdom) |
| `LANGUAGE_CODE` | DataForSEO language code | `"en"` |
| `TOWNS` | Array of `{slug, name}` for area pages | 16 Dorset/Somerset/Wiltshire towns |
| `COMPETITOR_DOMAINS` | 3–6 direct competitors (top organic + top map-pack) | `["dpsremovals.com", "johnsonsofshaftesbury.co.uk", ...]` |
| `SERVICES` | Array of `{slug, seed, label}` per service page | `[{slug:"house-removals", seed:"house removals dorset", label:"House Removals"}]` |
| `HUB_PAGES` | Priority non-town/service pages | home, hub, flagship service |
| `IN_AREA_PLACES` regex | Recognised places in the operator's service area | `/(gillingham|shaftesbury|...|dorset|somerset|...)/i` |
| `OUT_OF_AREA_PLACES` regex | UK places that are NOT served (used to filter SERPs and flag geo-ambiguity) | `/(london|manchester|kent|sussex|...)/i` |
| `SERVICE_INTENT` regex | Tokens that mark a keyword as commercially relevant to what the operator sells | `/\b(removal|moving|packing|storage|...)\b/i` |
| `DIRECTORY_HOSTS` regex | Directory-site hostnames to flag (Yell, Checkatrade, etc.) | varies per industry |
| `NATIONAL_BRANDS` regex | National-brand hostnames to flag for competition pressure | `/^(www\.)?(pickfords|britannia|bishopsmove)\./i` |

The reference script in `references/run-seo-research.mjs` is fully annotated; copy it to `<project>/seo-data/scripts/` and edit the constants block at the top.

## How to use

### 1. Set up the project's `seo-data/` folder

Crucially, this folder lives at **project root**, NOT under the deployed `web/` or `studio/` folder. It must stay out of the production build:

```
<project>/
├── seo-data/                    ← this folder
│   ├── package.json             ← {"type": "module", "dependencies": {"cheerio": "^1.0.0"}}
│   ├── scripts/
│   │   └── run-seo-research.mjs ← copy from references/, edit constants
│   ├── cache/                   ← gitignored
│   ├── content-briefs/          ← outputs
│   ├── master_keywords.csv      ← output
│   ├── map_pack_competition.csv ← output
│   ├── summary.md               ← output
│   ├── flags.md                 ← output (only if directory-dominated SERPs found)
│   └── README.md                ← document the project's specific constants
└── .gitignore                   ← add `seo-data/cache/` and `seo-data/node_modules/`
```

### 2. Configure credentials

```bash
# Credentials live in F:\My Drive\workspace\credentials.env
# Sourced via:
set -a && source <(grep -E "^DATAFORSEO_" "F:/My Drive/workspace/credentials.env") && set +a
```

`DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD` must both be set or the script exits.

### 3. Run a dry-run first

```bash
node scripts/run-seo-research.mjs all --dry-run
```

This walks every phase, prints planned API calls and estimated cost, but doesn't hit the API. Use this to confirm the constants are right before spending.

### 4. Run phases in order

```bash
node scripts/run-seo-research.mjs keywords    # Phase 1: build keyword universe
node scripts/run-seo-research.mjs serp        # Phase 2: SERP organic + page extraction
node scripts/run-seo-research.mjs mappack     # Phase 3: Google Maps top-3 per template
node scripts/run-seo-research.mjs briefs      # Phase 4: render per-page content briefs
node scripts/run-seo-research.mjs summary     # Phase 5: executive summary

# Or all at once
node scripts/run-seo-research.mjs all
```

Each phase reads from cache for any prior call with the same body, so re-running `all` after the cache is warm = zero spend. Force a fresh pull by deleting the matching `cache/api-*.json` file.

### 5. Hand the briefs to the content writer

Each `content-briefs/<page-id>.md` is a self-contained spec for that page. The writer (or AI assistant invoking [[ai-content-workflow]]) takes the brief plus the operator's voice memo and produces the page.

## What each phase does

### Phase 1 — keywords

1. **Pull competitor ranked keywords** (`/v3/dataforseo_labs/google/ranked_keywords/live`) for each domain in `COMPETITOR_DOMAINS`. Keywords ranking ≤50.
2. **Pull related keywords** (`/v3/dataforseo_labs/google/related_keywords/live`) for each seed: every `removals <town>` / `house removals <town>` / `removal company <town>` / `moving company <town>` template, plus `removals near me`, plus the seed for each service.
3. **Bulk fill keyword difficulty** (`/v3/dataforseo_labs/google/bulk_keyword_difficulty/live`) for any keyword with volume ≥10 and missing KD.
4. Filter junk (`junk regex`), drop volume-zero unless high-intent.
5. Write `master_keywords.csv` with columns: `keyword, search_volume_uk, cpc_gbp, competition, keyword_difficulty, intent_flag, ranking_competitors, sources`.

`intent_flag` derives from the SERP item types: commercial = local_pack present OR organic-only with no featured/PAA; informational = featured/PAA without local_pack; mixed otherwise.

### Phase 2 — serp

For every priority keyword (each `HUB_PAGES.primary`, each town's `removals <town>` template, plus the home secondary `removal company gillingham` and the four secondary-services seeds):

1. Pull top-10 organic results (`/v3/serp/google/organic/live/advanced`).
2. For each result URL, fetch the page (cheerio extraction) — capture H1, top 30 H2s, word count (after stripping nav/footer/aside/script/style), all `application/ld+json` schema `@type` values.
3. Cache both the SERP response and each page extraction (separate cache keys).
4. Count directory hosts in the top 10. If ≥4 → write to `flags.md` as a directory-dominated SERP (won via citations, not on-page content).

### Phase 3 — mappack

For every (town × template) combo — Marley used 16 towns × 2 templates = 32 calls — pull `/v3/serp/google/maps/live/advanced` and capture the top 3 results: business name, rating, review count, category, address, place_id, domain, plus an `is_<operator>` flag.

Output `map_pack_competition.csv`. **Most important single output of the pipeline.** Tells you instantly:
- Which Map Pack slots the operator already owns
- Which slots are owned by competitors with reviewable weakness (low rating, thin review count)
- Which towns need GBP optimisation versus citation-building

### Phase 4 — briefs

For every brief in `HUB_PAGES + TOWNS`, render `content-briefs/<id>.md` containing:

1. **Header** — URL, primary keyword + metrics, secondary keywords if any.
2. **Warnings** — directory-dominated, national-brand-pressured, geo-ambiguity (when ≥3/10 SERP titles reference an out-of-area place).
3. **Secondary keyword opportunities (volume ≥10)** — table of 12 keywords, half local-anchor-matching, half generic. Filtered to topical intent only (`SERVICE_INTENT` matches, `OUT_OF_AREA_PLACES` excluded).
4. **Top 10 SERP snapshot** — rank, domain, title, word count, schema types.
5. **Recommended word count** — top-3 average × 1.2.
6. **Required H2 sections (consensus across top 10)** — phrase signatures appearing in ≥2 of top 10, after stopword/H2-noise filtering. Bucketed on first 3 stopword-stripped tokens so "Why choose Armishaws" merges with "Why choose us".
7. **Topics covered by competitors (must include)** — cleaned H2 list (excluding nav noise, phone numbers, brand-only headings, place-list headings).
8. **Content gaps** — keywords with volume ≥20 whose tokens have <50% coverage in top-10 H1/H2 — easy outrank with depth.
9. **Schema types to add** — base (`LocalBusiness`, `BreadcrumbList`) + page-type-specific.
10. **Internal link suggestions** — pages that should link TO this page.

Plus `secondary-services.md` — light brief (top-10 SERP titles + word counts only) for non-flagship services.

### Phase 5 — summary

`summary.md` with:

1. **Top 20 by opportunity score** — `score = volume × intent_weight / (KD + 1)`. Intent weights: commercial 1.5, mixed 1.0, informational 0.4. KD=0 floored to 25 (DataForSEO returns 0 for thin SERP data, not "easy"). Filtered to `isMarleyTopical` (must match `SERVICE_INTENT`, must not match `OUT_OF_AREA_PLACES` without `IN_AREA_PLACES`, must not match `PURE_PLACE_NOISE`).
2. **5 fastest wins** — KD ≤35, volume ≥30, on-topic, not directory-dominated.
3. **5 to defer** — KD ≥60 OR ≥3/10 results are national brands.
4. **3 most important content gaps** — volume ≥30, top-10 avg word count <600, no FAQ schema in top 5.
5. **Directory-dominated SERPs** — list from `flags.md`.

## Gotchas / decisions baked in

- **KD=0 is "low data", not "easy"**. The summary script soft-floors KD=0 to 25. The master CSV preserves the raw value. If you treat raw 0 as easy, the opportunity scoring blows up.
- **Geo-ambiguity is real and costly**. Marley's `removals gillingham` partly serves Kent results because Kent's Gillingham (108k pop) outweighs Dorset's (13k). The brief flags this and recommends prominent disambiguation. The `OUT_OF_AREA_PLACES` regex is the single most important per-project tuning input.
- **Directory-dominated SERPs are won via citations, not pages**. The pipeline flags them in `flags.md` so they don't waste content effort. If Checkatrade/Yell/Reallymoving take ≥4/10 slots, on-page SEO alone won't crack the SERP — pair with citation-building.
- **National-brand pressure** (Pickfords/Britannia/etc.) signals a slow climb. Different from directory dominance — these brands have on-page content; you need depth + entity richness + freshness, not citations.
- **First-touch attribution**. The same keyword may appear in multiple sources (ranked_keywords from competitor A, related_keywords from seed B). The merge keeps every source in the `sources` column for audit, but only stores one canonical record per keyword.
- **CSV uses UTF-8 BOM** so Excel opens it without mangling. Don't strip it.
- **30-second timeout on cheerio page fetches**. Some competitor sites are slow or block bots. Failed fetches cache as `{status, error}` and don't re-attempt — fast-fail is preferable to retry storms.
- **The pipeline is idempotent**. Re-running `all` after the cache is warm = zero API calls. To force a fresh pull on a specific phase, delete the matching `cache/api-*.json` files.

## Anti-patterns

- **Don't skip the dry-run**. The cost estimator catches "I forgot to scope the seeds" before you spend $50 on related_keywords for 200 seed templates.
- **Don't commit `cache/` or `node_modules/`** to git. Both are gitignored in the reference script's expected layout.
- **Don't run this against a US/AU/etc. project without re-tuning the regexes**. `IN_AREA_PLACES` and `OUT_OF_AREA_PLACES` are UK-specific; non-UK projects need their own.
- **Don't treat `master_keywords.csv` as a target list**. It's the universe. The summary's "fastest wins" + "defer" tables and the per-page briefs are the actionable outputs.
- **Don't re-pull data when only the brief renderer changes**. Phases 1-3 are the API-spending phases; Phase 4 (briefs) and Phase 5 (summary) read from cache and are free.

## Provenance

Single-script form lives at `O:/marley/seo-data/scripts/run-seo-research.mjs` (1099 lines). Documentation in `O:/marley/seo-data/README.md`. Outputs in same folder. Marley's first full run produced 499 keywords, 96-row Map Pack, 20 content briefs, summary; 130 API calls; ~$3.20 spend; ~220 free direct page fetches via cheerio.
