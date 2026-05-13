---
name: ai-content-workflow
description: Six-rule discipline that gates every AI-assisted content draft (location pages, service pages, blog posts, FAQs, product descriptions). Source first (operator voice memo or transcript before any AI involvement), structured facts object before prose, AI structures and never invents (no street name / price / anecdote not in the source — empty sections stay empty with INSUFFICIENT SOURCE marker), verify against reality (street names against Royal Mail / OS Maps, postcodes against postcodes.io, claims against the operator), one earned operator-specific detail minimum per page, and first-person posts always start from a real transcript. Catches the AI-fluff failure mode that makes content generic and gets pages devalued by Helpful Content / AI search engines.
trigger: AI content workflow, content from voice memo, source-first content, never invent facts, content brief discipline
---
---
name: ai-content-workflow
description: Use when writing or auditing any AI-assisted content (location pages, service pages, blog posts, FAQ answers, product descriptions, intros) where the cost of a hallucinated fact is high and the value of a specific operator-supplied detail is high. Enforces six rules — source first (operator voice memo / transcript before any AI), structured facts object before prose, AI structures-never-invents (no fact not in source — empty sections stay empty with `<!-- INSUFFICIENT SOURCE -->` marker), verify-against-reality (street names, postcodes, claims), one earned operator-specific detail minimum per page, first-person posts start from a real transcript. Pair with `local-business-area-page-enricher` (which specifies the recipe) and `local-business-content-audit` (which catches violations after the fact). The recipe says what good looks like; this workflow says how to get there without inventing.
---

# ai-content-workflow

The six rules that gate every AI-assisted content draft. Pair with the recipe (what the page must contain) and the audit (what the finished page must not contain). Source-first content reads like a real practitioner wrote it; AI-from-cold content reads templated and gets devalued.

## When to use this

- Writing a new location, service, or blog page on any project where domain-specific accuracy matters.
- Reviewing an AI draft before publish.
- Onboarding a new operator on how to feed AI usefully (the rules also tell the operator what to record).
- Refusing a request to "fill in" a section the operator hasn't sourced.

## When NOT to use this

- Generating throwaway social posts where specificity isn't load-bearing.
- Translating existing operator-written content to another language (the source is already there).
- Pure SEO meta (title tags, descriptions) where structure dominates over story.

## The 6 rules

### Rule 1. Source first

Before any AI involvement, the operator records a 5-minute voice memo (or sends a written transcript) covering, at minimum:

- **Specific places, names, or identifiers** relevant to the topic. For local businesses: streets, areas, postcodes, councils. For ecommerce: actual product features, supplier names, materials, finish details. For service business case studies: the customer name (with permission), the actual job, the outcome.
- **Access / process realities** that prove operational knowledge. For local: parking restrictions, vehicle constraints, school-run timing. For ecommerce: warehouse handling, packaging quirks. For services: edge cases, gotchas, things customers don't ask about.
- **One real story or operational detail** that anchors the page in lived experience. The story is non-optional.
- **Indicative numbers** — prices, dimensions, timings — drawn from real jobs.
- **Disclaimers and limits** — what they DON'T do, what they're NOT, things they decline. Honesty is differentiating.

If the operator hasn't recorded one for this topic, **the page isn't ready to write**. Decline the task and tell them what to record.

### Rule 2. Structured facts object before prose

Convert the transcript into a structured facts object before any AI drafting. Required keys depend on the content type, but the principle is the same: **structured data first, prose second**.

For a location page (Marley exemplar):

```yaml
facts:
  postcodes: [SP7]                        # outcodes covered
  distanceFromYardMiles: 0                # road miles from operator's base
  routes: ["A30 east", "A350 north"]      # named A/B roads
  namedStreets: [                          # ≥3 — verified against Royal Mail / OS Maps
    "Bell Street", "Gold Hill", "St James"
  ]
  parkingNotes: |
    No HGV access on Gold Hill (cobbled, listed).
    Bell Street has a single-yellow you can load on for 20 mins.
  pricingBand: "£900–£1,400 for a 3-bed local move on the modern estates"
  realExample: |
    We moved a 1920s grand piano off Gold Hill — the angle on the steps
    means a 3-person carry every time.
```

