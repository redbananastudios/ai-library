---
name: select-lora
description: Match the best existing LoRA(s) from the project registry for a generation request. Considers subject type, brand, category, and approval history.
---
# Select LoRA

Find the best matching LoRA(s) from `./ai-image-system/memory/lora-registry.json` for a generation request.

## Registry Format

```json
{
  "loras": [
    {
      "id": "willow-weir-taps-v1",
      "class": "product",
      "brand": "willow-weir",
      "subjects": ["taps", "faucets", "chrome fixtures"],
      "base_model": "juggernaut_xl",
      "file_path": "./ai-image-system/models/loras/product/willow-weir-taps-v1.safetensors",
      "status": "approved",
      "default_weight": 0.7,
      "trained_date": "2026-04-20",
      "approved_date": "2026-04-21",
      "approved_job_id": "job-20260421-...",
      "notes": "Good for isolated chrome taps, slight over-saturation at weight > 0.8"
    }
  ]
}
```

## Selection Logic

1. Filter by `status == "approved"` only
2. Filter by `base_model` compatibility with current job
3. Score by relevance:
   - Subject keyword match (+3 per match)
   - Brand match (+5)
   - Class match (+2)
   - Recent approval (+1 if < 30 days)
4. Return top match(es) with suggested weights

## Output

```json
{
  "selected_loras": [
    {
      "id": "willow-weir-taps-v1",
      "weight": 0.7,
      "reason": "Brand match + subject match (taps)"
    }
  ],
  "lora_recommended": false,
  "notes": ""
}
```

If no match found: return empty `selected_loras` and set `lora_recommended: true` if subject consistency would benefit from one.
