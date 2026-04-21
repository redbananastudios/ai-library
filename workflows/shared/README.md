# Shared Data Contract

Defines the canonical shared context fields that flow between workflow steps. Keeps outputs consistent across workflows so steps remain composable.

## Goal

Consistent field names, clean handoff. Not strict validation, not a type system — just a convention every workflow follows so `image_url` means the same thing in `social_post` as it does in `ad_variants`.

## Canonical Shared Context

These are the fields used across **two or more** workflows. Workflow-specific fields (e.g. `keyword_set`, `blog_package`, `variants`, `performance_ranking`) are defined in the individual workflow YAMLs and layer on top of this core.

```json
{
  "brand": "",
  "campaign_goal": "",
  "concept": {
    "angle": "",
    "emotion": "",
    "hook": "",
    "audience": "",
    "objective": ""
  },
  "image_prompt": "",
  "image_url": "",
  "caption": "",
  "cta": ""
}
```

## Field Reference

| Field               | Type   | Purpose                                                       |
| ------------------- | ------ | ------------------------------------------------------------- |
| `brand`             | string | Brand identifier (e.g. `"Red Banana Studios"`, `"Bex"`)       |
| `campaign_goal`     | string | High-level objective for this run (e.g. `"launch awareness"`) |
| `concept`           | object | The creative nucleus — all downstream outputs derive from it  |
| `concept.angle`     | string | The narrative angle or POV                                    |
| `concept.emotion`   | string | Target emotional response                                     |
| `concept.hook`      | string | The attention-grabbing opener                                 |
| `concept.audience`  | string | Who this is for                                               |
| `concept.objective` | string | What this specific piece should achieve                       |
| `image_prompt`      | string | Prompt passed to image generation                             |
| `image_url`         | string | URL or path to the generated image                            |
| `caption`           | string | Body copy (social caption, email body, blog intro, etc.)      |
| `cta`               | string | Call-to-action text                                           |

Multi-variant workflows (e.g. `ad_variants`) use array forms of these fields — `concepts` (array of concept objects), `image_prompts`, `image_urls`, etc. The element shape matches the canonical singular.

## Naming Conventions

- **snake_case** for all field names
- **lowercase** values for enum-like fields (e.g. `platform: "linkedin"`, not `"LinkedIn"`)
- **ISO 8601** for dates (e.g. `"2026-04-21"`)
- **arrays over comma-separated strings** for lists

## Reading and Writing

Each workflow step:

- **Reads** from the shared context via `$input.<field>` or `$steps.<prior-step-id>.output`
- **Writes** its result back under the key declared in its `output:` field

Example:

```yaml
steps:
  - id: build_image_prompt
    skill: image-blueprint
    input:
      concept: $input.concept
      brand: $input.brand
    output: image_prompt             # writes to shared context as `image_prompt`

  - id: generate_image
    skill: generate-image
    input:
      prompt: $steps.build_image_prompt.output
    output: image_url
```

## Rules of Thumb for Step Design

1. **Pure where possible.** Same input → same output. Side effects (publishing, writing to external systems) belong to dedicated steps, not core generation steps.
2. **Don't assume order beyond declared dependencies.** If a step needs `image_url`, it should declare that via `$steps.generate_image.output`, not rely on "step 3 ran first."
3. **Emit structured data.** Prefer objects over freeform strings where downstream steps need to parse.
4. **Outputs must match declarations.** A workflow's top-level `outputs:` field should only list keys that are actually written by one of its steps (directly or via an assembly step). Declaring an output that no step produces is a contract violation.
5. **Fail loudly on missing required input.** A runtime should refuse to run if a step's referenced input is absent from the shared context.
