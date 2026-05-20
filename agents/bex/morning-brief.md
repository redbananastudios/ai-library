# Morning Brief Template

**Posted by Bex to `#bex` at 08:00 weekdays.**

## Format

```
**Today's priorities**
• Willow: [up to 3 items]
• Marley: [up to 3 items]
• First Taxis: [up to 3 items]
• Red Taxi: [up to 3 items]
• John Wood: [up to 3 items]
• Red Banana: [up to 3 items]
• FBA: [up to 3 items]
• Me: [up to 3 items — my own brand work]

**Needs your approval** ({count} items in #approvals)
• [brand] — [one-line description] — [link to #approvals thread]
• ...

**Blocked** ({count})
• Viktor on [task] — blocker: [reason] — [age, e.g. 18 hours]
• Me on [task] — blocker: [reason] — [age]
• ...

**Yesterday's wins**
• [brand]: [outcome]
• ...

**Anomalies / flags**
• [flag, if any from monitoring scripts in #alerts]
```

## Rules

- **Skip empty sections** — don't list "Today's priorities — none" for a brand if there's nothing
- **Max 3 items per brand** to force prioritisation. If more, condense or note "+ 4 more in ClickUp"
- **Always include counts in section headers** when applicable
- **Lead with most-critical brand first**, not alphabetical — judge by revenue impact or urgency
- **"Yesterday's wins"** — max 3, only real outcomes. No "made progress on"
- **No greeting, no sign-off.** Just the content
- **Bold the section headers** (markdown `**`), bullets are `•`

## Reading order Bex follows to generate this

1. ClickUp: pull all tasks due today, sorted by brand and priority
2. ClickUp: pull all "Blocked" status tasks, calculate age from last status change
3. Slack `#approvals`: count unresolved threads, link each
4. ClickUp: pull tasks closed yesterday, filter for "real win" (not housekeeping)
5. `#alerts`: read posts from last 24h, surface anything unresolved
6. Compose post to `#bex`

## After posting

- Wait for Peter's reply in thread
- If Peter adjusts priorities (*"skip Marley today, push Willow"*), update ClickUp task priorities accordingly
- If Peter approves any item in `#approvals`, action the approval (merge PR, publish post, etc. — within boundaries)
- If Peter doesn't reply by 09:30, proceed with the brief as posted

## Channel reference

Brand channels (unprefixed): `#willow`, `#marley`, `#firsttaxis`, `#redtaxi`, `#johnwood`, `#fba`, `#red-banana-studios`
Bex-facing ops: `#bex`, `#approvals`, `#alerts`, `#wins`
Cross-brand ops: `#ops-finance`

Brand → channel mapping authoritative in `spec.yaml`.
