# Changelog — lora-caption-dataset

## 0.1.0 (2026-04-21)
- Initial release as part of the generic LoRA training pipeline
- Captioner-agnostic: `blip2`, `florence-2`, `llava`, `manual`, `keep-existing`
- Class-specific templates (character / product / style / pose / environment)
- Trigger-token enforcement with consistent positioning
- Normalisation rules to strip filler and leaked identifiers
- Backup-on-overwrite safety
- `trigger_token` is optional — derived deterministically from `model_name` if not supplied
- Verdict vocabulary aligned with `lora-prepare-dataset`: `pass` / `warning` / `fail`
- Explicit "Return Value" contract for callers
