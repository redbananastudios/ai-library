---
name: shopify-product-enrich
description: enrich raw product json for SEO, AEO, and shopify-ready structure using project-local brand voice. use when raw.json has already been created.
---

# Shopify Product Content Enrichment

Enrich raw product data according to the current project's brand voice.

This skill sits after raw extraction and before page composition / Shopify publishing.
It reads `raw.json`, applies the project-local brand voice, improves content quality for SEO and AI readability, and writes `enriched.json`.

## 🚨 Standard Project Architecture: Brand Memory Structure
This skill relies on project-local overrides to keep the brand's tone unique. Every project using this skill MUST have the following file in its root directory:
- `./brand-memory/brand-voice.md`

If this file is missing, **STOP and inform the user** that they must set up `./brand-memory/brand-voice.md` before this skill can execute. Defaulting to generic tones ruins brand consistency. You may also consult `./schemas/enriched-product.schema.json` if the project requires a strict output format.

## Processing modes
- **Single:** A single product folder path (e.g., `output/product-slug-sku/`)
- **Batch:** The word `all` or `batch`. Process every `output/*/raw.json` found.
In batch mode, continue processing other products if one fails, and report failures at the end.

## Source priority

When deciding what to write, use this priority:
1. explicit facts from `raw.json`
2. structured technical/specification data in `raw.json`
3. `./brand-memory/brand-voice.md`
4. default section rules in this skill
Never invent product facts to fill gaps.

## Step 1: Load brand voice
Read `./brand-memory/brand-voice.md`. Use it as the ultimate authority for tone, style, formatting, and SEO conventions. 
Use British English throughout unless the brand voice explicitly demands US English.

## Step 2: Read raw.json
For each product folder, read `raw.json` and inspect its identity, metadata, attributes, and content.

## Step 3: Gating checks
Skip the product if:
- `validation.has_title` or `has_description` is false
- `identity.our_sku` or `our_product_name` is missing

Soft warning rules (continue but warn):
- description is very short, only 1 image available, no datasheets, specs are sparse, pricing missing.

## Step 4: Build enriched identity and SEO block
Generate these fields:
- `our_sku` / `our_product_name` — carry forward
- `slug` and `shopify_handle` — generate from `our_product_name` (lowercase, hyphens, strip chars)
- `shopify_title` — append useful differentiators (size, finish, material). Under 70 chars. No keyword stuffing.
- `meta_title` — follow `./brand-memory/brand-voice.md`. Default: `"{Product Name} | {Brand Name}"`
- `meta_description` — 150-160 chars, benefit-led, one/two differentiators.
- `answer_first_summary` (AEO) — 1-2 sentences answering what it is and why it's useful.

## Step 5: Build section model
Create only strong sections. Do not enable sections with weak/invented content. Each section gets `enabled`, `content`, and optional `notes`.

- **5a: overview** (2-4 sentences, rewrite in brand voice, don't copy supplier)
- **5b: key_features** (3-6 bullets, one sentence each, customer value first)
- **5c: specifications** (preserve factual info, clean labels, prefer structured key/value, NEVER invent values)
- **5d: whats_included** (clean wording, no assumed parts)
- **5e: care_and_maintenance** (rewrite if raw docs have care info)
- **5f: installation_notes** (include only if explicitly supported by raw content)
- **5g: compatibility** (stay factual on required parts)
- **5h: delivery** (use specific raw info, otherwise use fallback from `brand-voice.md`)
- **5i: downloads** (create clear labels for PDFs)
- **5j: faq** (only if raw content provides real Q&A material)

## Step 6: Images and alt text
- rewrite `alt_text` for accessibility and SEO. Include the product name naturally. Target under 125 chars.
- (If any image processing or generic scene planning is needed, use the **nano-banana-realism-engine** skill natively, but do NOT execute API image generation requests during simple enrichment.)

## Step 7: Carry forward & Shopify block
- `metadata`: pass through `colour`, `type`, `category_1/2/3` unchanged.
- `shopify`: `shopify_gid` to null, `price`, `cost_per_item`, `sku`, `taxable` false, `product_type`, `vendor`, `tags` (5-10 hyphenated factual tags), `status` to draft.

## Step 8: Validation block & Output
Add `validation` block (`sections_enabled`, warnings, etc.).
Write valid JSON to `<product-folder>/enriched.json`.

## Quality bar
- Cleaner and more useful than source.
- Formatted exactly for Shopify and AI retrieval.
- Grounded exactly in raw facts. Zero hallucinations.
