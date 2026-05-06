# DataForSEO Keyword + Brief Pipeline

Cache-backed five-phase research pipeline that turns competitors + geography + priority URLs into:

- `master_keywords.csv` — keyword universe with volume, KD, CPC, intent, competitor coverage
- `map_pack_competition.csv` — Google Maps top-3 per (town × template), with operator-flag column
- `content-briefs/<page>.md` — per-page content briefs (SERP snapshot, consensus H2s, content gaps, schema, internal links, geo-ambiguity warnings)
- `summary.md` — executive summary (top-N opportunity, fastest wins, defer list, content gaps)
- `flags.md` — directory-dominated keywords (won via citations, not pages)

## What's in the box

```
dataforseo-keyword-pipeline/
├── prompt.md                       ← the skill (invoked via Claude's Skill tool)
├── README.md                       ← this file
├── CHANGELOG.md
├── source.json
├── spec.yaml
└── references/
    └── run-seo-research.mjs        ← the runner script — copy to <project>/seo-data/scripts/
```

## Stack assumptions

- **Node.js ≥18** (for global `fetch`)
- **`cheerio`** for SERP page extraction (`npm install cheerio` in the project's `seo-data/` folder)
- **DataForSEO Labs + SERP API** account with `ranked_keywords`, `related_keywords`, `bulk_keyword_difficulty`, `serp/google/organic`, `serp/google/maps` access
- **Credentials** (`DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`) sourced into env before run

The pipeline is stack-agnostic from the deployed site's perspective — `seo-data/` lives at project root, separate from `web/`/`studio/`/etc., and stays out of the deployed build.

## Configuration

The reference script in `references/run-seo-research.mjs` has a constants block at the top (lines ~20–80). Per-project tuning required:

| Constant | Tuning level | Notes |
|---|---|---|
| `LOCATION_CODE`, `LANGUAGE_CODE` | Always | DataForSEO codes for the operator's market |
| `TOWNS` | Always | Service area towns, slug + name |
| `COMPETITOR_DOMAINS` | Always | 3–6 direct competitors, top organic + top map-pack |
| `SERVICES` | Always | Service catalogue, slug + seed keyword + label |
| `HUB_PAGES` | Always | Priority non-town/service pages (home, hub, flagship service) |
| `IN_AREA_PLACES` regex | Always | Recognised places in the service area + nearby + non-place generics |
| `OUT_OF_AREA_PLACES` regex | Always | UK places outside the service area — most important single regex |
| `SERVICE_INTENT` regex | Always | Tokens that mark a keyword as commercially relevant to what the operator sells |
| `DIRECTORY_HOSTS` regex | Always | Industry-specific directory sites |
| `NATIONAL_BRANDS` regex | Always | National-brand competitors (signals slow-climb keywords) |

The skill prompt (`prompt.md`) walks through the full configuration step. The script comments cite each constant's role.

## Cost

Marley's first full run (16 towns, 5 competitors, 5 services, 3 hub pages):
- 130 API calls
- ~$3.20 USD
- ~220 free cheerio page fetches
- 499 keywords surfaced
- 96-row Map Pack census
- 20 content briefs

Re-runs after the cache is warm = zero spend.

## Provenance

Distilled from `O:/marley/seo-data/scripts/run-seo-research.mjs` (1099 lines, single script). Outputs at `O:/marley/seo-data/`. Documented in `O:/marley/seo-data/README.md`.