For a service page:

```yaml
facts:
  whatsIncluded: ["fully-trained crew", "wrapping/blanketing", "two trips to yard"]
  whoItsFor: ["3-bed and up", "elderly customers downsizing"]
  pricingTiers: [
    { range: "studio / 1-bed", from: 600 },
    { range: "3-bed", from: 1050 },
  ]
  processSteps: ["site survey or video walkaround", "fixed quote in 2 hours", ...]
  realExample: "..."
  honestLimits: ["we don't quote sight-unseen for over-3-bed"]
```

For a product description:

```yaml
facts:
  material: "European oak, kiln-dried 8% MC"
  origin: "Rothenburg sawmill, Bavaria"
  dimensions: { lengthMm: 2200, ... }
  finish: "hard-wax oil, 2 coats"
  realExample: "fitted in a Yorkshire farmhouse 2024 — humidity 65%, 6 months in, no movement"
  honestLimits: ["not for outdoor use", "not suitable for underfloor heating above 27°C"]
```

The facts object feeds structured data (JSON-LD `Service.areaServed`, `Product`, `Offer`) AND is referenced inline in the prose. **Both sides of the page (machine-readable + human-readable) read from the same object.**

### Rule 3. AI structures, never invents

The prompt that drives the AI draft is non-negotiable on this rule. Use the template in `references/prompt-template-location-pages.md` (or `references/prompt-template-service-pages.md`, or adapt for other content types).

Critical clauses:

> "Take the transcript and the facts object below. Shape them into the page sections specified. **You may not introduce any fact not present in the source material.** If a section has no source material, output `<!-- INSUFFICIENT SOURCE — needs operator follow-up -->` and move on. Do not pad. Do not invent street names, prices, or anecdotes."

This is the single most important rule. **AI assistants will, by default, fill gaps with plausible-sounding generalities.** The cost of a single hallucinated street name in a local SEO page is a customer phoning to ask why you mentioned a road they live on, when you've never been there. Authority destroyed in one phone call.

Operationalise:

- **Empty sections beat fluff sections.** `<!-- INSUFFICIENT SOURCE -->` markers are a feature. They flag what to follow up on with the operator.
- **Don't ship a page with markers in it.** The marker is a TODO, not a deliverable. The operator fills the gap before publish.
- **The prompt is the contract.** If the AI ignores the rule and invents, the prompt isn't strict enough — tighten the wording (the template in `references/` has the proven phrasing).

### Rule 4. Verify against reality

Before publishing any factual claim AI helped structure, verify it. The verification step is fast (≤2 minutes per page) and catches the rare cases where a transcript was mis-transcribed or the operator misspoke.

Verification routes per claim type:

| Claim type | Verify via |
|---|---|
| Street name | Royal Mail postcode finder, OS Maps, Google Maps |
| Postcode | postcodes.io (also gets you lat/lng for JSON-LD `geo`) |
| Distance / route | Google Maps directions with timing |
| Phone number / email | Live test (call, send) |
| Operating hours | Operator's GBP listing |
| Insurance / accreditation | Operator's certificate (don't claim BAR, ISO, IPAF unless you've seen the cert) |
| Years trading / employee count | Companies House (UK), state registry (US) |
| Product specs | Spec sheet from supplier, not the AI summary |

A Google search for `"<name>" <town>` should return a real result. If it doesn't, the AI invented it (or the transcript was wrong) — flag for operator.

### Rule 5. One earned detail minimum per page

Each page must contain at least one specific story or operational detail that proves the operator has actually done the work. Generic claims don't count.

**Examples that count** (Marley):
- "We've moved three pianos off Gold Hill — the cobbles mean we plank-and-skate every time"
- "Park Sherborne Castle moves on weekday mornings; the school-run from Sherborne School at 3:45pm is impossible for a Luton"
- "The Old Town quarter of Wincanton has cottages where the front door opens onto the road; we use a runner from a side street"

