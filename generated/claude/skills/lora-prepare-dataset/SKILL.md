---
name: lora-prepare-dataset
description: Validate and prepare a LoRA training dataset — check image quality, count, resolution, consistency, duplicates, and produce a ready-for-training verdict. First step of the LoRA training pipeline.
trigger: prepare lora dataset, validate training images, check dataset for lora training
---
---
name: LoRA Prepare Dataset
description: Validate and prepare a LoRA training dataset for quality, consistency, and suitability
trigger: when a LoRA training pipeline needs to qualify a dataset before training begins
---

# LoRA Prepare Dataset

Validate that a training dataset meets minimum quality standards and, where safe, normalise it so training backends can consume it without surprises. This is the **first step** of the LoRA training pipeline and the gate that protects downstream compute cost.

Stay fully generic: operate only on the paths and parameters passed in. Never assume a project structure, a character, or a default dataset location.

## Inputs

| Name           | Required | Description |
|----------------|----------|-------------|
| `dataset_path` | yes      | Absolute path to a folder containing training images |
| `lora_class`   | yes      | `character` \| `product` \| `style` \| `pose` \| `environment` |
| `subject`      | yes      | Free-text description of the concept being trained (e.g. "chrome kitchen tap", "brand illustration style") |
| `output_path`  | yes      | Absolute folder where the validation report will be written. The skill writes `<output_path>/prepare_report.json`. (Used for consistency with the rest of the pipeline — the same folder ultimately holds the trained model, evaluation, and run metadata.) |
| `strict`       | no       | If true, any warning is escalated to a failure. Default: false |

## Responsibilities

1. Enumerate image files in `dataset_path` (PNG, JPG, JPEG, WEBP)
2. Check image count against the minimums for the declared class
3. Run per-image quality checks
4. Detect duplicates / near-duplicates
5. Check for caption files (`<image>.txt`) and report coverage
6. Emit a structured report with a pass / warning / fail verdict
7. Produce a recommendation the caller can act on

## What This Skill Does NOT Do

- Does **not** generate captions — that's `lora-caption-dataset`
- Does **not** train anything — that's `lora-train`
- Does **not** move or delete files without explicit user confirmation
- Does **not** assume dataset location, project, or brand

## Validation Rules

### Minimum Image Count by Class

| Class       | Minimum | Recommended |
|-------------|---------|-------------|
| character   | 10      | 15–25       |
| product     | 8       | 12–20       |
| style       | 15      | 20–30       |
| pose        | 12      | 20–30       |
| environment | 10      | 15–25       |

### Per-Image Checks

1. **Resolution** — minimum 512×512. 768+ recommended for SDXL/Flux training.
2. **Format** — PNG, JPG, JPEG, or WEBP. Must decode cleanly; corrupt files are rejected.
3. **Subject consistency** — flag images whose content appears unrelated to `subject` (heuristic: caption similarity, visual outlier detection if available).
4. **Duplication** — flag exact duplicates (hash match) and near-duplicates (>95% perceptual similarity). More than 20% near-duplicates degrades training.
5. **Cropping** — flag images where the subject occupies <30% of the frame or is badly cut off (<70% visible).
6. **Exposure / blur** — flag severely over- or underexposed images, and motion-blurred frames.

### Caption Coverage

- Count the number of images with a matching `.txt` caption file.
- Report coverage (0% is fine — downstream `lora-caption-dataset` will fill the gap).

## Output (JSON)

Write this to `<output_path>/prepare_report.json` and return the fields below to the caller.

```json
{
  "status": "pass" | "warning" | "fail",
  "dataset_path": "<absolute path>",
  "lora_class": "character",
  "subject": "…",
  "image_count": 18,
  "valid_images": 16,
  "rejected_images": 2,
  "caption_coverage": 0.0,
  "issues": [
    {"file": "img_04.jpg", "severity": "fail",    "reason": "Resolution too low (320x240)"},
    {"file": "img_12.jpg", "severity": "fail",    "reason": "Subject occupies <30% of frame"},
    {"file": "img_07.jpg", "severity": "warning", "reason": "Near-duplicate of img_08.jpg"}
  ],
  "warnings": [
    "No caption files found — run lora-caption-dataset next",
    "Consider adding 2–4 more images for a stronger character LoRA"
  ],
  "recommendation": "Remove 2 failed images and proceed. Caption dataset before training.",
  "ready_for_training": true
}
```

### Verdict Rules

- `pass` — image count meets minimum, no failed images. `ready_for_training: true`.
- `warning` — meets minimum but has fixable issues. `ready_for_training: true` unless `strict: true`.
- `fail` — below minimum image count after rejections, or critical quality problems. `ready_for_training: false`.

### Return Value (to the caller)

```json
{
  "status": "pass" | "warning" | "fail",
  "report_path": "<output_path>/prepare_report.json",
  "ready_for_training": true,
  "image_count": 18,
  "valid_images": 16,
  "error": null
}
```

## Decision Guide for the Caller

- `pass` → proceed to `lora-caption-dataset`
- `warning` → show the report to the user; proceed only after confirmation (or auto-proceed if the invoker trusts the warning policy)
- `fail` → stop. Report the reasons. Ask for an improved dataset.

## Safety Notes

- Never silently delete rejected images. List them in the report and let the caller (or user) remove them.
- Never overwrite the input folder in place — any normalisation writes to a sibling `prepared/` folder inside `dataset_path`.
- Never assume captions are accurate — caption validation is a different skill.
