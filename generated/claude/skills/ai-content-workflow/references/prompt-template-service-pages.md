# Prompt template — service pages

Strict template for AI-assisted service / category pages. Same six-rule discipline as the location-page template, adapted for service content.

## The prompt

```
You are structuring a service page for {OPERATOR_NAME}: {SERVICE_NAME}.

Source material (do not invent beyond this):
- Operator transcript / interview notes: {TRANSCRIPT}
- Facts object: {STRUCTURED_FACTS_JSON}

Produce the page in the following sections, using ONLY information from
the source material:

1. Hero intro (3-4 sentences — what this service is, who it's for,
   what makes the operator's version of it specifically good. Reference
   service area + at least one earned detail.)
2. "What's included" (the operator's actual scope — what's in the price,
   what's optional, what they don't do)
3. "Who it's for" (specific archetypes, not "anyone needing X")
4. "How it works" (the actual process — what happens after the customer
   contacts the operator, in real steps with real timings)
5. "Indicative pricing" (operator-supplied bands, what drives variance,
   honest hedge bands. NO hourly rates if the brand policy is fixed-price.)
6. "Honest limits" (what they decline, edge cases, things they refer
   elsewhere — proves they're not pretending to do everything)
7. 4-6 service-specific FAQs (NOT generic ones — address the real
   questions customers ask BEFORE they convert)
8. One earned detail or specific story integrated into section 1, 4, or 6

If a section has no source material, output:
   <!-- INSUFFICIENT SOURCE — needs operator follow-up: <what's missing> -->
and move on.

Do not pad. Do not invent processes, prices, or stories. Do not restate
USPs more than once per page.

Voice rules:
- No em dashes (—). Use commas, periods, parentheses, or rephrase.
- No AI tells: moreover, furthermore, leverage, robust, navigate (as
  verb), delve, harness, unleash, "in today's fast-paced world",
  "elevate your", "unlock the power of", "seamless experience",
  "comprehensive", "in essence", "let's dive into".
- {LOCALE_RULES}
- No italics anywhere.
- {ADDRESS_DISPLAY_RULES}

Output format: a JSON object with one key per section, each value being
the markdown body of that section. Empty sections that need follow-up
should still appear as keys with the INSUFFICIENT SOURCE marker as the
value.
```

## Customisation per project

- **`{SERVICE_NAME}`** — the service slug rendered as a heading-style label (e.g. "House removals", "Boiler servicing", "Wedding photography").
- **`{TRANSCRIPT}`** — operator interview / voice memo, focused on this service specifically.
- **`{STRUCTURED_FACTS_JSON}`** — the service facts object. Required keys: `whatsIncluded[]`, `whoItsFor[]`, `processSteps[]`, `pricingTiers[]`, `honestLimits[]`, `realExample`. Optional: `seasonalNotes`, `commonObjections`.

## Acceptance criteria

- All 8 sections present (with INSUFFICIENT SOURCE markers where needed)
- Word count target depends on the keyword research brief (top-3 average × 1.2). Marley's flagship service pages were 2,500–2,800w; smaller services 800–1,200w.
- No section invents
- One earned detail visible
- Honest limits section is non-empty (proves the operator picks their work)
- FAQs address pre-conversion questions, not post-purchase questions
- Locale + address-display rules respected
