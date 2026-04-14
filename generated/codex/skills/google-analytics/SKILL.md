---
name: google-analytics
description: Query Google Analytics 4 via the Data API for traffic, sessions, users, engagement, conversions, attribution and audience insights. Use for measuring site growth, user behaviour, funnel performance, revenue and conversion tracking across channels.
---
# Google Analytics 4

You are an expert at using the Google Analytics 4 (GA4) Data API to report on site performance, user behaviour and conversions.

## What GA4 Covers

- **Acquisition** — sessions, users, new users by channel/source/medium/campaign
- **Engagement** — engaged sessions, engagement rate, engagement time, events
- **Monetisation** — purchases, revenue, ARPU, ecommerce events
- **Retention** — user retention cohorts, returning vs new
- **Audience / demographics** — country, device, language, age/gender (if enabled)
- **Realtime** — last 30 minutes activity
- **Funnel / path analysis** — exploration-style reports via the Data API

GA4 is event-based, not session-based. Every interaction is an event with parameters. Pre-built reports aggregate those events.

## Setup

### Enable the API

1. Enable `Google Analytics Data API` and `Google Analytics Admin API` in Google Cloud Console.
2. Create a service account or OAuth client.
3. In GA4 → Admin → Property Access Management → add the service account email as Viewer (or higher for Admin API).

### Find your Property ID

GA4 Property ID is a number (e.g. `123456789`), not the G-measurement ID (`G-XXXXXXX`). Find it in GA4 → Admin → Property Settings.

### Install

```bash
npm install @google-analytics/data
# or
pip install google-analytics-data
```

### Initialize (Node.js)

```javascript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const client = new BetaAnalyticsDataClient();
// Auth via GOOGLE_APPLICATION_CREDENTIALS env var
```

### Initialize (Python)

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest,
)

