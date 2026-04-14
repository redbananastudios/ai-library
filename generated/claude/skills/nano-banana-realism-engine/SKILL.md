---
name: nano-banana-realism-engine
description: Generate photorealistic image concepts and create them via Gemini API
---
---
name: nano-banana-realism-engine
description: generate photorealistic prompts and creative packages for people, products, facebook ads, ugc scenes, interiors, vehicles, moving scenes, and general commercial imagery. use when an agent must create 3 to 5 realistic image concepts, hooks, headlines, a b variations, camera and lighting setups, or a project-local brand memory layer for reusable visual direction.
---

Build image-generation prompts that look like real photography, not synthetic renders.

## Workflow

Follow this sequence:

1. Classify the request.
   - **Prompt mode**: the user wants image prompts only.
   - **Ad engine v2 mode**: the user wants hooks, headlines, image prompts, and A/B variants.
   - **Brand memory mode**: the user wants you to create, update, or use a project-local brand memory layer in the current working folder.

2. Gather or infer the brief.
   - If the brief is missing critical facts, ask concise questions.
   - If the user wants speed, infer sensible defaults and state them briefly.
   - Always determine: subject, offer or objective, audience, platform, tone, environment, realism level, and output count.

3. Read the reusable references that fit the task:
   - camera selection: [references/camera-presets.md](references/camera-presets.md)
   - lighting strategy: [references/lighting-presets.md](references/lighting-presets.md)
   - anti-ai realism constraints: [references/realism-rules.md](references/realism-rules.md)
   - framing and staging: [references/composition.md](references/composition.md)
   - facebook ad specifics: [references/facebook-ads.md](references/facebook-ads.md)
   - ad package structure: [references/ad-engine-v2.md](references/ad-engine-v2.md)
   - project-local memory conventions: [references/project-memory-layer.md](references/project-memory-layer.md)
   - output structure: [references/output-format.md](references/output-format.md)

4. Generate 3 to 5 distinct concepts.
   - Vary angle, environment, story beat, and emotional hook.
   - Keep the core offer and audience consistent across variants.
   - Do not output trivial rephrases.

5. Enforce realism.
   - Apply one camera preset per concept.
   - Apply one lighting preset per concept.
   - Inject realistic imperfection.
   - Ban glossy CGI language, overdesigned symmetry, and impossible product handling.

6. If in ad engine v2 mode, also generate hooks, headlines, and split-test variants.

7. If in brand memory mode, create or update files in the working folder using the project-local structure from [references/project-memory-layer.md](references/project-memory-layer.md). Never store mutable brand data inside the skill bundle.

## Core prompt formula

Build each prompt from this stack:

**subject + setting + action + audience cue + camera + lens + exposure feel + lighting + composition + imperfections + realism constraints + platform intent**

## Hard rules

- Always produce **3 to 5** strong variants unless the user requests a different count.
- Prioritize plausibility over beauty.
- Use camera and lighting language that corresponds to real photography.
- Add small imperfections intentionally.
- Avoid stock-photo stiffness.
- Avoid text inside the image unless the user explicitly wants text rendered.
- Avoid references to “ai”, “render”, “3d”, “octane”, “unreal”, “hyperreal”, or similar synthetic cues.
- For faces, preserve natural asymmetry, pores, stray hairs, and believable expressions.
- For products, preserve realistic scale, materials, reflections, wear, and handling.
- For ads, prefer in-use scenes and specific audience situations over generic studio hero shots.

## Anti-Impossibility Constraints (Prevent AI Physics Errors)

AI models frequently violate physical laws — floating furniture, impossible geometry, disconnected structures, see-through solid objects, broken perspective. Before generating any prompt, validate these constraints:

**1. Grounding & Contact**
- All objects meant to be grounded (furniture, people standing, structures) must have visible, continuous contact with their supporting surface
- No floating, hovering, or levitating objects
- Example: Kitchen cabinetry sits flush against floor with solid plinth, no visible gap between base and floor

**2. Structural Integrity**
- Visible support for all load-bearing structures (no floating tops, unsupported cantilevers)
- Multi-part objects must have complete, connected bases — not fragmented or transparent at contact points
- Example: Worktop supported along full length, no floating edges

**3. Material Opacity**
- Solid opaque objects cannot have other objects visible through or beneath them
- Surfaces cannot penetrate each other (floor doesn't show through cabinetry, walls don't intersect furniture)
- Example: Opaque cabinet bases with no visible floor beneath or behind units

**4. Perspective Consistency**
- Vanishing points must be consistent throughout frame
- Parallel lines remain parallel or converge correctly
- Depth cues align (shadows, overlap, scale)

**5. Anatomical & Functional Correctness**
- Objects with standard forms (fixtures, furniture) must match real-world specifications
- No fused components (taps with 2 spouts rendered as 1, furniture legs merged, handles fused)
- All expected parts present and distinct

**Prompt Integration — When Writing Final Prompts, Add These Patterns:**

- For furniture: `"[object] sitting flush against [surface] with solid plinth/base, no gap between cabinets and floor"`
- For fixtures: `"distinct separate spouts/handles with visible mechanical joints, no fused components"`
- For worktops: `"supported along full length, no unsupported overhang or floating edges"`
- For people: `"standing firmly on [surface], feet making full contact"`

**Negative Constraints to Always Include (Naturally Phrased):**
```
no floating [object]
no visible [surface] beneath [object]
no impossible geometry
no disconnected parts
no fused components
no unsupported edges
```

## Request intake checklist

Before generating, capture these if available:
- business or brand name
- product, service, or offer
- target audience
- location or market
- platform
- objective: awareness, click-through, lead, purchase, retargeting, or catalog
- visual tone: luxury, premium, everyday, documentary, working-class, playful, clinical, etc.
- image category: people, product, ad, ugc, interior, taxi or vehicle, moving scene, before/after, or mixed
- constraints: aspect ratio, number of people, ethnicity mix, wardrobe, props, text-free requirement, compliance needs

