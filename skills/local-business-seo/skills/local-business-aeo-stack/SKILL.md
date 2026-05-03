---
name: local-business-aeo-stack
description: Use when adding or auditing AI / LLM crawler optimisation (AEO) on a local service business site. Installs the four-part stack that earns citations from ChatGPT, Claude, Perplexity, Google AI Overviews, and Apple Intelligence — explicit AI crawler allowlist in robots.txt (GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-Web, Google-Extended, Applebot-Extended), generated llms.txt route (concise machine-readable summary), generated llms-full.txt route (full corpus), and global Person schema for E-E-A-T (the named owner with jobTitle and knowsAbout). Pairs with local-business-schema-graph which provides the JSON-LD helpers.
---

# local-business-aeo-stack

The "answer engine optimisation" stack: gets your content cited by
ChatGPT, Claude, Perplexity, Google's AI Overviews, and Apple
Intelligence. Four parts, all installed by this skill.

## When to use this

- Setting up AEO for the first time (the bootstrap skill installs the
  templates; this skill verifies they're correctly configured for the
  project)
- Auditing an existing site — checking the four parts are live
- Adding the AEO stack to a non-bootstrapped site (e.g. retrofitting)

## The four parts

### 1. Robots.txt with explicit AI crawler allowlist

`app/robots.ts` lists each AI crawler we want indexing the site.
Default `User-agent: *` is enough technically, but explicit `allow`
rules signal intent and protect against future bot default changes.

The 8 crawlers to allow:

| Bot | Operator | Why it matters |
|---|---|---|
| `GPTBot` | OpenAI | Trains GPT models |
| `OAI-SearchBot` | OpenAI | Indexes for ChatGPT search |
| `ChatGPT-User` | OpenAI | ChatGPT's browse-the-web at user request |
| `PerplexityBot` | Perplexity | Perplexity index |
| `ClaudeBot` | Anthropic | Trains Claude models |
| `Claude-Web` | Anthropic | Claude's browse-the-web |
| `Google-Extended` | Google | Bard/Gemini training (separate from search index) |
| `Applebot-Extended` | Apple | Apple Intelligence training |

Sample emit (from `app/robots.ts`, written by bootstrap):

```ts
{
  userAgent: 'GPTBot',
  allow: '/',
}
```

Verification: `curl https://yoursite.com/robots.txt | grep -E '(GPTBot|ClaudeBot|PerplexityBot)'`

### 2. /llms.txt route

Spec: https://llmstxt.org

Concise machine-readable summary of the site at `/llms.txt`. Generated
fresh each request from Sanity content (cached at the edge for 1h).
Contains:
- `# Brand` heading
- `> One-line summary`
- Phone, email, site URL
- `## Services` — bullet list with link + summary
- `## Areas covered` — bullet list with link + summary
- `## Insights` — top 30 articles
- `## Optional` — link to llms-full.txt

Bootstrap writes `app/llms.txt/route.ts`. This skill verifies it's
returning real content (not just placeholders).

Verification: `curl https://yoursite.com/llms.txt` — should be ~5KB
of plain markdown.

### 3. /llms-full.txt route

Full text corpus at `/llms-full.txt`. Same content as the site,
flattened to plain text for LLM consumption. Includes:
- Brand summary
- Every service with full body
- Every area with full body
- All FAQs
- All published insights with full body

Typical size: 50–500KB depending on site depth. Cached at the
edge for 1h, regenerated on each revalidation.

Bootstrap writes `app/llms-full.txt/route.ts`. This skill verifies
the Portable Text → plain conversion is producing readable output.

Verification: `curl https://yoursite.com/llms-full.txt | wc -c`
should be > 50000 for a real site with content.

### 4. Global Person schema for E-E-A-T

Already covered by `local-business-schema-graph`, called out here
because it's the AEO-relevant piece: AI engines weight content with
named-author Person entities higher than anonymous content. The
owner Person must:
- Be emitted globally (every page, not just /about) so the
  `Organization.founder` ref resolves everywhere
