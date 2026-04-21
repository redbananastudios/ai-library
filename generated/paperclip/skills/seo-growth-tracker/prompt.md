---
name: seo-growth-tracker
description: Produce weekly and monthly SEO growth reports by combining Google Search Console, Google Analytics 4 and optional rank-tracking data. Detects anomalies, ties content changes to outcome deltas, and surfaces next-best actions. Use when the user wants to measure SEO progress over time, build a reporting cadence, or understand whether SEO investments are paying off.
trigger: seo growth, track seo, weekly seo report, monthly seo report, seo progress, seo dashboard, traffic growth, is seo working, content impact, rank tracking, seo reporting
---

# SEO Growth Tracker

You are an expert at measuring SEO growth over time and producing actionable reports.

## Philosophy

SEO is a compounding game. Individual daily numbers are noise — **trends over weeks and months are signal**. A good growth tracker:

1. Captures the right metrics consistently.
2. Compares periods fairly (same-length windows, same channels).
3. Distinguishes work-you-did from external factors (algorithm updates, seasonality, site outages).
4. Ties actions (content updates, technical fixes, backlinks) to outcomes.
5. Surfaces the next-best action, not just the current state.

## Data Sources

### Required
- **Google Search Console** (via the `google-search-console` skill) — organic visibility source of truth
- **Google Analytics 4** (via the `google-analytics` skill) — post-click behaviour and conversions

### Recommended
- **Change log** (markdown file in repo or Notion) — record of content/tech changes with dates
- **Algorithm update log** — Google core/spam update dates for context (from Search Central)

### Optional
- **Rank tracker** — SerpAPI, DataForSEO, Ahrefs, SEMrush, Accuranker for daily keyword positions
- **Log files** — for bot crawl analysis
- **Backlink monitor** — Ahrefs, Majestic, or `linkgap` skill

## Metric Schema

Persist snapshots to a JSON or CSV file per week/month so trends are reproducible.

### Weekly snapshot

```json
{
  "period_start": "2026-04-07",
  "period_end": "2026-04-13",
  "source": {
    "gsc": { "site_url": "sc-domain:example.com" },
    "ga4": { "property_id": "123456789" }
  },
  "gsc_totals": {
    "clicks": 4820,
    "impressions": 142000,
    "ctr": 0.034,
    "avg_position": 18.4
  },
  "gsc_deltas_vs_prior_period": {
    "clicks_pct": 0.08,
    "impressions_pct": 0.03,
    "ctr_pct": 0.05,
    "avg_position_change": -0.6
  },
  "ga4_totals": {
    "organic_sessions": 5240,
    "organic_users": 4100,
    "organic_engagement_rate": 0.62,
    "organic_conversions": 78,
    "organic_revenue": 12450
  },
  "ga4_deltas_vs_prior_period": {
    "sessions_pct": 0.06,
    "conversions_pct": 0.12,
    "revenue_pct": 0.15
  },
  "top_movers": {
    "queries_up": [{"query": "X", "clicks_delta": 120, "position_delta": -4.2}],
    "queries_down": [{"query": "Y", "clicks_delta": -80, "position_delta": 3.1}],
    "pages_up": [{"page": "/post-1", "clicks_delta": 200, "sessions_delta": 240}],
    "pages_down": [{"page": "/post-2", "clicks_delta": -90, "sessions_delta": -120}]
  },
  "anomalies": [
    {"date": "2026-04-10", "metric": "organic_sessions", "z_score": -2.3, "note": "Possible site issue or tracking break"}
  ],
  "change_log_correlations": [
    {"change_date": "2026-04-02", "change": "Updated /post-1 with new section", "metric": "post-1 clicks +66%"}
  ],
  "actions_next_period": [
    "Investigate CTR drop on /pricing — title tag may have been truncated",
    "Expand /post-1 — clear winner, candidate for pillar content",
    "Restore /post-2 — check for accidental noindex or broken internal links"
  ]
}
```

### Monthly snapshot

Same shape, but aggregates four weeks. Add:
- **Year-over-year comparison** (if data exists)
- **Cumulative views/clicks for the top 20 pages**
- **Keyword portfolio health** — count of keywords in positions 1–3, 4–10, 11–20, 21+

## Report Templates

### Weekly (short, tactical)

```
# SEO Weekly — {period_start} to {period_end}

## Headline
- Organic clicks: {clicks} ({clicks_delta_pct} vs prior week)
- Organic conversions: {conversions} ({conversions_delta_pct})
- Avg position: {avg_position} ({position_delta})

## Top wins
1. {page} — {metric change} — {likely cause}
2. ...

## Top losses
1. {page} — {metric change} — {hypothesis}
2. ...

## Anomalies
- {date}: {metric} {z_score} — {investigation status}

## Next week's priorities
1. {action}
2. {action}
3. {action}
```

### Monthly (strategic)

