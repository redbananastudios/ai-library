---
name: Train LoRA
description: Train a candidate LoRA using kohya_ss on Runpod Serverless
trigger: when a new LoRA is needed for subject consistency and dataset is validated
---

# Train LoRA

Train a candidate LoRA using kohya_ss on Runpod. The LoRA starts as `candidate` status and is only promoted to `approved` after a successful generation is approved by the user.

## Prerequisites

- Validated training set (via validate-training-set)
- Runpod API key: `RUNPOD_API_KEY`
- Training endpoint: `RUNPOD_TRAIN_ENDPOINT_ID`

## Training Configs by Budget Tier

### Low (10–20 min) — Quick Test
```yaml
network_rank: 16
network_alpha: 8
learning_rate: 1e-4
max_train_steps: 800
resolution: 512
batch_size: 1
```

### Standard (20–40 min) — Default
```yaml
network_rank: 32
network_alpha: 16
learning_rate: 5e-5
max_train_steps: 1500
resolution: 768
batch_size: 2
```

### High (40–90 min) — Key Assets
```yaml
network_rank: 64
network_alpha: 32
learning_rate: 3e-5
max_train_steps: 3000
resolution: 1024
batch_size: 2
```

## LoRA Classes

| Class | Use Case | Typical Subjects |
|-------|----------|-----------------|
| character | Face/identity consistency | Person, avatar |
| product | Product appearance | Taps, sinks, fixtures |
| style | Visual style transfer | Brand aesthetic, art direction |
| pose | Body pose consistency | Model poses (future) |
| environment | Scene consistency | Interiors, locations (future) |

## Training Flow

1. Receive validated dataset path and LoRA metadata
2. Select budget tier (default: standard; Claude picks based on asset importance)
3. Prepare training config JSON for kohya_ss
4. Upload dataset to Runpod (or reference volume path)
5. Submit training job
6. Poll for completion
7. Download trained .safetensors file
8. Save to `./ai-image-system/models/loras/{class}/{lora-id}.safetensors`
9. Register in lora-registry.json with status: `candidate`
10. Report to user — ready for test generation

## Registry Entry (Candidate)

```json
{
  "id": "{lora-id}",
  "class": "{class}",
  "brand": "{brand}",
  "subjects": ["..."],
  "base_model": "juggernaut_xl",
  "file_path": "./ai-image-system/models/loras/{class}/{lora-id}.safetensors",
  "status": "candidate",
  "default_weight": 0.7,
  "trained_date": "2026-04-20",
  "training_config": { ... },
  "dataset_path": "...",
  "dataset_image_count": 20,
  "notes": ""
}
```

## Important

- NEVER auto-promote a candidate LoRA. Only approve-output can do that.
- NEVER train without user consent or a clear need for subject consistency.
- Always validate the dataset first via validate-training-set.
