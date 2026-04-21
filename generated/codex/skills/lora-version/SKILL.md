---
name: lora-version
description: Version a trained and evaluated LoRA — resolve the final model name, write a registry entry, and assemble full run metadata (dataset + config + evaluation + lineage). Final step of the LoRA training pipeline.
---
# LoRA Version

Finalise a trained and evaluated LoRA: resolve the version suffix, write a registry entry, and produce a consolidated run report that ties the model back to the dataset, config, and evaluation. This is the **fifth and final step** of the LoRA training pipeline.

Stay fully generic: no hardcoded registry location, no project-specific naming, no default folders. The caller supplies the registry path.

## Inputs

| Name                   | Required | Description |
|------------------------|----------|-------------|
| `model_path`           | yes      | Absolute path to the candidate `.safetensors` |
| `run_metadata_path`    | yes      | Absolute path to `{model_name}.run.json` from `lora-train` |
| `evaluation_path`      | yes      | Absolute path to `evaluation.json` from `lora-evaluate` |
| `registry_path`        | yes      | Absolute path to the LoRA registry JSON file the caller maintains. Will be created if it doesn't exist. |
| `version_strategy`     | no       | `semver` \| `date` \| `increment`. Default: `increment` |
| `tags`                 | no       | Array of free-text tags to attach to the registry entry |
| `notes`                | no       | Free-text notes to store with the entry |
| `initial_status`       | no       | `candidate` (default) or `approved`. Most callers should leave as `candidate`; `approved` is only safe when a human has already signed off. |

## Responsibilities

1. Read the two input JSONs and the registry (create if missing)
2. Derive the final model identifier using `version_strategy`
3. If the final id differs from the current filename, rename the `.safetensors` (and its sibling metadata files) accordingly
4. Build the registry entry — a full denormalised record that is portable on its own
5. Append or update the entry in the registry
6. Write a consolidated run report (markdown) next to the model
7. Return the final id, the registry entry, and the paths

## What This Skill Does NOT Do

- Does **not** train or evaluate — those are prior steps
- Does **not** publish the model anywhere
- Does **not** auto-promote to `approved` unless the caller explicitly passes `initial_status: approved`
- Does **not** assume a registry schema beyond the one documented below — if the registry already exists and has extra fields, they are preserved

## Version Strategies

| Strategy     | Behaviour                                                                 |
|--------------|---------------------------------------------------------------------------|
| `semver`     | `{model_name}-v{major}.{minor}.{patch}`. New runs bump patch by default. |
| `date`       | `{model_name}-{YYYYMMDD}`. If collision, appends `-{n}`.                 |
| `increment`  | `{model_name}-v{n}`. Scans the registry for the highest existing `n`.    |

If the resolved id already exists in the registry and does NOT point to the same `.safetensors` file, fail — never silently overwrite.

## Registry Schema

The registry is a single JSON file maintained by the caller. The shape:

```json
{
  "version": 1,
  "loras": [
    {
      "id": "willow-taps-v1",
      "status": "candidate",
      "lora_class": "product",
      "trigger_token": "rbsWillowTap",
      "subject": "willow-weir chrome taps",
      "base_model": "sdxl_base_1.0",
      "file_path": "/abs/path/to/willow-taps-v1.safetensors",
      "default_weight": 0.7,
      "trained_date": "2026-04-21T14:22:00Z",
      "versioned_date": "2026-04-21T15:10:00Z",
      "dataset_path": "/abs/path/to/dataset",
      "dataset_image_count": 18,
      "training_config": { "network_rank": 32, "...": "..." },
      "backend": "kohya_ss",
      "budget_tier": "standard",
      "evaluation": {
        "status": "pass",
        "scores": { "consistency": 0.82, "fidelity": 0.79, "overfitting": 0.71, "artefacts": 0.80 },
        "recommended_weight": 0.7,
        "path": "/abs/path/to/evaluation.json"
      },
      "tags": ["willow-weir", "taps", "chrome"],
      "notes": "",
      "lineage": {
        "parent_id": null,
        "dataset_hash": "sha256:…",
        "config_hash": "sha256:…"
      }
    }
  ]
}
```

## Derived Fields

- `default_weight` — read from `evaluation.recommended_weight`
- `dataset_hash` — SHA-256 of the sorted list of (filename, size, mtime) tuples in `dataset_path`
- `config_hash` — SHA-256 of the canonicalised `training_config` JSON
- `trained_date`, `trigger_token`, `base_model`, `backend`, `budget_tier` — from `run_metadata_path`
- `status` — defaults to `candidate`; only `approved` if `initial_status: approved` was passed explicitly

## Output

### Written

```
{dirname(model_path)}/
  {final_id}.safetensors              # renamed from the input if needed
  {final_id}.run.json                 # renamed / updated
  {final_id}.training_config.json     # renamed
  {final_id}.evaluation.json          # copy of the evaluation for co-location
  {final_id}.run.md                   # consolidated human-readable report
{registry_path}                       # updated
```

### Returned

```json
{
  "status": "ok" | "error",
  "final_id": "willow-taps-v1",
  "registry_entry": { "...": "..." },
  "model_path": "/abs/path/to/willow-taps-v1.safetensors",
  "registry_path": "<registry_path>",
  "report_path": "<dirname>/{final_id}.run.md",
  "error": null
}
```

## Consolidated Run Report (`{final_id}.run.md`)

A human-readable summary that combines dataset stats, training config, evaluation scores, and any notes. One page, scannable. Used for sharing run results without digging through JSON.

## Safety Notes

- Never overwrite an existing registry entry that points to a different file.
- Never delete the old file when renaming — rename in place, preserving the original inode / filesystem semantics.
- Never promote to `approved` implicitly. That lives outside this skill.
- If the registry is malformed or a different schema, stop and report — do not try to "fix" it.
- Treat the registry as append-mostly. Edits to existing entries should be limited to `status`, `default_weight`, and `notes`.
