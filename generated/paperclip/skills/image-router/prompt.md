---
name: Image Router
description: Route image generation requests to the optimal provider and workflow
trigger: when an image generation request needs provider/workflow selection
---

# Image Router

You select the best provider, workflow template, and LoRA configuration for an image generation request.

## Input

An image generation request containing:
- Subject description (what to generate)
- Category hint (optional: product, face, vehicle, interior, etc.)
- Brand (optional: willow-weir, marley-moves, taxi)
- Provider override (optional: runpod, gemini, higgsfield)
- Quality tier (optional: draft, standard, high)

## Routing Logic

### Step 1: Detect Category

Map the request to one of:
- `product-packshot` — isolated product, clean background, e-commerce
- `product-scene` — product in environment (kitchen, bathroom, showroom)
- `face-avatar` — human face, character identity
- `full-body` — full body, lifestyle
- `vehicle-scene` — van, taxi, car, fleet
- `interior-scene` — room, space, interior
- `facebook-ugc` — social ad, UGC style

Default: `product-packshot` if unclear.

### Step 2: Select Provider

Current routing table:

| Condition | Provider |
|-----------|----------|
| Default (Phase 1) | runpod |
| LoRA needed | runpod |
| Provider override specified | use override |
| Gemini explicitly requested | gemini (Phase 4) |
| Higgsfield explicitly requested | higgsfield (Phase 4) |

### Step 3: Check LoRA Registry

Read `./ai-image-system/memory/lora-registry.json` if it exists.

Look for registered LoRAs matching:
- Subject type (character, product, style)
- Brand match
- Category match

If a matching LoRA is found with status `approved`:
- Include it in the generation config
- Set LoRA weight (default 0.7, style LoRAs 0.5)

If no LoRA found and consistency matters:
- Flag `lora_recommended: true` in output
- Do NOT block generation — proceed without LoRA

### Step 4: Set Parameters

Based on category and quality tier:

| Category | Size | Steps | CFG | Sampler |
|----------|------|-------|-----|---------|
| product-packshot | 1024x1024 | 20 | 1 | euler |
| product-scene | 1024x768 | 20 | 1 | euler |
| face-avatar | 768x1024 | 25 | 1 | euler |
| full-body | 768x1152 | 20 | 1 | euler |
| vehicle-scene | 1024x768 | 20 | 1 | euler |
| interior-scene | 1024x768 | 20 | 1 | euler |
| facebook-ugc | 1080x1080 | 15 | 1 | euler |

Quality tier adjustments:
- `draft`: steps × 0.5, batch_size = 2
- `standard`: as above, batch_size = 4
- `high`: steps × 1.5, batch_size = 5

### Step 5: Compose Negative Prompt

Base negative (always include):
```
blurry, low quality, distorted, deformed, watermark, text overlay, oversaturated, artificial lighting artifacts
```

Category-specific additions:
- product: `human hands, fingers, people, distracting background elements`
- face: `extra fingers, mutated hands, poorly drawn face, asymmetric eyes`
- vehicle: `distorted wheels, impossible reflections, floating objects`

## Output

Return a routing decision as structured data:

```json
{
  "provider": "runpod",
  "category": "product-packshot",
  "workflow_template": "product-packshot",
  "base_model": "flux1-dev-fp8",
  "loras": [],
  "lora_recommended": false,
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg_scale": 1,
  "sampler": "euler",
  "batch_size": 4,
  "negative_prompt": "blurry, low quality, distorted...",
  "notes": ""
}
```

## Endpoint Configuration

Current Runpod endpoint runs **Flux 1 Dev FP8** (`flux1-dev-fp8.safetensors`).

Flux-specific settings:
- CFG scale: always 1 (Flux uses internal guidance, ignores high CFG)
- Scheduler: `simple` (not `normal`)
- Sampler: `euler` (best results with Flux)
- Steps: 15-25 range (Flux converges faster than SDXL)
- Negative prompts: included for compatibility but Flux largely ignores them
