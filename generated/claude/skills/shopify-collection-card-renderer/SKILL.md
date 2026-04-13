---
name: shopify-collection-card-renderer
description: Generate consistent matching collection cards
---
---
name: shopify-collection-card-renderer
description: generate consistent matching cards for shopify collections by editing only the title text on the approved project-local baseline image. ensures no visual drift across the catalogue.
---

# Shopify Collection Card Renderer

Use the bundled approved image for the current project as the master template. Do not recreate the design with prompts or AI image generators. Do not redraw the border, divider, texture, or framing. Only replace the title text using an SVG/Python composition approach.

## 🚨 Standard Project Architecture: Brand Memory Structure
This skill relies on project-local overrides to stay consistent. Every project using this skill MUST have the following structure in its root directory:
- `./brand-memory/cards/reference-baseline.png` (The canonical approved master background)
- `./brand-memory/cards/spec.md` (The exact locked design rules for text placement, font, and uppercase rules)

If you are running this skill and `./brand-memory/cards/reference-baseline.png` is not found, **STOP and inform the user** that they must set up the `brand-memory/cards/` structure with a baseline image before this skill can execute.

## Core rule

Edit the approved master template only.

- Keep the exact same card artwork.
- Keep the exact same border, divider, texture, proportions, and page background from the baseline.
- Change only the centered title text.
- Never introduce a new variant.
- Never add icons.
- Never switch from dark to light or vice versa unexpectedly.
- Never alter aspect ratio or canvas size.

## Generation method

Write or use a script (e.g., `scripts/generate_card_svg.py`) that outputs PNG files by:
1. Loading the approved baseline PNG from `./brand-memory/cards/reference-baseline.png`.
2. Preserving the baseline unchanged (like an empty template or a fixed reference).
3. Covering ONLY the original title area.
4. Rendering the replacement title in the same locked position using the specs.
5. Saving a new PNG.

This is the preferred workflow because consistency matters more than regeneration.
If you ABSOLUTELY must redesign the baseline from scratch, use the **nano-banana-realism-engine** skill to do it (but NEVER do an AI generation when the user asks just for text replacements).

## Output rules

- Output PNG only.
- Uppercase the visible title (or follow `./brand-memory/cards/spec.md`).
- Preserve ampersands.
- Keep all geometry and ornament locked.
- Only shrink title size when required for longer names.
- Use lowercase kebab-case filenames ending with `-card.png` (e.g. `taps-and-mixers-card.png`).

## Acceptance check

Before returning output, verify:
- same canvas size as the master asset
- same border and divider placement as the master asset
- no new icon present
- only title text actually changed
