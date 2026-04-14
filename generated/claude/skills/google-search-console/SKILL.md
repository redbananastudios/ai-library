---
name: google-search-console
description: Query Google Search Console for organic search performance (impressions, clicks, CTR, average position), indexing coverage, sitemaps, URL inspection, and Core Web Vitals data. Use for SEO monitoring, keyword performance analysis, and diagnosing visibility issues on Google Search.
trigger: gsc, search console, google search console, seo metrics, impressions, clicks, ctr, average position, indexing, sitemap, url inspection, core web vitals, search analytics
---
---
name: google-search-console
description: Query Google Search Console for organic search performance — impressions, clicks, CTR, average position, indexing coverage, sitemaps and URL inspection. Use when the user wants to monitor SEO metrics, diagnose ranking or visibility issues, investigate indexing problems, submit sitemaps, check URL indexing status, analyse top queries or landing pages, or build growth reports from GSC data.
trigger: gsc, search console, google search console, seo metrics, impressions, clicks, ctr, average position, indexing, sitemap, url inspection, core web vitals, search analytics, why is my page not indexed, why am I not ranking
---

# Google Search Console

You are an expert at using the Google Search Console (GSC) API to monitor and diagnose organic search performance.

## What GSC Covers

- **Search Analytics** — impressions, clicks, CTR, average position by query/page/country/device/date
- **URL Inspection** — per-URL index status, canonical, mobile usability, rich results, last crawl
- **Sitemaps** — submit, delete, inspect sitemap status and errors
- **Indexing API** — request indexing for job postings and broadcast events (restricted use)
- **Experience / Core Web Vitals** — LCP, FID/INP, CLS status per URL group (read via Crux or GSC UI; API support is limited)

GSC is the **source of truth for Google Search performance**. Analytics tools estimate; GSC reports what Google actually measured.

## Setup

### Enable the API

1. Enable `Google Search Console API` in Google Cloud Console.
2. Create a service account (preferred for automation) or OAuth 2.0 client (preferred for interactive use).
3. In GSC UI → Settings → Users and permissions → add the service account email as Full or Restricted user for the property.

### Authentication

```bash
# Service account (recommended for scripts)
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Or use OAuth flow for CLI tools
```

### Install the client

```bash
npm install googleapis
# or
pip install google-api-python-client google-auth
```

### Initialize (Node.js)

```javascript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const searchconsole = google.searchconsole({ version: 'v1', auth });
```

### Initialize (Python)

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    'service-account.json',
    scopes=['https://www.googleapis.com/auth/webmasters.readonly'],
)
gsc = build('searchconsole', 'v1', credentials=creds)
```

## Core Capabilities

### 1. List verified properties

```javascript
const res = await searchconsole.sites.list();
console.log(res.data.siteEntry);
// [{ siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' }, ...]
```

### 2. Search Analytics — top queries (last 28 days)

```javascript
const res = await searchconsole.searchanalytics.query({
  siteUrl: 'sc-domain:example.com',
  requestBody: {
    startDate: '2026-03-17',
    endDate: '2026-04-14',
    dimensions: ['query'],
    rowLimit: 100,
    dataState: 'final',
  },
});
console.log(res.data.rows);
// [{ keys: ['best wordpress plugins'], clicks: 120, impressions: 2400, ctr: 0.05, position: 3.2 }, ...]
```

### 3. Page-level performance with date dimension

```javascript
await searchconsole.searchanalytics.query({
  siteUrl: 'sc-domain:example.com',
  requestBody: {
    startDate: '2026-03-17',
    endDate: '2026-04-14',
    dimensions: ['page', 'date'],
    rowLimit: 5000,
    dataState: 'final',
  },
});
```

### 4. Query + Page combo (find cannibalisation / opportunities)

```javascript
await searchconsole.searchanalytics.query({
  siteUrl: 'sc-domain:example.com',
  requestBody: {
    startDate: '2026-03-17',
    endDate: '2026-04-14',
    dimensions: ['query', 'page'],
    rowLimit: 25000,
    dataState: 'final',
  },
});
// Same query appearing for multiple pages = potential cannibalisation
```

### 5. Filter by country, device, or search type

```javascript
requestBody: {
  startDate, endDate,
  dimensions: ['query'],
  dimensionFilterGroups: [{
    filters: [
      { dimension: 'country', operator: 'equals', expression: 'gbr' },
      { dimension: 'device', operator: 'equals', expression: 'MOBILE' },
    ],
  }],
  type: 'web', // or 'image', 'video', 'news', 'discover', 'googleNews'
}
```

### 6. URL Inspection — single URL

```javascript
const res = await searchconsole.urlInspection.index.inspect({
  requestBody: {
    inspectionUrl: 'https://example.com/blog/post-1',
    siteUrl: 'sc-domain:example.com',
  },
});
console.log(res.data.inspectionResult.indexStatusResult);
// { verdict: 'PASS', coverageState: 'Submitted and indexed', crawledAs: 'MOBILE', ... }
```

### 7. Sitemaps — list and inspect

```javascript
// List
const list = await searchconsole.sitemaps.list({
  siteUrl: 'sc-domain:example.com',
});

