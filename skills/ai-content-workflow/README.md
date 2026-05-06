# AI-Assisted Content Workflow

Six rules that gate every AI-assisted content draft so it reads like a real practitioner wrote it instead of templated AI output. Pairs with content-recipe skills (what good looks like) and content-audit skills (what bad looks like).

## What's in the box

```
ai-content-workflow/
├── prompt.md                                    ← the skill (invoked via Claude's Skill tool)
├── README.md                                    ← this file
├── CHANGELOG.md
├── source.json
├── spec.yaml
└── references/
    ├── prompt-template-location-pages.md        ← strict prompt for location/area pages
    └── prompt-template-service-pages.md         ← strict prompt for service/category pages
```

## The 6 rules

1. **Source first** — operator voice memo or transcript before any AI involvement.
2. **Structured facts object before prose** — facts feed JSON-LD AND inline copy, both read from same object.
3. **AI structures, never invents** — empty sections stay empty (`<!-- INSUFFICIENT SOURCE -->` marker), AI fills no gap with plausible generality.
4. **Verify against reality** — street names, postcodes, claims all checked before publish.
5. **One earned detail minimum per page** — specific story or operational detail that proves real practitioner knowledge.
6. **First-person posts start from real transcripts** — no AI-from-cold blog posts.

## When this skill applies

Beyond local SEO. Anywhere the cost of a hallucinated fact is high and the value of operator-supplied detail is high:

- Location pages, service pages, category pages
- Blog posts / insights / case studies
- Product descriptions where origin / material / dimension specifics matter
- FAQ answers
- About / process / how-it-works pages
- Email sequences (when the operator's voice matters)

## When it doesn't

- Throwaway social posts
- Translation of existing operator content
- Pure SEO meta (titles, descriptions)

## Pairings

- **`local-business-area-page-enricher`** — defines the area-page recipe (what to include); this skill says how to get there.
- **`local-business-content-audit`** — catches AI-tell text patterns AFTER drafting; this skill prevents hallucinated facts BEFORE drafting.
- **`dataforseo-keyword-pipeline`** — the per-page brief tells you what topics/schemas/word count the page needs.

## Provenance

Distilled from Marley Moves' AEO handoff (TASK 9 of `marley-moves-aeo-handoff.md`). Marley exemplar: the Shaftesbury town page (Bell Street, Gold Hill, the 1920s grand piano anecdote, real prices, "not BAR registered" disclosure). Workflow enforced via project CLAUDE.md plus a re-runnable audit script (`audit-town-content-vs-shaftesbury-bar.mjs`) that scores each page 0–8 against the recipe.
