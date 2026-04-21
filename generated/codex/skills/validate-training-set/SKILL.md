---
name: validate-training-set
description: Validate a LoRA training dataset for quality, consistency, resolution, and suitability before training begins. Rejects weak datasets with clear reasons.
---
# Validate Training Set

Check a training dataset meets minimum quality standards before LoRA training begins.

## Input

- Path to training set folder (e.g., `./ai-image-system/inputs/training-sets/{name}/`)
- Target LoRA class (character, product, style)
- Target subject description

## Validation Rules

### Minimum Image Count

| Class | Minimum | Recommended |
|-------|---------|-------------|
| character | 10 | 15–25 |
| product | 8 | 12–20 |
| style | 15 | 20–30 |

### Quality Checks

1. **Resolution**: All images must be at least 512x512. Recommended 768+ for SDXL training.
2. **Format**: PNG or JPG. No corrupt files.
3. **Subject consistency**: All images should contain the same subject/concept. Flag outliers.
4. **Duplication**: No more than 20% near-duplicates. Flag exact duplicates.
5. **Cropping**: No images where the subject is cut off badly (< 70% of subject visible).
6. **Mixed concepts**: Reject if images contain unrelated subjects mixed together.
7. **Lighting/quality**: Flag images that are severely over/underexposed, motion-blurred, or very low quality.

### Metadata Check

- Each image should ideally have a caption/tag file (`.txt` with same name)
- If no captions exist, flag as warning (not blocking — auto-captioning can be applied)

## Output

```json
{
  "status": "pass" | "fail" | "warning",
  "image_count": 18,
  "valid_images": 16,
  "rejected_images": 2,
  "issues": [
    {"file": "img_04.jpg", "reason": "Resolution too low (320x240)"},
    {"file": "img_12.jpg", "reason": "Subject not visible / bad crop"}
  ],
  "warnings": [
    "No caption files found — auto-captioning recommended",
    "2 images are near-duplicates (img_07.jpg, img_08.jpg)"
  ],
  "recommendation": "Dataset passes minimum requirements. Remove 2 flagged images and proceed with training.",
  "ready_for_training": true
}
```

## Decision

- If `status: pass` → ready for train-lora
- If `status: warning` → inform user of issues, proceed if they confirm
- If `status: fail` → reject dataset, explain what needs fixing, ask for improved set