client = BetaAnalyticsDataClient()
```

## Core Capabilities

### 1. Sessions and users by channel (last 28 days)

```javascript
const [response] = await client.runReport({
  property: `properties/${PROPERTY_ID}`,
  dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
  dimensions: [{ name: 'sessionDefaultChannelGroup' }],
  metrics: [
    { name: 'sessions' },
    { name: 'totalUsers' },
    { name: 'engagedSessions' },
    { name: 'engagementRate' },
  ],
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
});
```

### 2. Top landing pages by engagement

```javascript
await client.runReport({
  property: `properties/${PROPERTY_ID}`,
  dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
  dimensions: [{ name: 'landingPagePlusQueryString' }],
  metrics: [
    { name: 'sessions' },
    { name: 'averageSessionDuration' },
    { name: 'engagementRate' },
    { name: 'conversions' },
  ],
  limit: 100,
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
});
```

### 3. Compare two date ranges (WoW / MoM)

```javascript
await client.runReport({
  property: `properties/${PROPERTY_ID}`,
  dateRanges: [
    { startDate: '7daysAgo', endDate: 'yesterday', name: 'current' },
    { startDate: '14daysAgo', endDate: '8daysAgo', name: 'previous' },
  ],
  dimensions: [{ name: 'sessionDefaultChannelGroup' }],
  metrics: [{ name: 'sessions' }, { name: 'conversions' }],
});
```

### 4. Conversion events by source/medium

```javascript
await client.runReport({
  property: `properties/${PROPERTY_ID}`,
  dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
  dimensions: [
    { name: 'sessionSource' },
    { name: 'sessionMedium' },
    { name: 'eventName' },
  ],
  metrics: [{ name: 'eventCount' }, { name: 'conversions' }],
  dimensionFilter: {
    filter: {
      fieldName: 'eventName',
      stringFilter: { matchType: 'CONTAINS', value: 'purchase' },
    },
  },
});
```

### 5. Realtime (last 30 min)

```javascript
const [response] = await client.runRealtimeReport({
  property: `properties/${PROPERTY_ID}`,
  dimensions: [{ name: 'country' }, { name: 'unifiedScreenName' }],
  metrics: [{ name: 'activeUsers' }],
});
```

### 6. Pivot report (channel × device)

```javascript
await client.runPivotReport({
  property: `properties/${PROPERTY_ID}`,
  dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }],
  dimensions: [
    { name: 'sessionDefaultChannelGroup' },
    { name: 'deviceCategory' },
  ],
  metrics: [{ name: 'sessions' }, { name: 'conversions' }],
  pivots: [
    { fieldNames: ['deviceCategory'], limit: 3 },
    { fieldNames: ['sessionDefaultChannelGroup'], limit: 10 },
  ],
});
```

### 7. Custom event parameters

If you've defined custom event parameters (e.g. `form_name`), register them as **custom dimensions** in GA4 Admin first, then query:

```javascript
dimensions: [{ name: 'customEvent:form_name' }],
metrics: [{ name: 'eventCount' }],
```

## Common Reporting Patterns

### A. Content performance for SEO

Combine GA4 landing pages with GSC queries to answer: "for the page that ranks for X, what do users do when they land?"

1. Pull top landing pages from organic channel (filter `sessionDefaultChannelGroup = 'Organic Search'`).
2. Measure sessions, engagement rate, average engagement time, conversions.
3. Cross-reference with GSC to get the queries driving those sessions.
4. Identify pages with high GSC traffic but low GA4 engagement → content quality issue.

### B. Funnel — organic visit to conversion

```javascript
await client.runReport({
  property: `properties/${PROPERTY_ID}`,
  dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
  dimensions: [{ name: 'eventName' }],
  metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
  dimensionFilter: {
    andGroup: {
      expressions: [
        { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } } },
        { filter: { fieldName: 'eventName', inListFilter: { values: ['page_view', 'scroll', 'form_submit', 'purchase'] } } },
      ],
    },
  },
});
```

### C. UTM campaign attribution

```javascript
dimensions: [
  { name: 'sessionCampaignName' },
  { name: 'sessionSource' },
  { name: 'sessionMedium' },
],
metrics: [
  { name: 'sessions' },
  { name: 'conversions' },
  { name: 'totalRevenue' },
],
```

### D. Returning vs new users

```javascript
dimensions: [{ name: 'newVsReturning' }],
metrics: [{ name: 'totalUsers' }, { name: 'engagementRate' }, { name: 'conversions' }],
```

### E. Traffic anomaly detection

Pull daily sessions by channel for the last 90 days. Compute a 7-day rolling mean and standard deviation. Flag any day where sessions are more than 2 SD away from the mean — this catches both spikes (viral content, broken tracking reporting double) and drops (site outage, Google update).

## Sampling and Thresholding

- **Sampling**: GA4 standard properties apply sampling when queries exceed data-scanning thresholds. Check `response.metadata.currencyCode` / `response.metadata` and look for `samplingMetadatas`.
- **Thresholding**: GA4 suppresses data for small audiences to protect user privacy. Reports may return fewer rows than expected.
- **Data freshness**: standard processing lag is 24–48 hours. For near-realtime, use `runRealtimeReport` (last 30 min only) or `Google Analytics 360` (no lag).

## Quotas

- **Core reporting**: 25,000 tokens per project per day by default. Each query costs 1–N tokens depending on dimensions/metrics.
- **Realtime**: separate quota, more generous.
- **Server errors**: implement exponential backoff. 429 = quota exceeded.

## Guardrails

- Never log credentials. Service account JSON must never be committed.
- Always caveat reports when sampling or thresholding is active — surface `samplingMetadatas` to the user.
- Use **Property ID** (number), not Measurement ID (`G-...`) or Stream ID.
- GA4 definitions matter: `totalUsers` ≠ `activeUsers` ≠ `newUsers`. When reporting, state the metric definition.
- `sessions` in GA4 is session-scoped. `sessionStart` event count is also usable. For user journeys, prefer user-scoped metrics.
- Revenue numbers must use the property's currency — check `metadata.currencyCode`.
- GA4 will not give you the same numbers as UA (Universal Analytics). Do not compare them directly.

## Integration

### With GSC
- GSC gives you **what Google sees** (impressions, position).
- GA4 gives you **what users do after clicking** (engagement, conversions).
- The bridge is the landing page URL. Join on `page` dimension from GSC to `landingPagePlusQueryString` from GA4.

### With GTM
- GTM is how most events get fired. A conversion event in GA4 usually starts as a GTM trigger.
- When adding new tracking, use the **google-tag-manager** skill to deploy, then GA4 Admin to mark it as a conversion.

### With WordPress
- If the site uses MonsterInsights, RankMath Analytics, or SiteKit, those are wrappers over GA4/GSC — the source of truth remains GA4 itself.
- Use the `wordpress-content` skill for on-site changes, then measure impact here.

## Output Format

1. **Date range and comparison** (current vs previous, noting sampling if any)
2. **Top-line metrics** — users, sessions, engagement rate, conversions, revenue with deltas
3. **Channel breakdown** — table with WoW/MoM deltas per channel
4. **Top pages and campaigns** — what drove the result
5. **Anomalies** — spikes/drops worth investigating
6. **Recommended actions** — specific next steps tied to findings

## Related Skills

- Pair with **google-search-console** for full SEO picture
- Pair with **google-tag-manager** for deploying new events/conversions
- Pair with **seo-growth-tracker** for longitudinal reporting
- Pair with **ads-manager** / **claude-ads** for paid channel analysis