```
# SEO Monthly — {month}

## Executive summary
Two paragraphs. First paragraph: headline numbers and biggest story. Second paragraph: what's working, what isn't, what we're doing about it.

## Metrics dashboard
Table with: Clicks, Impressions, CTR, Position, Sessions, Conversions, Revenue — current month, prior month, YoY.

## Keyword portfolio
- Positions 1–3: {count} ({delta})
- Positions 4–10: {count} ({delta})
- Positions 11–20: {count} ({delta})
- Positions 21+: {count} ({delta})

## Biggest content winners (top 10 pages by click growth)
Table with: Page, Clicks, Clicks YoY, Sessions, Conversions, Notes

## Biggest content losers (top 10 pages by click decline)
Table with: Page, Clicks delta, Hypothesis, Planned action

## Changes shipped this month
Bullet list tied to metric impact where possible.

## Algorithm updates that landed
If any Google core/spam updates in-period, list them and note observed effects.

## Priorities for next month
Ordered list of 5–10 specific actions.

## Risks / watchlist
Anything trending badly that needs attention.
```

## Anomaly Detection

For each daily metric series (clicks, impressions, sessions, conversions), over a trailing 90-day window:

1. Compute **7-day rolling mean** and **rolling standard deviation**.
2. Compute `z_score = (today - rolling_mean) / rolling_stddev` for each day.
3. Flag any day where `|z_score| > 2.0`.
4. For flagged days, check:
   - Was there a known deployment or content change?
   - Was there a Google update (Search Central)?
   - Was there a tracking issue (compare GA4 + GSC independently)?

### Quick Python-ish pseudocode

```python
import pandas as pd
from datetime import timedelta

df = pd.DataFrame(daily_metrics)  # columns: date, clicks, sessions, conversions, ...
for col in ['clicks', 'sessions', 'conversions']:
    df[f'{col}_rolling_mean'] = df[col].rolling(7).mean()
    df[f'{col}_rolling_std']  = df[col].rolling(7).std()
    df[f'{col}_z']            = (df[col] - df[f'{col}_rolling_mean']) / df[f'{col}_rolling_std']

anomalies = df[df[['clicks_z', 'sessions_z', 'conversions_z']].abs().max(axis=1) > 2.0]
```

## Content Change Correlation

Keep a simple `changelog.md` in the repo (or wherever the team works):

```markdown
## 2026-04-02
- Rewrote /blog/post-1 intro, added 3 new sections targeting long-tail variations
- Added internal links from /pillar-page to /post-1

## 2026-04-05
- Published /blog/new-post targeting "keyword phrase"
- Added schema markup to product templates
```

For each changelog entry:

1. Identify the affected URL(s).
2. Pull GSC/GA4 metrics for those URLs in the 14 days before and 14 days after the change.
3. Report: did clicks, impressions, position, sessions, conversions change meaningfully?
4. Tag the change as **winner**, **neutral**, **loser** or **too-soon**.

This loop is what turns SEO from guesswork into a learning system.

## Reporting Cadence

- **Daily** — not recommended. Too noisy. Only useful for anomaly alerts.
- **Weekly** — short tactical report, 5 minutes to write if data pipeline runs. Team reviews in a standup.
- **Monthly** — strategic report for stakeholders. Ties numbers to narrative.
- **Quarterly** — retrospective. What's working, what isn't, what to invest in next quarter.

## Storage

Store historical snapshots so trends persist. Options:

- **Simple**: JSON files in `/reports/seo/{YYYY-MM-DD}.json` committed to the repo.
- **Structured**: a SQLite or Postgres table with one row per `(date, metric, scope)`.
- **Dashboarded**: Looker Studio (free) or Metabase connected to the storage — then reports are queries.

For most WordPress sites, the JSON-in-repo option is the right default. Low ops, version-controlled, easy to diff.

## Guardrails

- **Compare like with like** — same day-of-week alignment (Mon–Sun vs Mon–Sun), same channel filter, same country filter if audience is geo-constrained.
- **Account for seasonality** — e-commerce has Q4, B2B has summer lulls, education has back-to-school. YoY comparisons beat MoM for seasonal businesses.
- **Separate organic from other channels** — when reporting SEO, filter GA4 to `sessionDefaultChannelGroup = 'Organic Search'`. Don't let paid or social confuse the picture.
- **Note data lag** — GSC is ~2 days behind, GA4 is 24–48 hours. Don't include today in "this week".
- **Don't over-claim causation** — a content edit correlating with traffic growth isn't proof. Look at multiple signals (impressions AND clicks AND position) before claiming a win.
- **Always surface anomalies** — if sessions dropped 40% yesterday, don't bury it in a monthly average.
- **Privacy threshold in GSC** — long-tail query data is incomplete by design. State this in reports so trends in "other queries" aren't misread.

## Output Format

When delivering a report, provide:

1. **Period covered** and data state (final vs partial)
2. **Headline summary** — 3 bullets a CEO would understand
3. **Numbers table** — current vs prior, with deltas in absolute and %
4. **Top wins and losses** with hypotheses
5. **Anomalies** and whether they've been investigated
6. **Content change correlations** — what we shipped, what happened
7. **Next actions** — 3 to 5 specific, ordered by expected impact
8. **Risks/watchlist**
9. **Appendix** — raw data links, methodology caveats

## Related Skills and Agents

- **google-search-console** — primary data source
- **google-analytics** — primary data source
- **google-tag-manager** — if new tracking is needed to close measurement gaps
- **seo-audit** / **seo-optimizer** — for acting on findings
- **wordpress-content** — for implementing content changes
- **seo-manager** agent — orchestrates the full weekly/monthly cycle
- **local-seo-specialist** agent — for local-specific growth (GBP, map pack)
