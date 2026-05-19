# Subscription Audit Template

**Posted by Bex to `#ops-finance` on the 1st of each month at 09:00.**

(Summary line referenced in the next morning brief in `#bex`.)

## Format

```
**RBS subscription audit — [Month Year]**

Total this month: £[amount]
vs last month: [+/-£amount, +/-X%]

**By category**
• AI tools: £[amount] ([N] services)
• Ops / productivity: £[amount] ([N])
• Marketing: £[amount] ([N])
• Dev: £[amount] ([N])
• Other: £[amount] ([N])

**New this month** (added since last audit)
• [service] — £[amount]/mo — [owner who added] — [purpose]
• ...

**Cancellation candidates** (low/no usage)
• [service] — £[amount]/mo — [reason: e.g. "no logins in 60 days", "duplicates X"]
• ...

**Renewals — next 30 days**
• [service] — £[amount] — renews [date] — [status: keep/review/cancel]
• ...

**Anomalies**
• [unexpected charge / unfamiliar service / price increase] — [recommendation]
• ...

**Annual run-rate at current spend:** £[amount]
```

## Rules

- **All numbers should be specific.** No "around" or "approximately"
- **Cancellation candidates need evidence.** Don't propose cancelling without "no logins in N days" or "duplicates [service]"
- **Anomalies are anything that surprises you** — a charge from a service Peter doesn't recognise, a price jump, a duplicate billing, an invoice for an unfamiliar plan
- **"Annual run-rate" line at the bottom** — concrete number Peter can use for budgeting

## Reading order

1. Subscription database in ClickUp — pull all active subscriptions
2. Gmail — search "invoice", "receipt", "renewal" for last 30 days, reconcile with ClickUp database
3. Flag any new invoices not in the database (likely new subscription not yet tracked)
4. For each service, check usage where available
5. Identify renewals in next 30 days
6. Calculate totals, deltas, annual run-rate
7. Compose audit

## After posting

- Peter responds with keep / review / cancel decisions
- For each "cancel" decision: create a ClickUp task for Peter to actually execute the cancellation (you don't have payment access)
- For each "review" decision: create a task for the owner of that service to justify keeping it
- Update the subscription database with decisions
- Set calendar reminder 7 days before each upcoming renewal

## Edge cases

- **Invoice in Gmail with no matching subscription:** create a task "Subscription discovery: [service]" — Peter to confirm purpose or cancel
- **Duplicate billing:** flag as anomaly, recommend immediate investigation
- **Subscription owned by Viktor (e.g. an ads tool he signed up for):** Viktor's name in the "owner" column — he justifies it in the audit