- Have a real `jobTitle` (Owner, Director, Lead Plumber)
- List 3–8 `knowsAbout` topics (the actual services / areas of
  expertise, not marketing fluff)
- Ideally include `image` and `bio`

Verification: visit the site, view source on any page, search for
`"@type":"Person"`. It should be present, with the owner's name,
jobTitle, knowsAbout array.

## Process — installing on a new project

If bootstrap was run, the templates are already in place. Verify each:

```bash
# 1. Robots
grep -E "GPTBot|ClaudeBot|PerplexityBot" web/app/robots.ts

# 2. llms.txt route exists and exports GET
ls web/app/llms.txt/route.ts && grep "export async function GET" web/app/llms.txt/route.ts

# 3. llms-full.txt route exists and exports GET
ls web/app/llms-full.txt/route.ts && grep "export async function GET" web/app/llms-full.txt/route.ts

# 4. Person emit in layout
grep -E "personSchema|getOwnerPerson" web/app/layout.tsx
```

All four should pass. If any fail, copy the missing template from
`local-business-site-bootstrap/templates/` or this skill's
`templates/` folder.

## Process — retrofitting onto an existing site

If you're adding AEO to a site that wasn't bootstrapped from this kit:

1. Read the existing `app/robots.ts` (or create one). Add the 8 AI
   crawler `allow` rules. Keep existing `disallow` rules.
2. Create `app/llms.txt/route.ts` — adapt the template to the
   project's data sources (might not be Sanity).
3. Create `app/llms-full.txt/route.ts` — same.
4. Add Person JSON-LD emission to the root layout. Source the owner
   data from wherever the project stores it.

Templates in this skill folder (`templates/`) are project-stack-agnostic
where possible; comment headers explain what to adapt.

## Off-site AEO (operator action, not code)

Code is half the AEO story. The other half is presence:

| Action | Owner | Priority |
|---|---|---|
| Bing Webmaster Tools — verify + sitemap submit | Operator | **Critical** — ChatGPT search uses Bing's index |
| GBP optimisation (run `gbp-optimise` skill) | Operator | High — drives Google's local entity |
| Trustpilot profile claimed + reviews mirrored | Operator | High — third-party validation |
| Industry directories (Checkatrade, Yell, etc.) | Operator | Medium — citations + NAP consistency |
| Reddit / Mumsnet / MoneySavingExpert presence | Operator | Medium — LLMs cite these heavily |

Pre-launch-checklist documents these as a separate operator track.

## Anti-patterns

- **Static llms.txt in `public/`** — goes stale. Always use a route
  that regenerates on each request.
- **Including `INDEXING_ENABLED` gate logic in robots.ts but
  forgetting llms.txt** — middleware in the bootstrap kit handles
  this (X-Robots-Tag on llms.txt path), but if retrofitting, make
  sure the noindex header lands on the text routes too.
- **Person schema only on /about** — breaks `Organization.founder`
  ref resolution on every other page.
- **Tracking IDs as separate Sanity doc but never wired in** —
  the `tracking` doc exists in Sanity but the GTM/GA4 script tags
  aren't actually emitted by any layout. Verify both ends.

## Lessons from the Marley rebuild (provenance)

- Marley shipped llms.txt (TASK 5 in session-pre-7) AND llms-full.txt
  (TASK 5 batch). The latter was added because LLMs were citing
  partial answers from llms.txt without finding the deep service
  pages — full-corpus exposure fixed this.
- The 8-crawler allowlist (TASK 8 in session 7) replaced an earlier
  reliance on `User-agent: *`. Marley specifically wanted Apple
  Intelligence inclusion for the Dorset/Somerset Apple-heavy
  customer base.
- Person schema was originally only on /about — broke
  Organization.founder ref on 67 other pages. Moved to global
  layout emit in TASK 2.
