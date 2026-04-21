# Changelog — lora-prepare-dataset

## 0.1.0 (2026-04-21)
- Initial release as part of the generic LoRA training pipeline
- Replaces and generalises the legacy `validate-training-set` skill (no hardcoded paths or project assumptions)
- Class-aware minimum image counts (character, product, style, pose, environment)
- Per-image checks: resolution, format, subject consistency, duplicates, cropping, exposure/blur
- Caption coverage reporting (coverage only — captioning itself lives in `lora-caption-dataset`)
- JSON report with pass / warning / fail verdict
- `output_path` is required and points to the same folder used by the rest of the pipeline — report written to `<output_path>/prepare_report.json`
- Explicit "Return Value" contract for callers (separate from the on-disk JSON report)