**Examples that don't count**:
- "We have experience moving in Shaftesbury" (generic)
- "Our crews know the area well" (boilerplate)
- "We've completed many moves here" (unsubstantiated number)
- "Our award-winning team" (no award named)

Without one earned detail, the page reads as templated and AI search engines penalise it. **AI search engines (ChatGPT, Perplexity, Claude, Google AI Overviews) reward specificity and penalise hallucinated detail** — even one invented street name kills the page's authority, and one earned detail elevates it.

If the voice memo has no earned detail for a topic, the page isn't ready. Go back to Rule 1.

### Rule 6. First-person posts always start from a real transcript

This rule is specific to insights / blog / case-study content. **No AI-from-cold posts.** Every first-person post starts from an operator or crew transcript.

If a topic genuinely requires research (e.g. "BAR vs non-BAR removals", "How interest rates affect homebuying timelines"), the post must still:
- Go through the operator for fact-checking
- Carry a personal framing line ("I get asked this on every other quote call")
- Acknowledge what the operator's actual stance is (sometimes it's "I don't think this matters as much as people say")

A research-heavy post written without operator input is content marketing the operator can't defend if a customer asks them about it.

## Process — when invoked

```
1. Identify content type (location / service / post / FAQ / product description)
2. Confirm source material exists
   ├─ Operator voice memo, written transcript, or interview notes
   └─ If no source: STOP. Tell operator what to record. Don't draft.
3. Convert transcript into structured facts object (Rule 2 schema per content type)
4. Run the AI draft using the strict prompt template (references/)
5. Section-by-section, replace any <!-- INSUFFICIENT SOURCE --> with one of:
   ├─ Operator follow-up (preferred)
   └─ Section deletion (if the data fundamentally isn't available)
6. Verify factual claims (Rule 4 routes per claim type)
7. Confirm earned-detail minimum (Rule 5)
8. Hand to local-business-content-audit (or equivalent) for the negative checks
   (no AI tells, UK English, no banned characters)
9. Pre-publish: re-read aloud. If it doesn't sound like the operator, rewrite.
```

## Anti-patterns

- **Filling INSUFFICIENT SOURCE markers with "let me research this for you"**. The marker is a flag for the operator to fill, not a prompt for AI to research. Research-filling re-introduces hallucination risk.
- **Skipping the facts object** because "the transcript is enough". The structured object is what feeds JSON-LD and what stops AI from confusing different facts together. Skip it and you re-introduce drift.
- **Using a single transcript across multiple location pages**. Each location needs its own memo. The earned detail must be specific to that location, not a copy-paste across the area-page set.
- **Treating the audit script as Rule 1's replacement**. The audit catches AI tells and banned characters AFTER the page is drafted. It doesn't catch hallucinated street names — those pass the audit and fail at the customer-phone-call stage.
- **Letting the prompt drift**. Each AI draft starts from the strict template, not from "the previous draft plus tweaks". Once the strict prompt is loose, hallucination creeps back in.

## Pairings

- **`local-business-area-page-enricher`** (sibling skill in `local-business-seo` kit) — defines what an area page must contain (8 elements, "remove location name" test). Use both: one says what good looks like, this one says how to get there.
- **`local-business-content-audit`** — catches AI-tell violations and banned-character drift after the page is drafted. Different failure mode (text patterns) than this workflow (hallucinated facts).
- **`dataforseo-keyword-pipeline`** — the per-page brief tells you what topics, schemas, and word count the page needs; the brief feeds into the operator's voice-memo prep ("here's what to cover").

## Provenance

Distilled from Marley Moves AEO handoff TASK 9 (`O:/marley/site/docs/superpowers/specs/2026-05-01-content-workflow.md`). Marley enforces this via project-level CLAUDE.md plus a re-runnable audit script (`audit-town-content-vs-shaftesbury-bar.mjs`) that scores each town 0–8 against the recipe. Workflow rules are stricter than the audit — the audit is a safety net, the workflow is the discipline that prevents the failure.