// Submit
await searchconsole.sitemaps.submit({
  siteUrl: 'sc-domain:example.com',
  feedpath: 'https://example.com/sitemap.xml',
});

// Inspect one
const s = await searchconsole.sitemaps.get({
  siteUrl: 'sc-domain:example.com',
  feedpath: 'https://example.com/sitemap.xml',
});
console.log(s.data.contents, s.data.errors, s.data.warnings);
```

## Common Reporting Patterns

### A. Weekly SEO health snapshot

Query last 7 days vs the prior 7 days at the site level, then at query level:

1. Aggregate clicks/impressions/CTR/position for week N and week N-1.
2. Compute deltas (absolute and %).
3. Flag queries that dropped > 10 positions or > 30% clicks week-over-week.
4. Surface new queries entering top 20.

### B. Content opportunity finder (striking distance)

Queries where you rank **positions 8–20** with **impressions > 500** and **CTR < 3%** — these are the closest wins. Expand the targeted page, strengthen internal links, add missing intent coverage.

### C. Cannibalisation audit

Pull `[query, page]` dimensions for the last 90 days. Group by query. Any query with 2+ pages drawing impressions is a cannibalisation candidate. Consolidate or differentiate.

### D. Page decay detector

For each top-500 page, compare clicks in the last 28 days vs the prior 28. Pages with > 25% click decline and stable impressions → content refresh candidates. Pages with both impression and click decline → deeper investigation (ranking loss).

### E. Indexing coverage scan

For a list of priority URLs, call URL Inspection for each (stagger to respect quota). Bucket results by `coverageState` and list any `verdict != PASS`.

## Quotas and Limits

- **Search Analytics**: 1,200 queries per minute per project. `rowLimit` max 25,000 per request. Use `startRow` to paginate.
- **URL Inspection**: 2,000 requests per day per site, 600 per minute.
- **Sitemaps / Sites**: generous, not usually the bottleneck.
- **Data freshness**: Search Analytics has ~2-day lag (`dataState: 'final'`). For faster but provisional data, use `dataState: 'all'` (includes fresh partial data).
- **Privacy threshold**: GSC withholds queries with very low impressions to protect user privacy. Long-tail data is incomplete by design.

## Guardrails

- Never log or commit service-account JSON files — always use env vars or secret managers.
- Respect the privacy threshold: do not claim "no queries" when the response is privacy-trimmed — note it.
- Date ranges must be at least 2 days behind `today` for final data; if the user wants yesterday, use `dataState: 'all'` and caveat.
- `siteUrl` format matters: Domain properties use `sc-domain:example.com`, URL-prefix properties use the full URL `https://www.example.com/`.
- Cache verbose responses where possible — repeated GSC queries add up fast against quota.
- Don't use the Indexing API for regular pages — it's restricted to JobPosting and BroadcastEvent structured data. Misuse can get your site restricted.

## WordPress Integration Notes

If the site uses **RankMath, Yoast or AIOSEO**, these plugins often submit sitemaps automatically. Pull the sitemap URL from the plugin settings rather than guessing:

- RankMath: `/sitemap_index.xml`
- Yoast: `/sitemap_index.xml`
- AIOSEO: `/sitemap.xml`

For WordPress content optimisation workflows, pair GSC query data with the `wordpress-content` skill to update posts based on the queries they actually rank for.

## Output Format

When delivering reports, include:

1. **Date range covered** and data state (final vs partial)
2. **Top-line metrics** — clicks, impressions, CTR, avg position with WoW/MoM deltas
3. **Top movers** — biggest winners and losers by clicks and by position
4. **Opportunities** — striking-distance keywords, cannibalisation flags, decaying pages
5. **Indexing health** — count of non-indexed priority URLs
6. **Action items** — specific pages/queries to address next

## Related Skills

- Pair with **google-analytics** for traffic-to-conversion correlation
- Pair with **seo-growth-tracker** for longitudinal tracking and weekly/monthly reports
- Pair with **wordpress-content** / **ai-seo** / **seo-audit** for acting on the findings
