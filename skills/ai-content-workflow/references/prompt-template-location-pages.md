# Prompt template — location pages

Strict template for AI-assisted location/area/town/city pages. Used after the operator's voice memo has been transcribed and structured into a `facts` object (see Rule 2 in the parent skill).

## The prompt

```
You are structuring a location page for {OPERATOR_NAME} in {TOWN}.

Source material (do not invent beyond this):
- Voice memo transcript: {TRANSCRIPT}
- Facts object: {STRUCTURED_FACTS_JSON}

Produce the page in the following sections, using ONLY information from
the source material:

1. Hero intro (3-4 sentences, naming distance from {OPERATOR_BASE}
   + route number + relevant postcode outcodes)
2. "Why us, here" (geographic context, named streets/areas)
3. "Routes, access & parking" (vehicle constraints, parking realities,
   any school-run / market-day timing)
4. "Property types we typically work with" (specific archetypes, not
   generic "all types")
5. "Local tips" (council references, parking permits, local quirks)
6. 4-5 location-specific FAQs (NOT generic ones)
7. The first-person anecdote, integrated naturally into one of the above
   sections (do not put it in a separate "About us" section)

If a section has no source material, output:
   <!-- INSUFFICIENT SOURCE — needs operator follow-up: <what's missing> -->
and move on.

Do not pad. Do not invent street names, prices, or anecdotes. Do not
restate USPs (insurance figures, fixed-price language, response time)
more than once per page — they belong in chrome (trust strip), not body
copy.

Voice rules:
- No em dashes (—). Use commas, periods, parentheses, or rephrase.
- No AI tells: moreover, furthermore, leverage, robust, navigate (as
  verb), delve, harness, unleash, "in today's fast-paced world", "elevate
  your", "unlock the power of", "seamless experience", "comprehensive",
  "in essence", "let's dive into".
- {LOCALE_RULES}  (e.g. "UK English: organise, colour, centre, neighbour")
- No italics anywhere.
- {ADDRESS_DISPLAY_RULES}  (e.g. "Refer to the operator's base as
  '{TOWN}, {OUTCODE}' — never the full street address. Full addresses
  are restricted to legal/contact pages and JSON-LD.")

Output format: a JSON object with one key per section, each value being
the markdown body of that section. Empty sections that need follow-up
should still appear as keys with the INSUFFICIENT SOURCE marker as the
value.
```

## Customisation per project

- **`{OPERATOR_NAME}`** — the brand name as it should appear in the page intro.
- **`{TOWN}`** — the town/city/area being written about.
- **`{OPERATOR_BASE}`** — the operator's base location, used for the "distance from" anchor.
- **`{TRANSCRIPT}`** — full voice memo transcript (or written notes).
- **`{STRUCTURED_FACTS_JSON}`** — the structured facts object (postcodes, distance, routes, named streets, parking notes, pricing band, real example).
- **`{LOCALE_RULES}`** — locale-specific spelling rules. UK English by default; replace with US/AU/etc. as needed.
- **`{ADDRESS_DISPLAY_RULES}`** — the project's address-display convention. For local services where the registered address ≠ recognised marketing location, the rule is "use recognised town + outward postcode in body copy; full address only in legal pages and JSON-LD".

## Acceptance criteria

The output passes if:

- All 7 sections present (with INSUFFICIENT SOURCE markers where needed)
- Word count 900–1050 (the area-page recipe target)
- No section invents a fact beyond the source material
- "Remove town name" test passes (find-and-replace town name with `[TOWN]`, page is still recognisably about that town from the road names, postcodes, property types, route descriptions, earned detail)
- No banned characters or AI tells
- Locale spelling rules respected
- Address-display rule respected
