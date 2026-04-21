---
name: lora-train
description: Run a LoRA training job against a prepared and captioned dataset. Backend-agnostic (kohya_ss, sd-scripts, OneTrainer). Accepts config inputs, produces a candidate model file and run metadata.
---
# LoRA Train

Execute a LoRA training run. This is the **third step** of the LoRA training pipeline and the one that consumes real compute, so it is gated by dataset preparation and captioning.

Stay fully generic: the caller supplies the dataset, the output location, the backend, and credentials. This skill does not assume a specific project, GPU, vendor, or default path.

## Inputs

| Name              | Required | Description |
|-------------------|----------|-------------|
| `dataset_path`    | yes      | Absolute path to the prepared + captioned dataset |
| `output_path`     | yes      | Absolute folder where the trained `.safetensors` and run metadata will be written |
| `model_name`      | yes      | Base name for the output file (e.g. `willow-taps-v1`) |
| `trigger_token`   | yes      | Must match the token embedded in captions by `lora-caption-dataset`. Callers orchestrated via the `character_training` workflow should source this from `$steps.caption_dataset.output.trigger_token` — never type it independently, or captions and training will disagree. |
| `lora_class`      | yes      | `character` \| `product` \| `style` \| `pose` \| `environment` |
| `base_model`      | yes      | Identifier for the base model (e.g. `sdxl_base_1.0`, `flux1-dev`) |
| `backend`         | no       | `kohya_ss` \| `sd-scripts` \| `onetrainer`. Default: `kohya_ss` |
| `budget_tier`     | no       | `low` \| `standard` \| `high`. Default: `standard` |
| `config`          | no       | Arbitrary overrides on top of the chosen tier (rank, alpha, LR, steps, resolution, batch_size, etc.) |

## Responsibilities

1. Build a backend-specific training config from `budget_tier` + any `config` overrides
2. Submit the job to whichever backend the caller has configured (local GPU, hosted API, container, etc.)
3. Poll for completion and stream progress back to the caller
4. Download / move the resulting `.safetensors` file into `output_path`
5. Write run metadata next to it
6. Return a candidate status — never promote the model automatically

## What This Skill Does NOT Do

- Does **not** pick backends or credentials on its own — invoker supplies them via environment / config
- Does **not** validate the dataset — that's `lora-prepare-dataset`
- Does **not** evaluate the trained model — that's `lora-evaluate`
- Does **not** register or version the model in any registry — that's `lora-version`
- Does **not** auto-promote a candidate to approved. Promotion is an explicit human decision made elsewhere.

## Budget Tiers (Defaults)

These are starting points; every field can be overridden via `config`. Times are approximate, they depend heavily on dataset size, resolution, and hardware.

### Low — Quick Test (~10–20 min on an A100-class GPU)

```yaml
network_rank: 16
network_alpha: 8
learning_rate: 1e-4
max_train_steps: 800
resolution: 512
batch_size: 1
```

### Standard — Default (~20–40 min)

```yaml
network_rank: 32
network_alpha: 16
learning_rate: 5e-5
max_train_steps: 1500
resolution: 768
batch_size: 2
```

### High — Key Assets (~40–90 min)

```yaml
network_rank: 64
network_alpha: 32
learning_rate: 3e-5
max_train_steps: 3000
resolution: 1024
batch_size: 2
```

## Backend Contract

Every supported backend must expose a submit → poll → download flow. The caller's environment supplies the concrete endpoint + credentials.

| Backend      | Required Environment                                                      |
|--------------|---------------------------------------------------------------------------|
| `kohya_ss`   | A kohya_ss runner (local, Docker, or a serverless endpoint like Runpod)   |
| `sd-scripts` | A sd-scripts runner (local or hosted)                                     |
| `onetrainer` | A OneTrainer runner                                                       |

Environment variables the skill looks for (examples, not mandatory — invoker decides):

- `LORA_TRAIN_BACKEND_URL` — submit endpoint
- `LORA_TRAIN_BACKEND_KEY` — auth token
- `LORA_TRAIN_BACKEND_TIMEOUT` — max seconds before giving up

If credentials or endpoints are missing, fail fast with a clear message — do not silently fall back.

## Output

### Files written to `output_path`

```
{output_path}/
  {model_name}.safetensors           # the trained LoRA
  {model_name}.run.json              # run metadata (see below)
  {model_name}.training_config.json  # exact config submitted to the backend
  {model_name}.log                   # raw training log (if the backend returns one)
```

### Run Metadata (`{model_name}.run.json`)

```json
{
  "model_name": "willow-taps-v1",
  "status": "candidate",
  "lora_class": "product",
  "trigger_token": "rbsWillowTap",
  "base_model": "sdxl_base_1.0",
  "backend": "kohya_ss",
  "budget_tier": "standard",
  "trained_date": "2026-04-21T14:22:00Z",
  "dataset_path": "<absolute path>",
  "dataset_image_count": 18,
  "training_config": { "network_rank": 32, "network_alpha": 16, "...": "..." },
  "output_file": "<output_path>/willow-taps-v1.safetensors",
  "duration_seconds": 1842,
  "backend_job_id": "job-20260421-…",
  "notes": ""
}
```

### Return Value (to the caller)

```json
{
  "status": "ok" | "error",
  "model_path": "<output_path>/{model_name}.safetensors",
  "run_metadata_path": "<output_path>/{model_name}.run.json",
  "duration_seconds": 1842,
  "error": null
}
```

## Safety Notes

- Always write the output model with `status: "candidate"`. Promotion to `approved` happens through a separate, explicit process.
- Never train without an explicit user request or an orchestrator step that confirms the dataset is prepared and captioned.
- Never reuse an `output_path` that already contains a `.safetensors` of the same `model_name` without either: (a) a version bump, or (b) explicit overwrite confirmation.
- Never submit a training job if `dataset_image_count < minimum_for_class` (see `lora-prepare-dataset`).
- Never hardcode backend URLs or API keys into the config or metadata files.
