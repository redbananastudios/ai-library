# Output Format

Use this default response structure unless the host system or user asks for JSON.

## Standard markdown structure

### Assumptions
- Only include this section if you had to infer missing facts.
- Keep to 1 to 4 bullets.

### Shared creative direction
- Audience:
- Objective:
- Platform:
- Visual tone:
- Aspect ratio:
- Suggested camera mix:
- Suggested lighting mix:
- Optional shared negative prompt:

### Concept 1 — <name>
- Audience moment:
- Hook:
- Headline:
- Visual strategy:
- Camera + lighting:
- Final prompt:
- Optional negative prompt:
- Why this works:

Repeat for 3 to 5 concepts.

## Prompt-writing standard

The final prompt should be one dense, copy-ready block that includes:
- subject
- environment
- action
- camera model or camera feel
- lens
- aperture or exposure feel
- lighting
- composition
- imperfections
- realism constraints
- platform intent if useful

## Concision rules

- Hooks should be short.
- Headlines should be short.
- Why-this-works should be 1 to 3 bullets or 1 short paragraph.
- Do not bury the final prompt in explanation.

## If the user wants prompt-only mode

Return:
- concept name
- final prompt
- optional negative prompt
- one-line rationale
