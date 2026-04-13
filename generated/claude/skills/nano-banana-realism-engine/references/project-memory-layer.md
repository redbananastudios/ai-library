# Project-Local Brand Memory Layer

This skill must not store mutable brand memory inside the skill bundle. Store it in the working folder of the project where the skill is being used.

## Default root

Use:

`./nano-banana-memory/`

If the host project already has a convention for memory or context folders, adapt to it, but keep the same internal file meanings.

## Recommended folder structure

```text
./nano-banana-memory/
├── brands/
│   └── <brand-slug>/
│       ├── brand-profile.md
│       ├── image-direction.md
│       ├── audience.md
│       ├── offers.md
│       ├── ad-constraints.md
│       └── forbidden-patterns.md
├── campaigns/
│   └── <campaign-slug>/
│       ├── brief.md
│       ├── concepts.md
│       └── learnings.md
└── shared/
    ├── approved-camera-tendencies.md
    ├── approved-lighting-tendencies.md
    └── global-negative-patterns.md
```

## File purposes

### brand-profile.md
Store:
- positioning
- market
- tone
- keywords
- product or service categories
- visual adjectives that fit the brand

### image-direction.md
Store:
- preferred environments
- preferred subject types
- preferred wardrobe or props
- preferred camera presets
- preferred lighting presets
- preferred composition tendencies

### audience.md
Store:
- core audiences
- pain points
- aspiration cues
- trust signals
- local or demographic notes if relevant

### offers.md
Store:
- active offers
- flagship products/services
- seasonal pushes
- proof points

### ad-constraints.md
Store:
- platform requirements
- compliance flags
- image-text restrictions
- banned claims
- operational notes the ad generator should respect

### forbidden-patterns.md
Store:
- visual clichés to avoid
- brand-inconsistent environments
- banned props
- banned color temperatures or polish levels
- overused ad angles to stop repeating

## How to populate the memory layer

When asked to create memory for a brand:
1. Create the folder structure if missing.
2. Create the six files for the brand.
3. Fill them with operational, reusable guidance.
4. Keep each file concise and update-friendly.
5. Prefer bullet points and short sections over prose.

## How to use the memory layer

Before generating prompts for a known brand:
1. Look for `./nano-banana-memory/brands/<brand-slug>/`.
2. Read the relevant brand files.
3. Use those constraints to steer hooks, headlines, environments, camera choices, and forbidden patterns.
4. Do not invent contradictions to stored memory unless the user explicitly overrides it.

## Minimal starter template

Use the templates in:
- [templates/brand-profile-template.md](../templates/brand-profile-template.md)
- [templates/image-direction-template.md](../templates/image-direction-template.md)
- [templates/audience-template.md](../templates/audience-template.md)
- [templates/offers-template.md](../templates/offers-template.md)
- [templates/ad-constraints-template.md](../templates/ad-constraints-template.md)
- [templates/forbidden-patterns-template.md](../templates/forbidden-patterns-template.md)

## Example brand slugs

- willow-and-weir
- marley-moves
- first-taxis
- red-banana-studios