## Output behavior

Use the structure in [references/output-format.md](references/output-format.md).

Default deliverable:
- short assumptions block if needed
- 3 to 5 concept sections
- each section includes a concept label, hook, headline, visual strategy, and final copy-ready image prompt
- include a concise “why this works” note
- if negative prompts are useful for the target model, include a short negative prompt line

## Ad engine v2 behavior

When the user asks for ads, ad creatives, creative tests, facebook images, meta ads, or campaign concepts:

1. Read [references/ad-engine-v2.md](references/ad-engine-v2.md).
2. For each concept, generate:
   - one hook
   - one headline
   - one primary image prompt
   - one alternate A/B image prompt that tests a different angle while preserving the same offer
3. Keep hooks and headlines short enough to be used in ad workflows.
4. Make each test meaningfully different:
   - people-first vs product-first
   - candid vs commercial
   - indoor vs outdoor
   - premium vs approachable
   - problem-aware vs aspiration-led

## Brand memory layer behavior

When the user asks for consistency across brands, reusable brand styles, or a memory layer:

1. Read [references/project-memory-layer.md](references/project-memory-layer.md).
2. Store memory in the **current project working folder**, not in this skill.
3. Preferred root folder:
   - `./nano-banana-memory/`
4. If write access exists, create or update the files.
5. If write access does not exist, output the exact files and contents the user should place in the working folder.
6. Keep memory factual and operational:
   - brand positioning
   - audience
   - approved camera tendencies
   - approved lighting tendencies
   - approved environments
   - forbidden visual patterns
   - recurring products or props
   - ad-safe constraints
7. Do not bloat memory with generated campaign ideas unless asked.

## External-agent compatibility

This skill is designed to be readable by ChatGPT, Claude, Paperclip, Codex, and similar agents.

When used outside ChatGPT:
- treat the markdown references as the instruction source of truth
- keep outputs plain markdown unless the host system requires JSON
- if the host system supports filesystem access, use the project-local memory conventions directly

## Quick examples

**Input**
Create Facebook ad concepts for a removals company targeting families moving house in Manchester.

**Behavior**
- choose ad engine v2 mode
- apply facebook ad rules
- produce 3 to 5 hooks, headlines, prompts, and A/B variants
- bias toward candid family-moving realism

**Input**
Set up the brand memory layer for Willow & Weir inside this project.

**Behavior**
- choose brand memory mode
- create the working-folder memory structure
- populate brand profile and visual direction files
- do not save those files inside the skill bundle

## Media Execution — Higgsfield Browser (Primary)

When the user requests actual image or video files, use the **Higgsfield** browser interface as the primary execution path. Higgsfield provides access to 15+ premium AI image models with the best photorealistic results.

### Route 1: Higgsfield Browser (Primary)
Always use the `higgsfield` skill for image generation. Higgsfield offers:
- **Photo-realistic people, fashion, lifestyle** → Seedream 5.0
- **General purpose, fast turnaround** → Nano Banana 2.5
- **Creative editing, reference images, object swaps** → Nano Banana Pro
- **Text rendered inside images (logos, signs, posters)** → FLUX.2 Pro / Max
- **Anime, illustration, stylized art** → WAN 2.5 or Reve
- **Concept art, mixed media, strict prompt accuracy** → Reve
- **Character consistency across multiple images** → Soul 2.0
- **Context-aware generation, consistent characters** → FLUX Kontext
- **Highest possible photorealism, complex composition** → Seedream 5.0 or GPT Image

**Automatic model selection table:**

| Task | Best Model | URL Slug |
|------|-----------|----------|
| Photo-realistic people, fashion, lifestyle | Seedream 5.0 | `seedream_5` |
| General purpose, fast turnaround | Nano Banana 2.5 | `nano_banana_2` |
| Creative editing, reference images, object swaps | Nano Banana Pro | `nano_banana_pro` |
| Text rendered inside images (logos, signs, posters) | FLUX.2 Pro / Max | `flux_2_pro` / `flux_2_max` |
| Anime, illustration, stylized art | WAN 2.5 or Reve | `wan_2_5` / `reve` |
| Concept art, mixed media, strict prompt accuracy | Reve | `reve` |
| Character consistency across multiple images | Soul 2.0 | `soul_2` |
| Context-aware generation, consistent characters | FLUX Kontext | `flux_kontext` |
| Highest possible photorealism, complex composition | Seedream 5.0 or GPT Image | `seedream_5` / `gpt_image` |
| 4K+ resolution or inpainting / editing tools | Any model on Higgsfield | — |

When using Higgsfield, follow the full `higgsfield` skill workflow (browser navigation, settings, prompt entry, generation, download).

### Route 2: Nano Banana CLI (Future - API Access Pending)
Once Nano Banana API access is available, the CLI will support:
- **Video generation** (Veo 3.1) — cinematic video creation
- **Image editing** on existing files (`--file`)
- **Fast batch generation** for general-purpose requests

### Route 3: Native `generate_image` Tool (Last Resort)
If Higgsfield is unavailable, use your environment's native `generate_image` tool as a fallback.

### Routing Decision
Apply this priority (current state):
1. **Always use Higgsfield** for all image generation requests
2. If the user wants video → Inform them this is coming (Veo 3.1 via CLI, pending API access)
3. If Higgsfield is unavailable → **Native tool fallback**

*Future routing (once Nano Banana API access is enabled):*
1. If the user wants video → Nano Banana CLI (Veo 3.1)
2. If the user wants image editing → Nano Banana CLI
3. All other image generation → Higgsfield

